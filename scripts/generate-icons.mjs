// scripts/generate-icons.mjs
// Generates placeholder push notification icons from the existing logo.
// Usage: node scripts/generate-icons.mjs

import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");
const logoPath = join(__dirname, "..", "public", "logo.webp");

if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

async function generate() {
  const source = existsSync(logoPath) ? logoPath : null;

  const configs = [
    { name: "blog-icon.png", size: 192, bg: { r: 225, g: 45, b: 45, alpha: 1 }, label: "B" },
    { name: "event-icon.png", size: 192, bg: { r: 26, g: 26, b: 26, alpha: 1 }, label: "E" },
    {
      name: "android-status-badge.png",
      size: 72,
      bg: { r: 225, g: 45, b: 45, alpha: 1 },
      label: "",
    },
    { name: "icon-192.png", size: 192, bg: { r: 26, g: 26, b: 26, alpha: 1 }, label: "G" },
    { name: "icon-512.png", size: 512, bg: { r: 26, g: 26, b: 26, alpha: 1 }, label: "G" },
  ];

  for (const { name, size, bg, label } of configs) {
    const outputPath = join(iconsDir, name);

    if (source) {
      // Use logo as base
      await sharp(source)
        .resize(size, size, { fit: "contain", background: bg })
        .png()
        .toFile(outputPath);
      console.log(`  Created ${name} (${size}×${size}) from logo`);
    } else {
      // Create solid-color placeholder with letter
      const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="rgb(${bg.r},${bg.g},${bg.b})"/>
        ${label ? `<text x="50%" y="55%" text-anchor="middle" fill="white" font-size="${size * 0.5}" font-family="Arial,sans-serif" font-weight="bold">${label}</text>` : ""}
      </svg>`;

      await sharp(Buffer.from(svg)).png().toFile(outputPath);
      console.log(`  Created ${name} (${size}×${size}) as placeholder`);
    }
  }

  console.log(
    "\nIcon generation complete! Replace placeholders with designed assets before production.",
  );
}

generate().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
