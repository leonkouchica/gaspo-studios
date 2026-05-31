import { createClient } from "@supabase/supabase-js";
import { getServerConfig } from "./config.server.ts";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://fhhxbjwcgfslvbznrvab.supabase.co";

export function getSupabaseAdmin() {
  const config = getServerConfig();
  const serviceKey = config.supabaseServiceRoleKey;
  
  if (!serviceKey) {
    console.warn("Warning: SUPABASE_SERVICE_ROLE_KEY is missing on the server. Falling back to public anon key.");
    return createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_ANON_KEY || "");
  }
  
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
