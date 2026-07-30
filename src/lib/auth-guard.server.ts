// src/lib/auth-guard.server.ts
// Lightweight auth guard for admin server actions.
// Uses AsyncLocalStorage to carry the authenticated user from the
// request middleware (start.ts) into createServerFn handlers.
//
// The admin layout (admin.tsx beforeLoad) already verifies the Supabase
// session before any admin page loads. This guard just confirms that
// the server-side request context has a user — no role checks needed.

import { AsyncLocalStorage } from "node:async_hooks";

export interface AuthenticatedUser {
  userId: string;
  role: string;
}

const userContextStore = new AsyncLocalStorage<AuthenticatedUser>();

export function runWithUser<T>(user: AuthenticatedUser, fn: () => T): T {
  return userContextStore.run(user, fn);
}

export function getCurrentUser(): AuthenticatedUser | null {
  return userContextStore.getStore() ?? null;
}

/** Throws if no authenticated user is in the request context. */
export function requireAuth(): AuthenticatedUser {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: please log in to perform this action.");
  }
  return user;
}

/** Throws if the current user does not have one of the required roles. */
export function requireRole(allowedRoles: string[]): AuthenticatedUser {
  const user = requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `Forbidden: you need one of [${allowedRoles.join(", ")}] roles to perform this action.`,
    );
  }
  return user;
}
