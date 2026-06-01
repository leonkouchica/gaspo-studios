import { createServerFn } from "@tanstack/react-start";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { requireAuth, requireRole } from "../auth-guard.server.ts";

/** Fetch the homepage content from the database (public read). */
export const fetchHomepageContent = createServerFn({ method: "GET" })
  .handler(async () => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("homepage_content")
      .select("content, updated_at")
      .eq("id", "main")
      .single();

    if (error) {
      throw new Error(`Failed to fetch homepage content: ${error.message}`);
    }

    return data?.content || {};
  });

/** Save the homepage content (admin only). */
export const updateHomepageContent = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { content: Record<string, any> } }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();

    const { data: result, error } = await supabase
      .from("homepage_content")
      .upsert(
        {
          id: "main",
          content: data.content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save homepage content: ${error.message}`);
    }

    return { success: true, updatedAt: result.updated_at };
  });
