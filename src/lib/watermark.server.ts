// src/lib/watermark.server.ts
// Server-only watermark pipeline — Shutterstock-style tiled diagonal branding.
// Applied at upload time so the stored file in Supabase is permanently branded.
//
// IMPORTANT: The logo is embedded as a base64 constant (GASPO_LOGO_BASE64) so
// it is always available regardless of where the server bundle is deployed
// (Vercel, Cloudflare, Docker, etc). It does NOT read from the file system.

import sharp from "sharp";
import { GASPO_LOGO_BASE64 } from "./logo-data.ts";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Opacity of each watermark tile (0–255). 18 ≈ 7% opacity. */
const WATERMARK_OPACITY = 18;

/** Maximum width of a single watermark tile (px). Scales down for small images. */
const TILE_MAX_WIDTH = 320;

/** Spacing between tile origins (px). Controls density of the tiling. */
const TILE_SPACING = 360;

/** Angle (degrees) to rotate each tile — 30° matches Shutterstock diagonal. */
const TILE_ANGLE = -30;

// ─── Watermark Loader ─────────────────────────────────────────────────────────

let _logoBuffer: Buffer | null = null;

/**
 * Returns the GASPO STUDIOS logo as a Buffer.
 * Uses the embedded base64 constant — zero file-system dependency.
 * Result is cached in-process after the first call.
 */
function getLogoBuffer(): Buffer {
  if (_logoBuffer) return _logoBuffer;
  try {
    _logoBuffer = Buffer.from(GASPO_LOGO_BASE64, "base64");
    return _logoBuffer;
  } catch (err: any) {
    throw new Error(`Watermark logo could not be decoded from embedded data: ${err.message}`);
  }
}

// ─── Tile Builder ──────────────────────────────────────────────────────────────

/**
 * Creates a single semi-transparent, rotated watermark tile from the logo.
 *
 * @param imageWidth  Width of the target image (used to scale the tile)
 * @returns PNG buffer of the prepared tile
 */
async function buildWatermarkTile(imageWidth: number): Promise<Buffer> {
  const logo = getLogoBuffer();

  // Scale tile width relative to the image — never wider than TILE_MAX_WIDTH
  // and never less than 160px. Keeps tiles proportionate on thumbnails vs. full-res.
  const tileWidth = Math.min(TILE_MAX_WIDTH, Math.max(160, Math.round(imageWidth * 0.35)));

  // 1. Resize logo to tile width, preserving aspect ratio
  const resized = await sharp(logo)
    .resize({ width: tileWidth, withoutEnlargement: true })
    .ensureAlpha()
    .toBuffer();

  // 2. Convert to white and apply opacity in one linear pass.
  //    sharp.linear([a_R, a_G, a_B, a_A], [b_R, b_G, b_B, b_A]):
  //      output_channel = input_channel * a + b
  //
  //    R: R × 0 + 255 = 255  →  pure white
  //    G: G × 0 + 255 = 255  →  pure white
  //    B: B × 0 + 255 = 255  →  pure white
  //    A: A × (opacity/255) + 0  →  original logo shape at target opacity
  //
  //    Transparent pixels stay transparent (A=0 × anything = 0).
  const white = await sharp(resized)
    .linear(
      [0, 0, 0, WATERMARK_OPACITY / 255],
      [255, 255, 255, 0],
    )
    .png()
    .toBuffer();

  // 3. Rotate the tile so it sits at a diagonal
  const rotated = await sharp(white)
    .rotate(TILE_ANGLE, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return rotated;
}

// ─── Composite Builder ────────────────────────────────────────────────────────

/**
 * Generates a list of sharp composite inputs that tile the watermark
 * diagonally across the full image surface.
 *
 * @param imageWidth  Width of the target image in pixels
 * @param imageHeight Height of the target image in pixels
 * @param tile        The prepared tile buffer (from buildWatermarkTile)
 * @param tileMeta    Metadata of the tile (width/height after rotation)
 */
async function buildTileComposites(
  imageWidth: number,
  imageHeight: number,
  tile: Buffer,
  tileMeta: sharp.Metadata,
): Promise<sharp.OverlayOptions[]> {
  const tileW = tileMeta.width ?? TILE_MAX_WIDTH;
  const tileH = tileMeta.height ?? TILE_MAX_WIDTH;

  const composites: sharp.OverlayOptions[] = [];

  // Tile from well outside top-left to well outside bottom-right so
  // diagonal tiles fully cover the corners.
  const startX = -tileW;
  const startY = -tileH;
  const endX = imageWidth + tileW;
  const endY = imageHeight + tileH;

  for (let y = startY; y < endY; y += TILE_SPACING) {
    for (let x = startX; x < endX; x += TILE_SPACING) {
      composites.push({
        input: tile,
        left: Math.round(x),
        top: Math.round(y),
        blend: "over",
      });
    }
  }

  return composites;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Applies a Shutterstock-style tiled diagonal GASPO STUDIOS watermark
 * to an image buffer. Returns the watermarked image as a WebP buffer.
 *
 * The watermark is baked in permanently — suitable for storage in Supabase.
 *
 * @param webpBuffer The source image buffer (already converted to WebP)
 * @returns A new WebP buffer with the watermark composited over it
 */
export async function applyGalleryWatermark(webpBuffer: Buffer): Promise<Buffer> {
  // Get source image dimensions and ensure max 2048px bounds
  let baseSharp = sharp(webpBuffer);
  const sourceMeta = await baseSharp.metadata();
  const rawWidth = sourceMeta.width ?? 1200;
  const rawHeight = sourceMeta.height ?? 800;

  let imageWidth = rawWidth;
  let imageHeight = rawHeight;
  if (rawWidth > 2048 || rawHeight > 2048) {
    baseSharp = sharp(await baseSharp.resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true }).toBuffer());
    const resizedMeta = await baseSharp.metadata();
    imageWidth = resizedMeta.width ?? Math.min(rawWidth, 2048);
    imageHeight = resizedMeta.height ?? Math.min(rawHeight, 2048);
  }

  // Build the tile
  const tile = await buildWatermarkTile(imageWidth);
  const tileMeta = await sharp(tile).metadata();

  // Build the composite list
  const composites = await buildTileComposites(imageWidth, imageHeight, tile, tileMeta);

  // Apply all tiles in one sharp composite pass and re-encode as WebP
  const result = await baseSharp.composite(composites).webp({ quality: 82, effort: 4 }).toBuffer();

  return result;
}
