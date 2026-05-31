// src/data/gallery.ts
// Static seed data for the Gallery management module.
// Pre-typed to match planned Supabase `gallery_images` table schema.

export type GalleryCategory =
  | "Weddings"
  | "Portraits"
  | "Commercial"
  | "Events"
  | "Behind the Scenes";

export interface GalleryImage {
  id: string;
  src: string;
  title: string;
  alt: string;
  category: GalleryCategory;
  visible: boolean;
  order: number;
  uploadedAt: string;
}

export const galleryImages: GalleryImage[] = [
  { id: "img-001", src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80", title: "Golden Hour Wedding", alt: "Couple embracing at golden hour", category: "Weddings", visible: true, order: 1, uploadedAt: "2026-01-10T10:00:00Z" },
  { id: "img-002", src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&q=80", title: "Studio Portrait — Adaeze", alt: "Woman with natural light portrait", category: "Portraits", visible: true, order: 2, uploadedAt: "2026-01-15T11:00:00Z" },
  { id: "img-003", src: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=900&q=80", title: "Corporate Summit — Acme Group", alt: "Business panel at conference", category: "Commercial", visible: true, order: 3, uploadedAt: "2026-02-01T09:00:00Z" },
  { id: "img-004", src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80", title: "Tech Conference 2026", alt: "Crowd at tech conference", category: "Events", visible: true, order: 4, uploadedAt: "2026-02-10T14:00:00Z" },
  { id: "img-005", src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=80", title: "Beachside Ceremony", alt: "Wedding ceremony on the beach", category: "Weddings", visible: true, order: 5, uploadedAt: "2026-02-20T08:00:00Z" },
  { id: "img-006", src: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=900&q=80", title: "Executive Headshots — Chidi", alt: "Male executive professional headshot", category: "Portraits", visible: true, order: 6, uploadedAt: "2026-03-01T10:00:00Z" },
  { id: "img-007", src: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=900&q=80", title: "Studio Product Campaign", alt: "Product photography on white background", category: "Commercial", visible: true, order: 7, uploadedAt: "2026-03-10T13:00:00Z" },
  { id: "img-008", src: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=900&q=80", title: "Gala Night 2026", alt: "Event photography at formal gala", category: "Events", visible: true, order: 8, uploadedAt: "2026-03-15T19:00:00Z" },
  { id: "img-009", src: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=900&q=80", title: "Reception Details", alt: "Table setting and floral arrangement at reception", category: "Weddings", visible: true, order: 9, uploadedAt: "2026-03-20T11:00:00Z" },
  { id: "img-010", src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80", title: "Natural Light Portrait", alt: "Woman photographed in natural light", category: "Portraits", visible: true, order: 10, uploadedAt: "2026-04-01T09:00:00Z" },
  { id: "img-011", src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=900&q=80", title: "Brand Campaign — Lumière", alt: "Skincare product campaign imagery", category: "Commercial", visible: true, order: 11, uploadedAt: "2026-04-10T10:00:00Z" },
  { id: "img-012", src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80", title: "Outdoor Festival", alt: "Photography at outdoor music festival", category: "Events", visible: true, order: 12, uploadedAt: "2026-04-20T15:00:00Z" },
  { id: "img-013", src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&q=80", title: "Behind the Lens", alt: "Photographer at work behind the scenes", category: "Behind the Scenes", visible: false, order: 13, uploadedAt: "2026-05-01T09:00:00Z" },
  { id: "img-014", src: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&q=80", title: "Studio Setup", alt: "Photography studio lighting setup", category: "Behind the Scenes", visible: false, order: 14, uploadedAt: "2026-05-10T11:00:00Z" },
];

export const galleryCategories: GalleryCategory[] = [
  "Weddings",
  "Portraits",
  "Commercial",
  "Events",
  "Behind the Scenes",
];

// Helpers
export function getVisibleImages(): GalleryImage[] {
  return galleryImages
    .filter((img) => img.visible)
    .sort((a, b) => a.order - b.order);
}

export function getImagesByCategory(category: GalleryCategory): GalleryImage[] {
  return galleryImages
    .filter((img) => img.category === category && img.visible)
    .sort((a, b) => a.order - b.order);
}
