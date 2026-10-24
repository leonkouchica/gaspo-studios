import { defineEventHandler, getQuery, setResponseHeaders, createError } from "h3";
import sharp from "sharp";

const ALLOWED_HOSTNAMES = new Set([
  "fhhxbjwcgfslvbznrvab.supabase.co",
  "www.gaspostudios.com",
  "gaspostudios.com",
  "localhost",
  "127.0.0.1",
  "images.unsplash.com",
]);

export async function handleOgRequest(event: any) {
  const query = getQuery(event);
  const rawUrl = typeof query.url === "string" ? query.url : null;

  if (!rawUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required 'url' query parameter",
    });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid URL format",
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
        statusMessage: `Failed to fetch source image: ${res.statusText}`,
      });
    }

    const arrayBuffer = await res.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Convert to 1200x630 JPEG (standard OG format for WhatsApp, Facebook, Twitter)
    const jpegBuffer = await sharp(inputBuffer)
      .resize(1200, 630, {
        fit: "cover",
        position: "center",
      })
      .jpeg({
        quality: 85,
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
    console.error("[OG Error]", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to process image",
    });
  }
}

export default defineEventHandler(handleOgRequest);
