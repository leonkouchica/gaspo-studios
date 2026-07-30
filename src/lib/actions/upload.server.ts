// src/lib/actions/upload.server.ts
// Server-only image processing and Supabase Storage upload pipeline

import sharp from "sharp";
import { getSupabaseAdmin } from "../supabase.server.ts";

/**
 * Decode a base64 string to a Uint8Array using web-standard APIs.
 * Replaces Node.js Buffer.from(data, "base64") for cross-runtime compatibility.
 */
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts any image upload to WebP with high quality (90)
 * and uploads it to the 'gaspo-media' Supabase Storage bucket.
 *
 * @param file The file uploaded from the client (Blob/File)
 * @param folder The folder inside the bucket (e.g. 'gallery', 'blog', 'events')
 * @returns The public URL of the uploaded WebP image
 */
export async function convertAndUploadImage(
  file: any,
  folder: "gallery" | "blog" | "events" | "team",
): Promise<string> {
  if (!file) {
    throw new Error("No file was provided for upload");
  }

  // Size check: warn if > 5MB (base64 encoding will amplify this)
  let fileSize = 0;
  if (typeof file.size === "number") fileSize = file.size;
  else if (file instanceof Uint8Array) fileSize = file.byteLength;
  if (fileSize > 5 * 1024 * 1024) {
    throw new Error(
      `Image too large (${(fileSize / 1024 / 1024).toFixed(1)}MB). Please resize to under 5MB before uploading.`,
    );
  }

  // 1. Convert File/Blob to Uint8Array (web-standard, cross-runtime)
  let buffer: Uint8Array;
  try {
    if (typeof file.arrayBuffer === "function") {
      const arrayBuffer = await file.arrayBuffer();
      buffer = new Uint8Array(arrayBuffer);
    } else if (file instanceof Uint8Array) {
      buffer = file;
    } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(file)) {
      // Node.js fallback for backward compat
      buffer = new Uint8Array(file.buffer, file.byteOffset, file.byteLength);
    } else {
      throw new Error("Unsupported file type: must be File, Blob or Uint8Array");
    }
  } catch (err: any) {
    throw new Error(`Failed to read upload buffer: ${err.message}`);
  }

  // 2. Process image with sharp: convert to WebP, quality 90
  // Note: sharp is a native Node.js module. On non-Node.js runtimes (Cloudflare Workers),
  // use a WASM-based alternative or a serverless image processing service.
  let webpBuffer: Uint8Array;
  try {
    const result = await sharp(buffer).webp({ quality: 90 }).toBuffer();
    webpBuffer = new Uint8Array(result.buffer, result.byteOffset, result.byteLength);
  } catch (err: any) {
    throw new Error(
      `Sharp WebP processing failed: ${err.message}. Ensure the file is a valid image.`,
    );
  }

  // 3. Upload WebP to Supabase Storage (bypassing RLS with admin client)
  const supabase = getSupabaseAdmin();
  const uuid =
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const filePath = `${folder}/${uuid}.webp`;

  const { data, error } = await supabase.storage.from("gaspo-media").upload(filePath, webpBuffer, {
    contentType: "image/webp",
    cacheControl: "31536000", // 1 year cache
    upsert: true,
  });

  if (error) {
    // If the bucket doesn't exist, we can try to create it or throw a descriptive error
    if (error.message.includes("Bucket not found")) {
      console.log(`Bucket 'gaspo-media' not found. Attempting to create it...`);
      const { error: createError } = await supabase.storage.createBucket("gaspo-media", {
        public: true,
        allowedMimeTypes: ["image/webp", "image/png", "image/jpeg", "image/jpg"],
      });
      if (createError) {
        throw new Error(`Failed to create bucket 'gaspo-media': ${createError.message}`);
      }

      // Retry upload
      const { data: retryData, error: retryError } = await supabase.storage
        .from("gaspo-media")
        .upload(filePath, webpBuffer, {
          contentType: "image/webp",
          cacheControl: "31536000",
          upsert: true,
        });

      if (retryError) {
        throw new Error(`Failed to upload image after bucket creation: ${retryError.message}`);
      }
    } else {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }
  }

  // 4. Retrieve public URL
  const { data: urlData } = supabase.storage.from("gaspo-media").getPublicUrl(filePath);

  if (!urlData || !urlData.publicUrl) {
    throw new Error("Failed to retrieve public URL for uploaded asset");
  }

  return urlData.publicUrl;
}
