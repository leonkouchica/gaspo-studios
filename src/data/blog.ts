// src/data/blog.ts
// Static seed data for the Blog management module.
// Pre-typed to match planned Supabase `blog_posts` table schema.

export type PostStatus = "draft" | "published" | "scheduled";

export interface BlogAuthor {
  name: string;
  avatar: string;
  role: string;
}

export interface BlogPostFull {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string; // Rich text / markdown — rendered as HTML in the public view
  category: string;
  tags: string[];
  author: BlogAuthor;
  featuredImage: string;
  status: PostStatus;
  publishedAt: string | null;
  scheduledFor?: string;
  views: number;
  comments: number;
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const marcoAuthor: BlogAuthor = {
  name: "Marco Gaspo",
  avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80",
  role: "Founder & Senior Photographer",
};

const aishaAuthor: BlogAuthor = {
  name: "Aisha Bello",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
  role: "Lead Retoucher & Editor",
};

export const blogPosts: BlogPostFull[] = [
  {
    id: "post-001",
    slug: "ten-lessons-from-a-decade-of-wedding-photography",
    title: "Ten Lessons From a Decade of Wedding Photography",
    excerpt:
      "Marco reflects on the moments, mistakes and breakthroughs that have shaped Gaspo Studios' wedding work — and what every couple should know before booking.",
    body: `<p>A decade ago, I showed up to my first wedding with a borrowed camera and a prayer. Today, Gaspo Studios has photographed over 200 weddings across Nigeria and beyond. Here are the ten things I wish I'd known on day one.</p>
<h2>1. The pre-ceremony is as important as the ceremony</h2>
<p>The laughter while bridesmaids get ready, the father seeing his daughter for the first time — these quiet moments often become the most treasured images in an album.</p>
<h2>2. Always bring a backup</h2>
<p>Camera bodies fail. Memory cards corrupt. A professional always has a plan B — and at Gaspo Studios, we always bring one.</p>`,
    category: "Wedding",
    tags: ["wedding", "tips", "behind-the-scenes"],
    author: marcoAuthor,
    featuredImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    status: "published",
    publishedAt: "2026-05-28T08:00:00Z",
    views: 1842,
    comments: 14,
    seo: {
      title: "10 Lessons From a Decade of Wedding Photography — Gaspo Studios",
      description:
        "Marco Gaspo shares the moments, mistakes and breakthroughs from 10+ years photographing weddings. Essential reading for couples and photographers alike.",
    },
    createdAt: "2026-05-25T10:00:00Z",
    updatedAt: "2026-05-28T07:50:00Z",
  },
  {
    id: "post-002",
    slug: "how-to-pose-for-headshots-practical-guide",
    title: "How to Pose for Headshots: A Practical Guide",
    excerpt:
      "Small adjustments make a huge difference. Here's the cheat sheet we share with every client.",
    body: `<p>Great headshots aren't about looking 'professional' — they're about looking like the best version of yourself. Here's how to nail your next session.</p>
<h2>The Jaw Forward Trick</h2>
<p>Bring your chin slightly forward and down. It creates definition along the jawline and prevents unflattering shadows under the chin.</p>`,
    category: "Tips",
    tags: ["headshots", "posing", "portrait"],
    author: marcoAuthor,
    featuredImage:
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&q=80",
    status: "published",
    publishedAt: "2026-05-12T09:00:00Z",
    views: 962,
    comments: 8,
    seo: {
      title: "How to Pose for Headshots — Gaspo Studios Guide",
      description:
        "The exact posing tips Gaspo Studios shares with every headshot client. Chin position, angles, expressions — all covered.",
    },
    createdAt: "2026-05-10T11:00:00Z",
    updatedAt: "2026-05-12T08:45:00Z",
  },
  {
    id: "post-003",
    slug: "behind-scenes-brand-shoot",
    title: "Behind the Scenes of Our Latest Brand Shoot",
    excerpt:
      "A look inside our two-day campaign for an emerging skincare label.",
    body: `<p>Earlier this month we wrapped a two-day product campaign for Lagos-based skincare brand Lumière. Here's how we approached it from pre-production to final delivery.</p>`,
    category: "Studio",
    tags: ["commercial", "behind-the-scenes", "brand"],
    author: aishaAuthor,
    featuredImage:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80",
    status: "published",
    publishedAt: "2026-04-30T10:00:00Z",
    views: 541,
    comments: 3,
    seo: {
      title: "Behind the Scenes: Brand Campaign Shoot — Gaspo Studios",
      description:
        "Go inside a two-day product photography campaign for an emerging skincare brand at Gaspo Studios Lagos.",
    },
    createdAt: "2026-04-28T09:00:00Z",
    updatedAt: "2026-04-30T09:50:00Z",
  },
  {
    id: "post-004",
    slug: "color-grading-where-art-meets-math",
    title: "Color Grading: Where Art Meets Math",
    excerpt: "Aisha walks through her three-stage grading workflow.",
    body: `<p>Colour grading is the last mile of photography — and the most misunderstood. Here's my exact workflow, from import to export.</p>`,
    category: "Editorial",
    tags: ["editing", "color-grading", "workflow"],
    author: aishaAuthor,
    featuredImage:
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
    status: "published",
    publishedAt: "2026-03-14T10:00:00Z",
    views: 2103,
    comments: 9,
    seo: {
      title: "Color Grading: Where Art Meets Math — Gaspo Studios",
      description:
        "Lead retoucher Aisha Bello breaks down her three-stage colour grading workflow for portrait and wedding photography.",
    },
    createdAt: "2026-03-12T08:00:00Z",
    updatedAt: "2026-03-14T09:30:00Z",
  },
  {
    id: "post-005",
    slug: "top-lenses-every-shoot",
    title: "Lenses We Reach For Every Single Shoot",
    excerpt:
      "From the workhorse 35mm to the dreamy 85, our editors share their favorite glass.",
    body: `<p>We get asked about our gear constantly — so here's a straight answer: these are the lenses that live on our cameras.</p>`,
    category: "Gear",
    tags: ["gear", "lenses", "equipment"],
    author: marcoAuthor,
    featuredImage:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
    status: "draft",
    publishedAt: null,
    views: 0,
    comments: 0,
    seo: {
      title: "Our Favourite Lenses — Gaspo Studios",
      description:
        "The exact lenses the Gaspo Studios team reaches for on every shoot — from weddings to commercial campaigns.",
    },
    createdAt: "2026-05-29T14:00:00Z",
    updatedAt: "2026-05-30T10:00:00Z",
  },
  {
    id: "post-006",
    slug: "why-we-print",
    title: "Why We Print: The Case for Physical Photographs",
    excerpt: "Hard drives die. Prints outlast generations. Here's our pitch.",
    body: `<p>We live in an age of infinite digital storage and zero printing. Here's why that's a mistake — and why physical photographs will outlast every device you own.</p>`,
    category: "Industry",
    tags: ["printing", "philosophy", "archiving"],
    author: marcoAuthor,
    featuredImage:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
    status: "scheduled",
    publishedAt: null,
    scheduledFor: "2026-06-15T09:00:00Z",
    views: 0,
    comments: 0,
    seo: {
      title: "Why We Print: The Case for Physical Photographs — Gaspo Studios",
      description:
        "A passionate argument for printing your photographs, from the founder of Gaspo Studios.",
    },
    createdAt: "2026-05-28T12:00:00Z",
    updatedAt: "2026-05-30T08:00:00Z",
  },
];

export const blogCategories = [
  "Wedding",
  "Tips",
  "Studio",
  "Gear",
  "Industry",
  "Editorial",
  "Portraits",
  "Commercial",
];

// Helpers
export function getPostBySlug(slug: string): BlogPostFull | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getPublishedPosts(): BlogPostFull[] {
  return blogPosts.filter((p) => p.status === "published");
}

export function getFeaturedPost(): BlogPostFull | undefined {
  return blogPosts.find((p) => p.status === "published");
}
