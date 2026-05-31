import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://fhhxbjwcgfslvbznrvab.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseAnonKey && typeof window !== "undefined") {
  console.warn("Warning: VITE_SUPABASE_ANON_KEY is missing in env.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
