/**
 * scripts/seed-supabase.mjs
 * Phase 9 — Supabase data seeding
 *
 * Seeds: blog_posts, gallery_images, bookings, events
 *
 * Usage (from project root):
 *   node --env-file=.env scripts/seed-supabase.mjs
 *
 * Requires env vars:
 *   VITE_SUPABASE_URL          — your project URL
 *   SUPABASE_SERVICE_ROLE_KEY  — service-role key (bypasses RLS)
 */

import { createClient } from "@supabase/supabase-js";

// ─── Supabase client ──────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "\n❌  Missing env vars.\n" +
      "    Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env\n" +
      "    and that you run:  node --env-file=.env scripts/seed-supabase.mjs\n"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(icon, msg) {
  console.log(`${icon}  ${msg}`);
}

async function upsertTable(tableName, rows, conflictColumn = "id") {
  log("⏳", `Seeding ${tableName} (${rows.length} rows)…`);
  const { error, data } = await supabase
    .from(tableName)
    .upsert(rows, { onConflict: conflictColumn, ignoreDuplicates: false })
    .select("id");

  if (error) {
    console.error(`  ❌  ${tableName}:`, error.message, error.details ?? "");
    return false;
  }
  log("✅", `${tableName} — ${data?.length ?? rows.length} rows seeded.`);
  return true;
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
// Translated from src/data/*.ts — types stripped, column names snake_cased.

// ── 1. blog_posts ─────────────────────────────────────────────────────────────

const blogPosts = [
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
    author_name: "Marco Gaspo",
    author_avatar: "/images/team_founder.webp",
    author_role: "Founder & Senior Photographer",
    featured_image: "/images/wedding_couple.webp",
    status: "published",
    published_at: "2026-05-28T08:00:00Z",
    views: 1842,
    comments: 14,
    seo_title: "10 Lessons From a Decade of Wedding Photography — Gaspo Studios",
    seo_description:
      "Marco Gaspo shares the moments, mistakes and breakthroughs from 10+ years photographing weddings. Essential reading for couples and photographers alike.",
    created_at: "2026-05-25T10:00:00Z",
    updated_at: "2026-05-28T07:50:00Z",
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
    author_name: "Marco Gaspo",
    author_avatar: "/images/team_founder.webp",
    author_role: "Founder & Senior Photographer",
    featured_image: "/images/photographer_hero.webp",
    status: "published",
    published_at: "2026-05-12T09:00:00Z",
    views: 962,
    comments: 8,
    seo_title: "How to Pose for Headshots — Gaspo Studios Guide",
    seo_description:
      "The exact posing tips Gaspo Studios shares with every headshot client. Chin position, angles, expressions — all covered.",
    created_at: "2026-05-10T11:00:00Z",
    updated_at: "2026-05-12T08:45:00Z",
  },
  {
    id: "post-003",
    slug: "behind-scenes-brand-shoot",
    title: "Behind the Scenes of Our Latest Brand Shoot",
    excerpt: "A look inside our two-day campaign for an emerging skincare label.",
    body: `<p>Earlier this month we wrapped a two-day product campaign for Lagos-based skincare brand Lumière. Here's how we approached it from pre-production to final delivery.</p>`,
    category: "Studio",
    tags: ["commercial", "behind-the-scenes", "brand"],
    author_name: "Aisha Bello",
    author_avatar: "/images/portrait_woman.webp",
    author_role: "Lead Retoucher & Editor",
    featured_image: "/images/corporate_team.webp",
    status: "published",
    published_at: "2026-04-30T10:00:00Z",
    views: 541,
    comments: 3,
    seo_title: "Behind the Scenes: Brand Campaign Shoot — Gaspo Studios",
    seo_description:
      "Go inside a two-day product photography campaign for an emerging skincare brand at Gaspo Studios Lagos.",
    created_at: "2026-04-28T09:00:00Z",
    updated_at: "2026-04-30T09:50:00Z",
  },
  {
    id: "post-004",
    slug: "color-grading-where-art-meets-math",
    title: "Color Grading: Where Art Meets Math",
    excerpt: "Aisha walks through her three-stage grading workflow.",
    body: `<p>Colour grading is the last mile of photography — and the most misunderstood. Here's my exact workflow, from import to export.</p>`,
    category: "Editorial",
    tags: ["editing", "color-grading", "workflow"],
    author_name: "Aisha Bello",
    author_avatar: "/images/portrait_woman.webp",
    author_role: "Lead Retoucher & Editor",
    featured_image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
    status: "published",
    published_at: "2026-03-14T10:00:00Z",
    views: 2103,
    comments: 9,
    seo_title: "Color Grading: Where Art Meets Math — Gaspo Studios",
    seo_description:
      "Lead retoucher Aisha Bello breaks down her three-stage colour grading workflow for portrait and wedding photography.",
    created_at: "2026-03-12T08:00:00Z",
    updated_at: "2026-03-14T09:30:00Z",
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
    author_name: "Marco Gaspo",
    author_avatar: "/images/team_founder.webp",
    author_role: "Founder & Senior Photographer",
    featured_image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
    status: "draft",
    published_at: null,
    views: 0,
    comments: 0,
    seo_title: "Our Favourite Lenses — Gaspo Studios",
    seo_description:
      "The exact lenses the Gaspo Studios team reaches for on every shoot — from weddings to commercial campaigns.",
    created_at: "2026-05-29T14:00:00Z",
    updated_at: "2026-05-30T10:00:00Z",
  },
  {
    id: "post-006",
    slug: "why-we-print",
    title: "Why We Print: The Case for Physical Photographs",
    excerpt: "Hard drives die. Prints outlast generations. Here's our pitch.",
    body: `<p>We live in an age of infinite digital storage and zero printing. Here's why that's a mistake — and why physical photographs will outlast every device you own.</p>`,
    category: "Industry",
    tags: ["printing", "philosophy", "archiving"],
    author_name: "Marco Gaspo",
    author_avatar: "/images/team_founder.webp",
    author_role: "Founder & Senior Photographer",
    featured_image: "/images/photographer_hero.webp",
    status: "scheduled",
    published_at: null,
    scheduled_for: "2026-06-15T09:00:00Z",
    views: 0,
    comments: 0,
    seo_title: "Why We Print: The Case for Physical Photographs — Gaspo Studios",
    seo_description:
      "A passionate argument for printing your photographs, from the founder of Gaspo Studios.",
    created_at: "2026-05-28T12:00:00Z",
    updated_at: "2026-05-30T08:00:00Z",
  },
];

