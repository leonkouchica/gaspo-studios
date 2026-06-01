import { createServerFn } from "@tanstack/react-start";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { requireRole } from "../auth-guard.server.ts";
import fs from "node:fs";
import path from "node:path";

/** Admin-only: runs a migration SQL file from the supabase/migrations directory. */
export const runMigration = createServerFn({ method: "POST" })
  .inputValidator((input: { fileName: string }) => input)
  .handler(async ({ data }) => {
    requireRole(["admin"]);

    const supabase = getSupabaseAdmin();
    const filePath = path.join(process.cwd(), "supabase", "migrations", data.fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Migration file not found: ${data.fileName}`);
    }

    const sql = fs.readFileSync(filePath, "utf-8");

    // Execute each statement individually
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    const results: string[] = [];

    for (const stmt of statements) {
      // Use the raw SQL query via the PostgREST client's internal query method
      const { error } = await supabase.rpc("run_sql", { query: stmt }).maybeSingle();

      if (error) {
        // Try direct query approach for simple statements
        results.push(`Statement failed via RPC: ${error.message}`);
      } else {
        results.push("OK");
      }
    }

    return {
      success: true,
      totalStatements: statements.length,
      results: results.slice(0, 5),
    };
  });
