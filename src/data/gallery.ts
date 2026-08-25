// src/data/gallery.ts
// Static seed data for the Gallery management module.
// Pre-typed to match planned Supabase `gallery_images` table schema.

export type GalleryCategory =
  | "Weddings"
  | "Portraits"
  | "Commercial"
  | "Events"
  | "Studio"
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
  {
    id: "img-001",
    src: "/images/wedding_couple.webp",
    title: "Golden Hour Wedding",
    alt: "Couple embracing at golden hour",
    category: "Weddings",
    visible: true,
    order: 1,
    uploadedAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "img-002",
    src: "/images/portrait_woman.webp",
    title: "Studio Portrait — Adaeze",
    alt: "Woman with natural light portrait",
    category: "Portraits",
    visible: true,
    order: 2,
    uploadedAt: "2026-01-15T11:00:00Z",
  },
  {
    id: "img-003",
    src: "/images/corporate_team.webp",
    title: "Corporate Summit — Acme Group",
    alt: "Business panel at conference",
    category: "Commercial",
    visible: true,
    order: 3,
    uploadedAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "img-004",
    src: "/images/events_crowd.webp",
    title: "Tech Conference 2026",
    alt: "Crowd at tech conference",
    category: "Events",
    visible: true,
    order: 4,
    uploadedAt: "2026-02-10T14:00:00Z",
  },
  {
    id: "img-005",
    src: "/images/wedding_couple.webp",
    title: "Beachside Ceremony",
    alt: "Wedding ceremony on the beach",
    category: "Weddings",
    visible: true,
    order: 5,
    uploadedAt: "2026-02-20T08:00:00Z",
  },
  {
    id: "img-006",
    src: "/images/team_founder.webp",
    title: "Executive Headshots — Chidi",
    alt: "Male executive professional headshot",
    category: "Portraits",
    visible: true,
    order: 6,
    uploadedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "img-007",
    src: "/images/photographer_hero.webp",
    title: "Studio Product Campaign",
    alt: "Photographer in studio",
    category: "Commercial",
    visible: true,
    order: 7,
    uploadedAt: "2026-03-10T13:00:00Z",
  },
  {
    id: "img-008",
    src: "/images/events_crowd.webp",
    title: "Gala Night 2026",
    alt: "Event photography at formal gala",
    category: "Events",
    visible: true,
    order: 8,
    uploadedAt: "2026-03-15T19:00:00Z",
  },
  {
    id: "img-009",
    src: "/images/wedding_couple.webp",
    title: "Reception Details",
    alt: "Wedding couple at reception",
    category: "Weddings",
    visible: true,
    order: 9,
    uploadedAt: "2026-03-20T11:00:00Z",
  },
  {
    id: "img-010",
    src: "/images/portrait_woman.webp",
    title: "Natural Light Portrait",
    alt: "Woman photographed in natural light",
    category: "Portraits",
    visible: true,
    order: 10,
    uploadedAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "img-011",
    src: "/images/corporate_team.webp",
    title: "Brand Campaign — Lumière",
    alt: "Corporate brand campaign imagery",
    category: "Commercial",
    visible: true,
    order: 11,
    uploadedAt: "2026-04-10T10:00:00Z",
  },
  {
    id: "img-012",
    src: "/images/events_crowd.webp",
    title: "Outdoor Festival",
    alt: "Photography at outdoor music festival",
    category: "Events",
    visible: true,
    order: 12,
    uploadedAt: "2026-04-20T15:00:00Z",
  },
  {
    id: "img-013",
    src: "/images/photographer_hero.webp",
    title: "Behind the Lens",
    alt: "Photographer at work behind the scenes",
    category: "Behind the Scenes",
    visible: false,
    order: 13,
    uploadedAt: "2026-05-01T09:00:00Z",
  },
  {
    id: "img-014",
    src: "/images/corporate_team.webp",
    title: "Studio Setup",
    alt: "Photography studio team",
    category: "Behind the Scenes",
    visible: false,
    order: 14,
    uploadedAt: "2026-05-10T11:00:00Z",
  },
];

export const galleryCategories: GalleryCategory[] = [
  "Weddings",
  "Portraits",
  "Commercial",
  "Events",
  "Studio",
  "Behind the Scenes",
];

// Helpers
export function getVisibleImages(): GalleryImage[] {
  return galleryImages.filter((img) => img.visible).sort((a, b) => a.order - b.order);
}

export function getImagesByCategory(category: GalleryCategory): GalleryImage[] {
  return galleryImages
    .filter((img) => img.category === category && img.visible)
    .sort((a, b) => a.order - b.order);
}