// ── 2. gallery_images ─────────────────────────────────────────────────────────
// Note: schema column is `display_order` (not `order`)

const galleryImages = [
  { id: "img-001", src: "/images/wedding_couple.webp",   title: "Golden Hour Wedding",          alt: "Couple embracing at golden hour",           category: "Weddings",           visible: true,  display_order: 1,  uploaded_at: "2026-01-10T10:00:00Z" },
  { id: "img-002", src: "/images/portrait_woman.webp",   title: "Studio Portrait — Adaeze",     alt: "Woman with natural light portrait",          category: "Portraits",          visible: true,  display_order: 2,  uploaded_at: "2026-01-15T11:00:00Z" },
  { id: "img-003", src: "/images/corporate_team.webp",   title: "Corporate Summit — Acme Group",alt: "Business panel at conference",               category: "Commercial",         visible: true,  display_order: 3,  uploaded_at: "2026-02-01T09:00:00Z" },
  { id: "img-004", src: "/images/events_crowd.webp",     title: "Tech Conference 2026",         alt: "Crowd at tech conference",                   category: "Events",             visible: true,  display_order: 4,  uploaded_at: "2026-02-10T14:00:00Z" },
  { id: "img-005", src: "/images/wedding_couple.webp",   title: "Beachside Ceremony",           alt: "Wedding ceremony on the beach",              category: "Weddings",           visible: true,  display_order: 5,  uploaded_at: "2026-02-20T08:00:00Z" },
  { id: "img-006", src: "/images/team_founder.webp",     title: "Executive Headshots — Chidi",  alt: "Male executive professional headshot",       category: "Portraits",          visible: true,  display_order: 6,  uploaded_at: "2026-03-01T10:00:00Z" },
  { id: "img-007", src: "/images/photographer_hero.webp",title: "Studio Product Campaign",      alt: "Photographer in studio",                     category: "Commercial",         visible: true,  display_order: 7,  uploaded_at: "2026-03-10T13:00:00Z" },
  { id: "img-008", src: "/images/events_crowd.webp",     title: "Gala Night 2026",              alt: "Event photography at formal gala",           category: "Events",             visible: true,  display_order: 8,  uploaded_at: "2026-03-15T19:00:00Z" },
  { id: "img-009", src: "/images/wedding_couple.webp",   title: "Reception Details",            alt: "Wedding couple at reception",                category: "Weddings",           visible: true,  display_order: 9,  uploaded_at: "2026-03-20T11:00:00Z" },
  { id: "img-010", src: "/images/portrait_woman.webp",   title: "Natural Light Portrait",       alt: "Woman photographed in natural light",        category: "Portraits",          visible: true,  display_order: 10, uploaded_at: "2026-04-01T09:00:00Z" },
  { id: "img-011", src: "/images/corporate_team.webp",   title: "Brand Campaign — Lumière",     alt: "Corporate brand campaign imagery",           category: "Commercial",         visible: true,  display_order: 11, uploaded_at: "2026-04-10T10:00:00Z" },
  { id: "img-012", src: "/images/events_crowd.webp",     title: "Outdoor Festival",             alt: "Photography at outdoor music festival",      category: "Events",             visible: true,  display_order: 12, uploaded_at: "2026-04-20T15:00:00Z" },
  { id: "img-013", src: "/images/photographer_hero.webp",title: "Behind the Lens",              alt: "Photographer at work behind the scenes",     category: "Behind the Scenes",  visible: false, display_order: 13, uploaded_at: "2026-05-01T09:00:00Z" },
  { id: "img-014", src: "/images/corporate_team.webp",   title: "Studio Setup",                 alt: "Photography studio team",                   category: "Behind the Scenes",  visible: false, display_order: 14, uploaded_at: "2026-05-10T11:00:00Z" },
];

