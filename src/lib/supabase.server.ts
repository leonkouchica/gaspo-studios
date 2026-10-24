import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "./env.server.ts";

const supabaseUrl = serverEnv.VITE_SUPABASE_URL;

export function getSupabaseAdmin() {
  const key = serverEnv.SUPABASE_SERVICE_ROLE_KEY || serverEnv.VITE_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing — server actions cannot function without it.",
    );
  }

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Client for public read operations (blog posts, public events, gallery)
export function getSupabasePublic() {
  const key = serverEnv.VITE_SUPABASE_ANON_KEY || serverEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("Supabase public API key is missing.");
  }
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

