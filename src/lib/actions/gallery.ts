import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { convertAndUploadImage } from "./upload.server.ts";
import { requireAuth, requireRole } from "../auth-guard.server.ts";
import { applyGalleryWatermark } from "../watermark.server.ts";

interface GalleryCacheEntry {
  data: any[];
  expiresAt: number;
}
const galleryCache = new Map<string, GalleryCacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function invalidateGalleryCache() {
  galleryCache.clear();
}

export const fetchGalleryImages = createServerFn({ method: "GET" })
  .inputValidator((input: { category?: string; visibleOnly?: boolean } | undefined) => input)
  .handler(async ({ data }) => {
    const cacheKey = `${data?.category || "all"}_${Boolean(data?.visibleOnly)}`;
    const cached = galleryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

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

    const result = (images || []).map((img) => ({
      id: img.id,
      src: img.src,
      title: img.title,
      alt: img.alt,
      category: img.category,
      visible: img.visible,
      order: img.display_order,
      uploadedAt: img.uploaded_at,
    }));

    galleryCache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
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

    invalidateGalleryCache();

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

/**
 * Server function called AFTER the client uploads a file directly to Supabase Storage.
 * It does NOT receive the file bytes — only the storage path, title, and category.
 *
 * Pipeline:
 * 1. Download the raw file from storage (server-to-server — no body size limit)
 * 2. Convert to WebP with sharp
 * 3. Apply GASPO STUDIOS tiled watermark
 * 4. Re-upload watermarked WebP to the same path (upsert)
 * 5. Insert a gallery_images DB record and return it
 *
 * This completely bypasses the Vercel 4.5MB serverless request body limit because
 * the client sends only a tiny JSON payload (path + metadata), not the image bytes.
 */
export const processGalleryUpload = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      /** Path inside gaspo-media bucket, e.g. "gallery/abc123.webp" */
      storagePath: z.string(),
      fileName: z.string(),
      title: z.string().default("Untitled"),
      alt: z.string().optional(),
      category: z.string().default("Weddings"),
      order: z.number().default(0),
    }),
  )
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    // 1. Download the raw file from Supabase Storage (server-to-server)
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from("gaspo-media")
      .download(data.storagePath);

    if (downloadError || !fileBlob) {
      throw new Error(
        `Failed to download uploaded file from storage: ${downloadError?.message ?? "empty blob"}`,
      );
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // 2. Convert to WebP (handles JPG, PNG, HEIC, etc. from client) with max 2048px dimension
    let webpBuffer: Buffer;
    try {
      const sharp = (await import("sharp")).default;
      webpBuffer = await sharp(rawBuffer)
        .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();
    } catch (err: any) {
      throw new Error(`WebP conversion failed: ${err.message}`);
    }

    // 3. Apply GASPO STUDIOS watermark
    try {
      webpBuffer = await applyGalleryWatermark(webpBuffer);
    } catch (err: any) {
      // Log but don't block — watermark failure must not prevent saving
      console.error("Warning: watermark could not be applied:", err.message);
    }

    // 4. Re-upload the processed WebP to the same path (overwrites raw upload)
    const processedBuffer = Uint8Array.from(webpBuffer);
    const { error: uploadError } = await supabase.storage
      .from("gaspo-media")
      .upload(data.storagePath, processedBuffer, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to save processed image to storage: ${uploadError.message}`);
    }

    // 5. Get public URL
    const { data: urlData } = supabase.storage
      .from("gaspo-media")
      .getPublicUrl(data.storagePath);

    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) throw new Error("Failed to retrieve public URL for uploaded asset");

    // 6. Insert gallery_images DB record
    const { data: inserted, error: dbError } = await supabase
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

    if (dbError) throw new Error(`Failed to save image record: ${dbError.message}`);

    invalidateGalleryCache();

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

/**
 * Generates a Supabase signed upload URL so the client can PUT the file
 * directly to storage — bypassing the 4.5MB Vercel serverless body limit.
 *
 * Returns { signedUrl, storagePath }. The client should then:
 * 1. PUT the raw file to signedUrl
 * 2. Call processGalleryUpload({ storagePath, ... })
 */
export const getGalleryUploadUrl = createServerFn({ method: "POST" })
  .inputValidator(z.object({ fileName: z.string() }))
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();
    const uuid =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    // Preserve original extension so Supabase detects MIME type correctly
    const ext = data.fileName.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `gallery/${uuid}.${ext}`;

    const { data: signedData, error } = await supabase.storage
      .from("gaspo-media")
      .createSignedUploadUrl(storagePath);

    if (error || !signedData) {
      throw new Error(`Failed to create signed upload URL: ${error?.message ?? "no data"}`);
    }

    return {
      signedUrl: signedData.signedUrl,
      storagePath,
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

    invalidateGalleryCache();

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

    invalidateGalleryCache();

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

    invalidateGalleryCache();

    return { success: true };
  });

/**
 * Re-applies the GASPO STUDIOS watermark to all existing gallery images.
 * Downloads each image from Supabase storage, composites the watermark,
 * and re-uploads to the same path (upsert). Per-image failures are captured
 * and returned in the result — a single bad image will not abort the batch.
 */
export const rewatermarkGalleryImages = createServerFn({ method: "POST" })
  .inputValidator(z.object({}))
  .handler(async () => {
    requireRole(["admin"]);
    const supabase = getSupabaseAdmin();

    // 1. Fetch all gallery image records
    const { data: images, error: fetchError } = await supabase
      .from("gallery_images")
      .select("id, src");

    if (fetchError) {
      throw new Error(`Failed to fetch gallery images: ${fetchError.message}`);
    }

    const total = images?.length ?? 0;
    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const img of images ?? []) {
      try {
        const srcUrl: string = img.src;

        // ── Robust path extraction ───────────────────────────────────────────
        // Use URL parsing so query params / fragments are automatically stripped.
        // Supabase public URL structure:
        //   https://<project>.supabase.co/storage/v1/object/public/gaspo-media/<path>
        // We need just the bucket-relative portion: e.g. "gallery/abc123.webp"
        let filePath: string;
        try {
          const parsed = new URL(srcUrl);
          const pathname = parsed.pathname; // e.g. /storage/v1/object/public/gaspo-media/gallery/abc.webp
          const bucketMarker = "/gaspo-media/";
          const markerIdx = pathname.indexOf(bucketMarker);
          if (markerIdx === -1) {
            failed++;
            errors.push(`Skipped ${img.id}: URL path does not contain /gaspo-media/ — src: ${srcUrl}`);
            continue;
          }
          filePath = pathname.substring(markerIdx + bucketMarker.length);
        } catch {
          // Fallback: plain string extraction if URL() parsing fails
          const marker = "gaspo-media/";
          const markerIdx = srcUrl.indexOf(marker);
          if (markerIdx === -1) {
            failed++;
            errors.push(`Skipped ${img.id}: URL does not reference gaspo-media bucket`);
            continue;
          }
          // Strip any query string
          filePath = srcUrl.substring(markerIdx + marker.length).split("?")[0];
        }

        // ── Download from Supabase Storage ───────────────────────────────────
        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from("gaspo-media")
          .download(filePath);

        if (downloadError || !fileBlob) {
          failed++;
          errors.push(
            `Download failed for ${img.id} (path: "${filePath}"): ${downloadError?.message ?? "empty blob"}`,
          );
          continue;
        }

        // ── Convert Blob → Buffer for sharp ──────────────────────────────────
        const arrayBuffer = await fileBlob.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        // ── Apply GASPO STUDIOS tiled diagonal watermark ──────────────────────
        const watermarked = await applyGalleryWatermark(inputBuffer);

        // ── Re-upload watermarked image ───────────────────────────────────────
        // Uint8Array.from() creates a clean copy — avoids the shared-pool
        // edge case with Buffer.buffer/byteOffset/byteLength.
        const uploadBuffer = Uint8Array.from(watermarked);
        const { error: uploadError } = await supabase.storage
          .from("gaspo-media")
          .upload(filePath, uploadBuffer, {
            contentType: "image/webp",
            cacheControl: "31536000",
            upsert: true,
          });

        if (uploadError) {
          failed++;
          errors.push(`Re-upload failed for ${img.id}: ${uploadError.message}`);
          continue;
        }

        processed++;
      } catch (err: any) {
        failed++;
        errors.push(`Unexpected error for ${img.id}: ${err.message}`);
      }
    }

    invalidateGalleryCache();

    return { total, processed, failed, errors };
  });