// ── 3. bookings ───────────────────────────────────────────────────────────────
// Note: camelCase → snake_case (preferredDate → preferred_date, etc.)

const bookings = [
  {
    id: "bk-001",
    name: "Adaeze Okonkwo",
    email: "adaeze@gmail.com",
    phone: "+234 803 456 7890",
    service: "Wedding Photography",
    package: "Full Day Coverage",
    preferred_date: "2026-08-15",
    preferred_time: "09:00",
    message: "We're planning an outdoor ceremony at Lekki Conservation Centre. Would love natural light shots.",
    status: "confirmed",
    submitted_at: "2026-05-20T14:23:00Z",
    admin_notes: "Confirmed via phone call. Deposit paid ₦1,080,000.",
    total_value: 3600000,
  },
  {
    id: "bk-002",
    name: "Chidi Eze",
    email: "chidi.eze@acme.ng",
    phone: "+234 807 123 4567",
    service: "Corporate Event",
    package: "Half Day Coverage",
    preferred_date: "2026-06-10",
    preferred_time: "10:30",
    message: "Annual shareholders meeting. Formal attire. Approx 80 attendees.",
    status: "new",
    submitted_at: "2026-05-29T09:12:00Z",
    total_value: 1800000,
  },
  {
    id: "bk-003",
    name: "Funmi Adeyemi",
    email: "funmi@stylehouse.com",
    phone: "+234 815 987 6543",
    service: "Commercial Shoot",
    package: "Full Day Shoot",
    preferred_date: "2026-07-01",
    preferred_time: "08:00",
    message: "Product launch campaign for our new skincare line. Need 5 models, 3 different looks.",
    status: "reviewed",
    submitted_at: "2026-05-27T16:45:00Z",
    admin_notes: "Following up with creative brief. Awaiting mood board from client.",
    total_value: 2700000,
  },
  {
    id: "bk-004",
    name: "Tunde Bakare",
    email: "tunde@tundephotos.net",
    phone: "+234 802 234 5678",
    service: "Portrait Session",
    package: "90-Minute Session",
    preferred_date: "2026-06-05",
    preferred_time: "15:00",
    message: "Professional headshots for my LinkedIn and company website.",
    status: "completed",
    submitted_at: "2026-05-15T11:30:00Z",
    admin_notes: "Shoot completed. Gallery delivered via link on May 22nd. Client very happy.",
    total_value: 675000,
  },
  {
    id: "bk-005",
    name: "Nkechi Obi",
    email: "nkechi.obi@outlook.com",
    phone: "+234 809 876 5432",
    service: "Wedding Photography",
    package: "Full Day Coverage",
    preferred_date: "2026-09-20",
    preferred_time: "09:00",
    message: "Traditional and white wedding same day. Venue TBC.",
    status: "new",
    submitted_at: "2026-05-30T08:55:00Z",
    total_value: 3600000,
  },
  {
    id: "bk-006",
    name: "Emeka Nwosu",
    email: "emeka@techstartup.io",
    phone: "+234 818 345 6789",
    service: "Corporate Event",
    package: "Half Day Coverage",
    preferred_date: "2026-06-18",
    preferred_time: "13:00",
    message: "Product demo day. Mostly candid shots of our team and invited investors.",
    status: "cancelled",
    submitted_at: "2026-05-10T10:00:00Z",
    admin_notes: "Client cancelled — event postponed to Q4.",
    total_value: 1800000,
  },
];

