// scripts/apply-migration-api.mjs
// Applies SQL migrations via Supabase Management API.
// Requires a Supabase Personal Access Token (PAT).
// Generate one at: https://supabase.com/dashboard/account/tokens
// Usage: SUPABASE_ACCESS_TOKEN=xxx node --env-file=.env scripts/apply-migration-api.mjs

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRef = "fhhxbjwcgfslvbznrvab";

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!accessToken) {
  console.error("╔══════════════════════════════════════════════════════════════╗");
  console.error("║  SUPABASE_ACCESS_TOKEN is required.                          ║");
  console.error("║                                                              ║");
  console.error("║  1. Go to: https://supabase.com/dashboard/account/tokens     ║");
  console.error("║  2. Click 'Generate new token'                               ║");
  console.error("║  3. Copy the token and run:                                  ║");
  console.error("║     $env:SUPABASE_ACCESS_TOKEN='your-token' ; node --env-file=.env scripts/apply-migration-api.mjs  ║");
  console.error("╚══════════════════════════════════════════════════════════════╝");
  process.exit(1);
}

async function applyMigration() {
  const migrationPath = join(__dirname, "..", "supabase", "migrations", "006_push_subscriptions.sql");

  if (!existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = readFileSync(migrationPath, "utf-8");
  console.log(`Read migration: 006_push_subscriptions.sql (${sql.length} chars)`);

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/query`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error(`Migration failed (${response.status}):`, JSON.stringify(result, null, 2));
    process.exit(1);
  }

  console.log("✓ Migration 006_push_subscriptions applied successfully!");
  console.log(`  Result:`, JSON.stringify(result, null, 2));
}

applyMigration().catch((err) => {
  console.error("Unexpected error:", err.message);
  process.exit(1);
});
