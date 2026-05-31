// scripts/convert-to-webp.mjs
// Converts all PNG/JPG images in public/ to WebP at quality 90
import sharp from "sharp";
import { readdir, unlink } from "node:fs/promises";
import { join, extname, basename } from "node:path";

const DIRS = [
  "public/images",
  "public",
];

const EXTS = new Set([".png", ".jpg", ".jpeg"]);

for (const dir of DIRS) {
  let files;
  try {
    files = await readdir(dir);
  } catch {
    continue; // skip if dir doesn't exist
  }

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!EXTS.has(ext)) continue;

    const inputPath = join(dir, file);
    const outputPath = join(dir, basename(file, ext) + ".webp");

    try {
      await sharp(inputPath)
        .webp({ quality: 90 })
        .toFile(outputPath);
      console.log(`✓ Converted: ${inputPath} → ${outputPath}`);
      // Remove original after successful conversion
      await unlink(inputPath);
      console.log(`  ✗ Deleted original: ${inputPath}`);
    } catch (err) {
      console.error(`  Error converting ${inputPath}:`, err.message);
    }
  }
}

console.log("\nAll done!");
