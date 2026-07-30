import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { convertAndUploadImage } from "./upload.server.ts";
import { requireAuth, requireRole } from "../auth-guard.server.ts";

export const fetchGalleryImages = createServerFn({ method: "GET" })
  .inputValidator((input: { category?: string; visibleOnly?: boolean } | undefined) => input)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("gallery_images")
      .select("*")
      .order("display_order", { ascending: true });

    if (data?.category && data.category !== "all" && data.category !== "All") {
      query = query.eq("category", data.category);
    }

    if (data?.visibleOnly) {
      query = query.eq("visible", true);
    }

    const { data: images, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch gallery images: ${error.message}`);
    }

    return (images || []).map((img) => ({
      id: img.id,
      src: img.src,
      title: img.title,
      alt: img.alt,
      category: img.category,
      visible: img.visible,
      order: img.display_order,
      uploadedAt: img.uploaded_at,
    }));
  });

// Web-standard base64 decoder — no Node.js Buffer dependency
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const uploadGalleryImage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      fileBase64: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
      title: z.string().default("Untitled"),
      alt: z.string().optional(),
      category: z.string().default("Weddings"),
      order: z.number().default(0),
    }),
  )
  .handler(async ({ data }) => {
    requireAuth();
    // Decode base64 using web-standard APIs
    const buffer = base64ToBytes(data.fileBase64);
    const file = new File([buffer], data.fileName, { type: data.mimeType });

    // 1. Process and upload to storage via server WebP pipeline
    const publicUrl = await convertAndUploadImage(file, "gallery");

    // 2. Insert record in DB
    const supabase = getSupabaseAdmin();
    const { data: inserted, error } = await supabase
      .from("gallery_images")
      .insert({
        src: publicUrl,
        title: data.title,
        alt: data.alt || data.title,
        category: data.category,
        visible: true,
        display_order: data.order,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save image record: ${error.message}`);
    }

    return {
      id: inserted.id,
      src: inserted.src,
      title: inserted.title,
      alt: inserted.alt,
      category: inserted.category,
      visible: inserted.visible,
      order: inserted.display_order,
      uploadedAt: inserted.uploaded_at,
    };
  });

export const toggleImageVisibility = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      visible: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();
    const { data: updated, error } = await supabase
      .from("gallery_images")
      .update({ visible: data.visible })
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle visibility: ${error.message}`);
    }

    return {
      id: updated.id,
      src: updated.src,
      title: updated.title,
      alt: updated.alt,
      category: updated.category,
      visible: updated.visible,
      order: updated.display_order,
      uploadedAt: updated.uploaded_at,
    };
  });

export const updateImageMeta = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      title: z.string().min(1),
      alt: z.string().min(1),
      category: z.string().min(1),
      order: z.number().default(0),
    }),
  )
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();
    const { data: updated, error } = await supabase
      .from("gallery_images")
      .update({
        title: data.title,
        alt: data.alt,
        category: data.category,
        display_order: data.order,
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update image metadata: ${error.message}`);
    }

    return {
      id: updated.id,
      src: updated.src,
      title: updated.title,
      alt: updated.alt,
      category: updated.category,
      visible: updated.visible,
      order: updated.display_order,
      uploadedAt: updated.uploaded_at,
    };
  });

export const deleteGalleryImage = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();

    // 1. Get image src to find file path in storage
    const { data: img, error: getError } = await supabase
      .from("gallery_images")
      .select("src")
      .eq("id", data.id)
      .single();

    if (getError || !img) {
      throw new Error(`Failed to locate image record: ${getError?.message || "Not found"}`);
    }

    // 2. Delete row from DB
    const { error: dbDeleteError } = await supabase
      .from("gallery_images")
      .delete()
      .eq("id", data.id);

    if (dbDeleteError) {
      throw new Error(`Failed to delete image record: ${dbDeleteError.message}`);
    }

    // 3. Delete file from Supabase Storage
    try {
      const srcUrl = img.src;
      if (srcUrl.includes("gaspo-media/")) {
        const filePath = srcUrl.substring(srcUrl.indexOf("gaspo-media/") + "gaspo-media/".length);
        await supabase.storage.from("gaspo-media").remove([filePath]);
      }
    } catch (storageErr) {
      console.error("Warning: failed to delete file from Supabase storage:", storageErr);
    }

    return { success: true };
  });
