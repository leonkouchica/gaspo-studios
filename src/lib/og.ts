/**
 * Helper to generate OpenGraph image URLs for social media cards (WhatsApp, Facebook, Twitter, LinkedIn).
 *
 * Uses clean static-like URLs (/api/og/blog/:slug.jpg and /api/og/events/:slug.jpg)
 * which have no query strings, ensuring 100% compatibility with WhatsApp's strict client scraper.
 */

const DEFAULT_OG_IMAGE =
  "https://fhhxbjwcgfslvbznrvab.supabase.co/storage/v1/object/public/gaspo-media/og/gaspo-studios-og.png";

export function getBlogOgImageUrl(slug: string): string {
  if (!slug) return DEFAULT_OG_IMAGE;
  return `https://www.gaspostudios.com/api/og/blog/${slug}.jpg`;
}

export function getEventOgImageUrl(slug: string): string {
  if (!slug) return DEFAULT_OG_IMAGE;
  return `https://www.gaspostudios.com/api/og/events/${slug}.jpg`;
}

export function getOgImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) {
    return DEFAULT_OG_IMAGE;
  }

  // If already routed or root OG PNG, keep as-is
  if (imageUrl.includes("/api/og") || imageUrl.endsWith(".png")) {
    return imageUrl;
  }

  const absoluteImageUrl = imageUrl.startsWith("/")
    ? `https://www.gaspostudios.com${imageUrl}`
    : imageUrl;

  return `https://www.gaspostudios.com/api/og/image.jpg?url=${encodeURIComponent(absoluteImageUrl)}`;
}
