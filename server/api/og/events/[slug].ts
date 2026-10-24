import { defineEventHandler, getRouterParam, setResponseHeaders, createError } from "h3";
import sharp from "sharp";
import { getSupabasePublic } from "../../../src/lib/supabase.server";

const DEFAULT_OG_IMAGE =
  "https://fhhxbjwcgfslvbznrvab.supabase.co/storage/v1/object/public/gaspo-media/og/gaspo-studios-og.png";

export default defineEventHandler(async (event) => {
  const rawParam = getRouterParam(event, "slug") || "";
  const slug = rawParam.replace(/\.(jpg|jpeg|png|webp)$/i, "").trim();

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing event slug",
    });
  }

  try {
    const supabase = getSupabasePublic();
    const { data: eventData, error } = await supabase
      .from("events")
      .select("banner_image, seo_og_image")
      .eq("slug", slug)
      .maybeSingle();

    let targetImageUrl = eventData?.seo_og_image || eventData?.banner_image || DEFAULT_OG_IMAGE;

    if (targetImageUrl.startsWith("/")) {
      targetImageUrl = `https://www.gaspostudios.com${targetImageUrl}`;
    }

    const res = await fetch(targetImageUrl, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "GaspoStudios-OG/1.0",
      },
    });

    if (!res.ok) {
      throw createError({
        statusCode: res.status,
        statusMessage: `Failed to fetch event image: ${res.statusText}`,
      });
    }

    const arrayBuffer = await res.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Convert to 1200x630 progressive JPEG, optimized for social scrapers
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
    console.error("[OG Event Error]", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate event OG image",
    });
  }
});
