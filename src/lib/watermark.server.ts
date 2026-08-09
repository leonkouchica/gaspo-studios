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

/** Opacity of each watermark tile (0–255). 100 ≈ 39% opacity. */
const WATERMARK_OPACITY = 100;

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

  // 2. Apply opacity by modulating the alpha channel
  //    Sharp's `linear` on the alpha channel: newAlpha = alpha * (opacity/255)
  const transparent = await sharp(resized)
    .linear(
      // multiply each channel by 1.0 (no color change)
      [1, 1, 1, WATERMARK_OPACITY / 255],
      // offset 0 for all channels
      [0, 0, 0, 0],
    )
    .png()
    .toBuffer();

  // 3. Rotate the tile so it sits at a diagonal
  const rotated = await sharp(transparent)
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
  // Get source image dimensions
  const sourceMeta = await sharp(webpBuffer).metadata();
  const imageWidth = sourceMeta.width ?? 1200;
  const imageHeight = sourceMeta.height ?? 800;

  // Build the tile
  const tile = await buildWatermarkTile(imageWidth);
  const tileMeta = await sharp(tile).metadata();

  // Build the composite list
  const composites = await buildTileComposites(imageWidth, imageHeight, tile, tileMeta);

  // Apply all tiles in one sharp composite pass and re-encode as WebP
  const result = await sharp(webpBuffer).composite(composites).webp({ quality: 90 }).toBuffer();

  return result;
}
