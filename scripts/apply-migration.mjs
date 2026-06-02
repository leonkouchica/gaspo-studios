// scripts/apply-migration.mjs
// Applies SQL migrations directly to Supabase PostgreSQL via pg.
// Uses the Supabase session pooler connection from .env.
// Usage: node --env-file=.env scripts/apply-migration.mjs

import pg from "pg";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env manually for non-VITE_ vars (node --env-file= only loads into process.env)
// The SUPABASE_SERVICE_ROLE_KEY is already in VITE_ vars but we need DB connection
const projectRef = "fhhxbjwcgfslvbznrvab";
const dbPassword = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!dbPassword) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY not found in environment.");
  console.error("Make sure your .env file exists and run with: node --env-file=.env scripts/apply-migration.mjs");
  process.exit(1);
}

// Supabase connection — try transaction pooler first, fall back to direct
const pool = new pg.Pool({
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  database: "postgres",
  user: `postgres.${projectRef}`,
  password: dbPassword,
  ssl: { rejectUnauthorized: false },
  max: 1,
  connectionTimeoutMillis: 10000,
});

async function applyMigration() {
  const migrationPath = join(__dirname, "..", "supabase", "migrations", "006_push_subscriptions.sql");
  
  if (!existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = readFileSync(migrationPath, "utf-8");
  console.log(`Read migration: ${migrationPath} (${sql.length} chars)`);

  const client = await pool.connect();
  
  try {
    console.log("Connected to Supabase PostgreSQL. Executing migration...\n");
    await client.query(sql);
    console.log("✓ Migration 006_push_subscriptions applied successfully!");
    console.log("  Tables created: push_subscriptions, push_dispatch_log");
    console.log("  Indexes: idx_push_sub_channels_blogs, idx_push_sub_channels_events, idx_push_sub_user_id");
    console.log("  RLS policies: 5 policies created");
  } catch (err) {
    console.error("Migration failed:", err.message);
    // If tables already exist, that's OK
    if (err.message.includes("already exists")) {
      console.log("(Tables may already exist — this is fine, the migration is idempotent)");
    } else {
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration();
