/**
 * Helper to generate an OpenGraph image URL for social media cards (WhatsApp, Facebook, Twitter, LinkedIn).
 *
 * Routes WebP/Supabase storage images through the dynamic OG endpoint (/api/og/image.jpg?url=...)
 * which converts them on-the-fly into standardized 1200x630 progressive JPEGs with Edge CDN caching
 * and crawler-friendly headers, bypassing Supabase Storage's 'x-robots-tag: none' and WebP limitations.
 */
export function getOgImageUrl(imageUrl?: string | null): string {
  const defaultOgImage =
    "https://fhhxbjwcgfslvbznrvab.supabase.co/storage/v1/object/public/gaspo-media/og/gaspo-studios-og.png";

  if (!imageUrl) {
    return defaultOgImage;
  }

  // If already routed or root OG PNG, keep as-is
  if (imageUrl.includes("/api/og") || imageUrl.endsWith(".png")) {
    return imageUrl;
  }

  return `https://www.gaspostudios.com/api/og/image.jpg?url=${encodeURIComponent(imageUrl)}`;
}
