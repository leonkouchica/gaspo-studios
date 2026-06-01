// src/lib/env.server.ts
// Server-only environment access — values here never reach the browser.
// The .server.ts suffix prevents Vite from bundling this into the client.
//
// Vite loads VITE_* vars from .env into import.meta.env.
// Non-prefixed secrets (SUPABASE_SERVICE_ROLE_KEY) are loaded directly
// from the .env file using Node.js fs — Vite doesn't expose them otherwise.

import process from "node:process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

// ── .env file parser (no external dependencies) ─────────────────────────────
function loadDotEnv(): Record<string, string> {
  const vars: Record<string, string> = {};

  // process.cwd() is the project root when running vite dev / vite build
  const envPath = join(process.cwd(), ".env");

  if (existsSync(envPath)) {
    try {
      const content = readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let value = trimmed.slice(eqIdx + 1).trim();
        // Strip surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        vars[key] = value;
      }
    } catch {
      // .env read failed — not fatal
    }
  }

  return vars;
}

const dotEnvVars = loadDotEnv();

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  VITE_SUPABASE_URL: z.string().optional().default(""),
  VITE_SUPABASE_ANON_KEY: z.string().optional().default(""),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function readEnv(): ServerEnv {
  // Priority: system process.env > .env file > import.meta.env > empty string
  const raw = {
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_SERVICE_ROLE_KEY:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      dotEnvVars.SUPABASE_SERVICE_ROLE_KEY ||
      "",
    VITE_SUPABASE_URL:
      (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL) ||
      process.env.VITE_SUPABASE_URL ||
      dotEnvVars.VITE_SUPABASE_URL ||
      "",
    VITE_SUPABASE_ANON_KEY:
      (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      dotEnvVars.VITE_SUPABASE_ANON_KEY ||
      "",
  };

  const result = serverEnvSchema.safeParse(raw);

  if (!result.success) {
    const missing = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    const msg = `⚠️  Environment variable issues:\n${missing.join("\n")}`;
    if (raw.NODE_ENV === "production") {
      throw new Error(msg + "\n\nCheck your deployment environment variables.");
    }
    console.warn(msg);
    return serverEnvSchema.parse({});
  }

  if (!result.data.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("⚠️  SUPABASE_SERVICE_ROLE_KEY is not set. Admin write operations will fail.");
  }
  if (!result.data.VITE_SUPABASE_URL || !result.data.VITE_SUPABASE_ANON_KEY) {
    console.warn("⚠️  VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are not set. Database access will fail.");
  }

  return result.data;
}

export const serverEnv: ServerEnv = readEnv();
