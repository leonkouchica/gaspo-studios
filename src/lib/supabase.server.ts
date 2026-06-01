import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "./env.server.ts";

const supabaseUrl = serverEnv.VITE_SUPABASE_URL;

export function getSupabaseAdmin() {
  if (!serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing — server actions cannot function without it.");
  }

  return createClient(supabaseUrl, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
