import { defineEventHandler, getQuery, getRouterParam, setResponseHeaders, createError } from "h3";
import sharp from "sharp";
import { getSupabasePublic } from "../../../src/lib/supabase.server.ts";

const DEFAULT_OG_IMAGE =
  "https://fhhxbjwcgfslvbznrvab.supabase.co/storage/v1/object/public/gaspo-media/og/gaspo-studios-og.png";

const ALLOWED_HOSTNAMES = new Set([
  "fhhxbjwcgfslvbznrvab.supabase.co",
  "www.gaspostudios.com",
  "gaspostudios.com",
  "localhost",
  "127.0.0.1",
  "images.unsplash.com",
]);

export async function handleUniversalOg(event: any) {
  const subpath = (getRouterParam(event, "path") || "").trim();
  const query = getQuery(event);

  let targetImageUrl: string | null = null;

  // 1. Check if route is /api/og/blog/:slug(.jpg)
  if (subpath.startsWith("blog/")) {
    const slug = subpath.replace(/^blog\//, "").replace(/\.(jpg|jpeg|png|webp)$/i, "").trim();
    if (slug) {
      try {
        const supabase = getSupabasePublic();
        const { data: post } = await supabase
          .from("blog_posts")
          .select("featured_image, seo_og_image")
          .eq("slug", slug)
          .maybeSingle();

        targetImageUrl = post?.seo_og_image || post?.featured_image || null;
      } catch (err) {
        console.error("[OG Blog Fetch Error]", err);
      }
    }
  }

  // 2. Check if route is /api/og/events/:slug(.jpg)
  else if (subpath.startsWith("events/")) {
    const slug = subpath.replace(/^events\//, "").replace(/\.(jpg|jpeg|png|webp)$/i, "").trim();
    if (slug) {
      try {
        const supabase = getSupabasePublic();
        const { data: eventData } = await supabase
          .from("events")
          .select("banner_image, seo_og_image")
          .eq("slug", slug)
          .maybeSingle();

        targetImageUrl = eventData?.seo_og_image || eventData?.banner_image || null;
      } catch (err) {
        console.error("[OG Event Fetch Error]", err);
      }
    }
  }

  // 3. Check query string ?url=...
  if (!targetImageUrl && typeof query.url === "string" && query.url.trim()) {
    targetImageUrl = query.url.trim();
  }

  // 4. Fallback to default branding image
  if (!targetImageUrl) {
    targetImageUrl = DEFAULT_OG_IMAGE;
  }

  // Resolve relative URLs
  if (targetImageUrl.startsWith("/")) {
    targetImageUrl = `https://www.gaspostudios.com${targetImageUrl}`;
  }

  // Parse and validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetImageUrl);
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid image URL format",
    });
  }

  // Security check: Only allow HTTP/HTTPS
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw createError({
      statusCode: 403,
      statusMessage: "Protocol not allowed",
    });
  }

  // Security check: SSRF prevention
  if (!ALLOWED_HOSTNAMES.has(parsedUrl.hostname) && !parsedUrl.hostname.endsWith(".supabase.co")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Host not allowed",
    });
  }

  try {
    const res = await fetch(parsedUrl.toString(), {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "GaspoStudios-OG/1.0",
      },
    });

    if (!res.ok) {
      throw createError({
        statusCode: res.status,
        statusMessage: `Failed to fetch image: ${res.statusText}`,
      });
    }

    const arrayBuffer = await res.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Convert to 1200x630 progressive JPEG, optimized for social scrapers (WhatsApp, FB, Twitter)
    const jpegBuffer = await sharp(inputBuffer)
      .resize(1200, 630, {
        fit: "cover",
        position: "center",
      })
      .jpeg({
        quality: 82,
        progressive: true,
      })
      .toBuffer();

    setResponseHeaders(event, {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "Content-Length": String(jpegBuffer.length),
      "Access-Control-Allow-Origin": "*",
      "X-Robots-Tag": "all",
    });

    return jpegBuffer;
  } catch (err: any) {
    if (err.statusCode) throw err;
    console.error("[Universal OG Error]", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate OG image",
    });
  }
}

export default defineEventHandler(handleUniversalOg);
