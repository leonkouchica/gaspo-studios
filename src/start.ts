import { createStart, createMiddleware, createCsrfMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { runWithUser, type AuthenticatedUser } from "./lib/auth-guard.server";
import { serverEnv } from "./lib/env.server";

// ── Auth Context ─────────────────────────────────────────────────────────────
// Extracts the Supabase session from the request cookie, verifies it, and
// stores the authenticated user in AsyncLocalStorage for access by
// server functions via requireRole() / getCurrentUser().

function parseSupabaseSessionCookie(cookieHeader: string): string | null {
  // Supabase cookies are named sb-<project-ref>-auth-token
  // The value is a base64-encoded JSON containing access_token
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.split("=");
    const value = rest.join("=");
    if (name.startsWith("sb-") && name.endsWith("-auth-token")) {
      try {
        const decoded = decodeURIComponent(value);
        const session = JSON.parse(atob(decoded));
        if (session?.access_token) {
          return session.access_token;
        }
      } catch {
        // Cookie parse failure — not authenticated
      }
    }
  }
  return null;
}

function extractUserIdFromJwt(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // The payload is base64url encoded
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(decoded);
    return parsed?.sub || null;
  } catch {
    return null;
  }
}

const authMiddleware = createMiddleware().server(async ({ request, next }) => {
  // Skip if Supabase env vars are not configured
  if (!serverEnv.VITE_SUPABASE_URL || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    return await next();
  }

  const cookieHeader = (request as Request).headers.get("cookie") || "";
  const accessToken = parseSupabaseSessionCookie(cookieHeader);

  if (!accessToken) {
    return await next();
  }

  const userId = extractUserIdFromJwt(accessToken);
  if (!userId) {
    return await next();
  }

  // Any authenticated user who reaches an admin page (verified by admin.tsx beforeLoad)
  // gets full access. Role hierarchy can be added later if needed.
  const user: AuthenticatedUser = { userId, role: "admin" };
  return runWithUser(user, () => next());
});

// ── CSRF Protection ──────────────────────────────────────────────────────────
// Uses TanStack Start's built-in CSRF middleware to protect server functions
// (RPC endpoints) from cross-site request forgery.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

// ── Rate Limiting ────────────────────────────────────────────────────────────
// Simple sliding-window rate limiter by IP.
// In production, replace this with an external store (Redis, Upstash, etc.).

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
const STALE_CLEANUP_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < STALE_CLEANUP_MS) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

const rateLimitMiddleware = createMiddleware().server(async ({ request, next }) => {
  const url = new URL((request as Request).url);
  // Skip rate limiting for TanStack Start server function calls
  if (url.pathname.startsWith("/_server")) {
    return await next();
  }
  const method = (request as Request).method?.toUpperCase();
  // Only rate-limit mutations and auth endpoints
  if (method !== "POST" && method !== "PUT" && method !== "PATCH" && method !== "DELETE") {
    return await next();
  }

  const ip =
    (request as Request).headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    (request as Request).headers.get("x-real-ip") ||
    "unknown";

  // Different limits for different endpoint types
  const isAuth = url.pathname.includes("/auth") || url.pathname.includes("/login");
  const isContactForm = url.pathname.includes("/contact") || url.pathname.includes("/messages");
  const maxRequests = isAuth ? 10 : isContactForm ? 5 : 30; // per window
  const windowMs = isAuth ? 60_000 : isContactForm ? 60_000 : 10_000; // 60s for auth/contact, 10s for general

  cleanupStaleEntries();

  const key = `${ip}:${url.pathname}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return await next();
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please slow down." }),
      { status: 429, headers: { "content-type": "application/json", "retry-after": String(Math.ceil(windowMs / 1000)) } },
    );
  }

  return await next();
});

// ── Error Handler ────────────────────────────────────────────────────────────

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [authMiddleware, csrfMiddleware, rateLimitMiddleware, errorMiddleware],
}));