// ── 4. events ─────────────────────────────────────────────────────────────────
// Complex JSONB fields: speakers, agenda, sponsor_packages, seo
// Array fields: objectives, outcomes, topics, gallery_images

const defaultSponsorPackages = [
  {
    id: "gold",
    name: "Gold Sponsor",
    price: 6000000,
    currency: "NGN",
    highlighted: true,
    benefits: [
      "Title sponsor recognition",
      "Premium branding on all materials",
      "Keynote speaking slot",
      "Front cover advert placement",
      "Full-page brochure advert",
      "Exhibition booth",
      "Brand activation",
      "6 VIP passes",
    ],
  },
  {
    id: "silver",
    name: "Silver Sponsor",
    price: 4000000,
    currency: "NGN",
    benefits: [
      "Logo visibility on all materials",
      "Panel speaking opportunity",
      "Exhibition booth",
      "Full advert page in brochure",
      "4 event passes",
    ],
  },
  {
    id: "bronze",
    name: "Bronze Sponsor",
    price: 3000000,
    currency: "NGN",
    benefits: [
      "Logo placement",
      "Shared display branding",
      "Half-page brochure advert",
      "2 event passes",
    ],
  },
  {
    id: "official-partner",
    name: "Official Partner",
    price: 2500000,
    currency: "NGN",
    benefits: ["Partner recognition across channels", "Certificate award", "Media mentions"],
  },
  {
    id: "general-partner",
    name: "General Partner",
    price: 1500000,
    currency: "NGN",
    benefits: ["Vendor booth access"],
  },
];

const events = [
  {
    id: "evt-001",
    slug: "future-of-ai-networking-2026",
    title: "Future of AI & Networking",
    summary:
      "A premier conference exploring the convergence of artificial intelligence and professional networking — bringing together industry leaders, innovators, and forward-thinkers.",
    description:
      "Join us for an unmissable full-day conference where the brightest minds in AI, technology, and business converge to shape the future. The Future of AI & Networking 2026 event is your gateway to cutting-edge insights, hands-on workshops, and unparalleled networking opportunities with over 500 attendees from across Africa and beyond.\n\nThis is more than a conference — it's a launchpad for partnerships, ideas, and the innovations that will define the next decade of business and technology in Africa.",
    objectives: [
      "Explore the latest breakthroughs in artificial intelligence and machine learning",
      "Connect professionals across tech, finance, healthcare, and creative industries",
      "Showcase local and international AI-driven solutions transforming African markets",
      "Provide actionable frameworks for integrating AI into business operations",
    ],
    outcomes: [
      "Walk away with a curated network of 50+ new professional connections",
      "Gain practical knowledge from 10+ expert-led sessions",
      "Access to exclusive post-event resources and recordings",
      "Certificate of participation from Gaspo Studios & GASPOTECH",
    ],
    topics: [
      "Generative AI in creative industries",
      "AI-powered business automation",
      "Ethics and governance in AI",
      "Machine learning for African markets",
      "The future of work in an AI-first world",
      "Startup funding in the AI era",
    ],
    target_audience:
      "Tech professionals, entrepreneurs, business leaders, investors, researchers, and anyone passionate about the intersection of AI and business innovation.",
    category: "Technology",
    type: "hybrid",
    status: "upcoming",
    date: "2026-09-12T00:00:00Z",
    time: "09:30",
    end_time: "17:00",
    venue: "Eko Hotel & Suites, Victoria Island",
    address: "Plot 1415, Adetokunbo Ademola Street",
    city: "Lagos",
    country: "Nigeria",
    map_embed_url:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7!2d3.4282!3d6.4281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjUnNDEuMiJOIDPCsDI1JzQxLjUiRQ!5e0!3m2!1sen!2sng!4v1234567890",
    banner_image: "/images/events_crowd.webp",
    gallery_images: [
      "/images/events_crowd.webp",
      "/images/corporate_team.webp",
      "/images/portrait_woman.webp",
    ],
    speakers: [
      {
        id: "spk-001",
        name: "Dr. Emily Carter",
        title: "Chief AI Scientist",
        company: "TechNova Africa",
        bio: "Dr. Emily Carter is a pioneering AI researcher with over 15 years of experience building machine learning systems for emerging markets. She leads TechNova Africa's research division and has published 40+ peer-reviewed papers on ethical AI development.",
        photo: "/images/portrait_woman.webp",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
      },
      {
        id: "spk-002",
        name: "Elon Park",
        title: "CEO & Co-Founder",
        company: "FutureStack",
        bio: "Elon Park is the co-founder of FutureStack, a Silicon Valley-backed startup redefining enterprise automation. A serial entrepreneur and angel investor, Elon has built and sold three companies across fintech and AI verticals.",
        photo: "/images/team_founder.webp",
        linkedin: "https://linkedin.com",
      },
      {
        id: "spk-003",
        name: "Laura Kim",
        title: "VP of Engineering",
        company: "DeepMind Lagos",
        bio: "Laura Kim leads engineering at DeepMind Lagos, overseeing a team of 120 engineers building next-generation AI infrastructure. Prior to DeepMind, she held senior roles at Google Brain and OpenAI.",
        photo: "/images/portrait_woman.webp",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
      },
      {
        id: "spk-004",
        name: "Dr. Alan Foster",
        title: "Professor of AI Ethics",
        company: "University of Lagos",
        bio: "Dr. Alan Foster is Nigeria's foremost authority on AI governance and ethics. His research on bias in algorithmic decision-making has influenced policy across 12 African nations. He advises the African Union on digital transformation.",
        photo: "/images/team_founder.webp",
        linkedin: "https://linkedin.com",
      },
    ],
    agenda: [
      { time: "09:00", title: "Registration & Welcome Coffee" },
      {
        time: "09:30",
        title: "Opening Keynote: The AI Decade Ahead",
        speaker: "Dr. Emily Carter",
        description:
          "Setting the stage for a transformative day with a panoramic view of where AI is heading and what it means for Africa.",
      },
      {
        time: "10:30",
        title: "Panel: AI & The Future of African Business",
        speaker: "Elon Park, Laura Kim",
        description:
          "A high-energy panel discussion exploring real-world applications of AI across key African industries.",
      },
      { time: "11:30", title: "Networking Break & Sponsor Showcase" },
      {
        time: "12:00",
        title: "Workshop: Building AI-Powered Products",
        speaker: "Laura Kim",
        description:
          "Hands-on session covering practical tools and frameworks for integrating AI into your product roadmap.",
      },
      { time: "13:00", title: "Lunch & Networking" },
      {
        time: "14:00",
        title: "Talk: Ethics in AI — Getting It Right",
        speaker: "Dr. Alan Foster",
        description:
          "A compelling deep-dive into the moral and governance challenges of deploying AI systems at scale.",
      },
      {
        time: "15:00",
        title: "Startup Pitch Competition",
        description:
          "Five shortlisted African AI startups present to a panel of investors for prizes and funding opportunities.",
      },
      { time: "16:00", title: "Networking & Sponsor Booths" },
      { time: "16:30", title: "Closing Keynote & Awards", speaker: "Elon Park" },
      { time: "17:00", title: "End of Conference" },
    ],
    sponsor_packages: defaultSponsorPackages,
    sponsorship_enabled: true,
    registration_open: true,
    registration_deadline: "2026-09-05T00:00:00Z",
    capacity: 500,
    registration_count: 234,
    featured: true,
    seo: {
      title: "Future of AI & Networking 2026 — Gaspo Studios",
      description:
        "Join 500+ tech leaders at the Future of AI & Networking conference in Lagos. Expert keynotes, workshops, and unmatched networking. Register now.",
      ogImage: "/images/events_crowd.webp",
    },
    created_at: "2026-04-01T10:00:00Z",
    updated_at: "2026-05-20T14:30:00Z",
  },
  {
    id: "evt-002",
    slug: "portrait-lighting-masterclass-2026",
    title: "Portrait Lighting Masterclass",
    summary:
      "An intensive hands-on workshop covering one, two, and three-light portrait setups with our senior photographer. Leave with edited images and a comprehensive lighting guide.",
    description:
      "Master the art of portrait lighting in this full-day hands-on workshop at Gaspo Studios. Our senior photographer will guide you through the fundamentals and advanced techniques of studio and natural light portraiture — from single-light setups to complex multi-light rigs.\n\nYou'll spend the day working with professional models, experimenting with different modifiers, and learning the colour science behind creating magazine-worthy portraits.",
    objectives: [
      "Understand light quality, direction, and colour temperature",
      "Master single, two-light, and three-light portrait setups",
      "Work confidently with strobes, speedlights, and continuous LED panels",
      "Develop an eye for shadow, highlight, and catch-light placement",
    ],
    outcomes: [
      "A portfolio of 20+ edited portrait images from the day",
      "Comprehensive 40-page lighting guide PDF",
      "Certificate of completion",
      "Exclusive access to Gaspo Studios' private lighting presets",
    ],
    topics: [
      "Natural vs artificial light for portraits",
      "Rembrandt, butterfly, and loop lighting patterns",
      "Modifiers: softboxes, reflectors, and grids",
      "Colour grading portrait images",
      "Off-camera flash and sync speeds",
    ],
    target_audience:
      "Intermediate photographers who want to elevate their portrait work. Bring your own camera — all lighting equipment is provided.",
    category: "Workshop",
    type: "physical",
    status: "upcoming",
    date: "2026-07-12T00:00:00Z",
    time: "10:00",
    end_time: "16:00",
    venue: "Gaspo Studios",
    address: "14 Bayo Kuku Road, Ikoyi",
    city: "Lagos",
    country: "Nigeria",
    banner_image: "/images/photographer_hero.webp",
    gallery_images: [],
    speakers: [
      {
        id: "spk-005",
        name: "Marco Gaspo",
        title: "Founder & Senior Photographer",
        company: "Gaspo Studios",
        bio: "Marco Gaspo is the founder of Gaspo Studios and a photographer with over 12 years of experience spanning weddings, editorial, and commercial work. His images have appeared in Vogue, Forbes Africa, and TED stages globally.",
        photo: "/images/team_founder.webp",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
      },
    ],
    agenda: [
      { time: "10:00", title: "Welcome & Equipment Overview" },
      { time: "10:30", title: "One-Light Setups — Theory & Practice", speaker: "Marco Gaspo" },
      { time: "12:00", title: "Lunch Break" },
      { time: "13:00", title: "Two & Three-Light Rigs", speaker: "Marco Gaspo" },
      { time: "14:30", title: "Open Shooting — Model Session" },
      { time: "15:30", title: "Live Edit & Q&A", speaker: "Marco Gaspo" },
      { time: "16:00", title: "Close" },
    ],
    sponsor_packages: [],
    sponsorship_enabled: false,
    registration_open: true,
    registration_deadline: "2026-07-05T00:00:00Z",
    capacity: 12,
    registration_count: 9,
    featured: false,
    seo: {
      title: "Portrait Lighting Masterclass — Gaspo Studios Workshop",
      description:
        "Hands-on portrait lighting workshop at Gaspo Studios Lagos. Limited to 12 photographers. Expert guidance, professional models, edited portfolio images.",
    },
    created_at: "2026-04-15T09:00:00Z",
    updated_at: "2026-05-10T11:00:00Z",
  },
  {
    id: "evt-003",
    slug: "wedding-photographer-meetup-august-2026",
    title: "Wedding Photographer Meetup",
    summary:
      "An intimate evening of talks, drinks and portfolio reviews with the Gaspo team and fellow photographers.",
    description:
      "Connect with Lagos' best wedding photographers at our monthly Meetup. Whether you're just starting out or have shot 200 weddings, this is the community for you. Share war stories, get feedback on your portfolio, and build lasting relationships with peers who understand the hustle.",
    objectives: [
      "Build a local network of wedding photography peers",
      "Get honest portfolio feedback from industry veterans",
      "Discover new workflows, tools, and business strategies",
    ],
    outcomes: [
      "New professional connections in the Lagos photography scene",
      "Actionable feedback on your wedding portfolio",
      "Insider tips from Gaspo Studios' team",
    ],
    topics: [
      "Pricing your wedding packages",
      "Managing difficult clients",
      "Post-processing workflows",
      "Growing your social media presence",
    ],
    target_audience:
      "Wedding photographers of all experience levels based in Lagos and surroundings.",
    category: "Networking",
    type: "physical",
    status: "upcoming",
    date: "2026-08-03T00:00:00Z",
    time: "18:30",
    end_time: "21:00",
    venue: "Rooftop Venue",
    address: "27 Adeola Odeku Street",
    city: "Victoria Island, Lagos",
    country: "Nigeria",
    banner_image: "/images/wedding_couple.webp",
    gallery_images: [],
    speakers: [],
    agenda: [
      { time: "18:30", title: "Arrivals & Drinks" },
      { time: "19:00", title: "Welcome from Gaspo Studios" },
      { time: "19:15", title: "Portfolio Review Round — Group Feedback" },
      { time: "20:00", title: "Panel Discussion: Pricing & Business Tips" },
      { time: "20:45", title: "Open Networking" },
      { time: "21:00", title: "End of Evening" },
    ],
    sponsor_packages: [],
    sponsorship_enabled: false,
    registration_open: true,
    capacity: 30,
    registration_count: 17,
    featured: false,
    seo: {
      title: "Wedding Photographer Meetup Lagos — August 2026",
      description:
        "Free networking evening for wedding photographers in Lagos. Portfolio reviews, panel talks, and great company. RSVP now — limited spots.",
    },
    created_at: "2026-05-01T08:00:00Z",
    updated_at: "2026-05-25T09:00:00Z",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱  Gaspo Studios — Supabase Seed Script");
  console.log("   URL:", SUPABASE_URL);
  console.log("─".repeat(50));

  const results = await Promise.allSettled([
    upsertTable("blog_posts",     blogPosts,     "slug"),
    upsertTable("gallery_images", galleryImages, "id"),
    upsertTable("bookings",       bookings,      "id"),
    upsertTable("events",         events,        "slug"),
  ]);

  console.log("\n─".repeat(50));

  const failed = results.filter((r) => r.status === "rejected" || r.value === false);
  if (failed.length > 0) {
    console.error(`\n⚠️   ${failed.length} table(s) had errors. Check logs above.\n`);
    process.exit(1);
  }

  console.log("\n🎉  All tables seeded successfully!\n");
}

main().catch((err) => {
  console.error("\n❌  Unexpected error:", err);
  process.exit(1);
});
