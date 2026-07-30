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
      "    and that you run:  node --env-file=.env scripts/seed-supabase.mjs\n",
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
    excerpt: "From the workhorse 35mm to the dreamy 85, our editors share their favorite glass.",
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
  {
    id: "post-007",
    slug: "choosing-wedding-photographer-questions",
    title: "Choosing the Right Wedding Photographer: 15 Questions to Ask",
    excerpt:
      "Before you sign that contract, ask these 15 questions. Your wedding album will thank you.",
    body: `<p>Booking a wedding photographer is one of the biggest decisions you'll make in your planning journey — and one of the few that outlasts the day itself. Here are the 15 questions every couple should ask before signing.</p>
<h2>1. Can we see a full wedding gallery?</h2>
<p>Not just highlights. Ask to see an entire wedding — from getting ready to the last dance. This reveals consistency, not just cherry-picked best shots.</p>
<h2>2. How do you handle low light?</h2>
<p>Nigerian receptions are notoriously dark. Ask about off-camera flash, their typical ISO ceiling, and whether they bring continuous lighting.</p>
<h2>3. What's your backup plan?</h2>
<p>Cameras fail. Memory cards corrupt. A professional has backup bodies, lenses, cards, and batteries — and can explain exactly how they handle failure on the day.</p>
<h2>4. How many images do we receive?</h2>
<p>For a full-day wedding, expect 500–800 edited images. Anything less than 300 for a full day is a red flag.</p>
<h2>5. What's your editing style?</h2>
<p>Is it light and airy? Dark and moody? True-to-life? Make sure their portfolio matches your vision — asking a photographer to change their editing style rarely ends well.</p>`,
    category: "Wedding",
    tags: ["wedding", "planning", "checklist", "tips"],
    author_name: "Marco Gaspo",
    author_avatar: "/images/team_founder.webp",
    author_role: "Founder & Senior Photographer",
    featured_image: "/images/wedding_couple.webp",
    status: "published",
    published_at: "2026-04-18T09:00:00Z",
    views: 3201,
    comments: 22,
    seo_title: "15 Questions to Ask Your Wedding Photographer — Gaspo Studios",
    seo_description:
      "Before you book your wedding photographer, ask these 15 essential questions. Save time, money, and heartbreak.",
    created_at: "2026-04-15T10:00:00Z",
    updated_at: "2026-04-18T08:50:00Z",
  },
  {
    id: "post-008",
    slug: "photographers-guide-social-media-2026",
    title: "The Photographer's Guide to Social Media in 2026",
    excerpt:
      "Instagram's algorithm changed again. Here's what's actually working for photographers right now.",
    body: `<p>If you're still posting three carousel images a day and wondering why your engagement tanked, this post is for you. The social media landscape for photographers has shifted dramatically — here's the playbook for 2026.</p>
<h2>Video-first is no longer optional</h2>
<p>Reels and TikTok-style short-form video now drive 70% of new client inquiries at Gaspo Studios. But you don't need to become a videographer — a simple BTS clip of your lighting setup or a 15-second before/after edit comparison consistently outperforms static posts.</p>
<h2>Carousels aren't dead — they've evolved</h2>
<p>The winning format in 2026: educational carousels. Think '5 posing mistakes and how to fix them' — each slide shows a before/after with a short caption. Our top-performing carousel this year hit 48K impressions with zero ad spend.</p>
<h2>The platform shift nobody's talking about</h2>
<p>While everyone obsesses over Instagram, our highest converting platform for corporate clients is actually LinkedIn. We posted one behind-the-scenes shot from a boardroom shoot and booked three corporate packages within a week.</p>`,
    category: "Tips",
    tags: ["social-media", "marketing", "business", "instagram"],
    author_name: "Aisha Bello",
    author_avatar: "/images/portrait_woman.webp",
    author_role: "Lead Retoucher & Editor",
    featured_image: "/images/photographer_hero.webp",
    status: "published",
    published_at: "2026-03-22T10:00:00Z",
    views: 4501,
    comments: 31,
    seo_title: "Social Media Guide for Photographers 2026 — Gaspo Studios",
    seo_description:
      "What's actually working for photographers on social media in 2026. Instagram, TikTok, and LinkedIn strategies that drive bookings.",
    created_at: "2026-03-20T08:00:00Z",
    updated_at: "2026-03-22T09:45:00Z",
  },
  {
    id: "post-009",
    slug: "destination-wedding-cape-town-behind-scenes",
    title: "How We Shot: A Destination Wedding in Cape Town",
    excerpt:
      "Flying a photography team across the continent comes with unique challenges — and unforgettable rewards.",
    body: `<p>When Tolu and Kwame asked us to photograph their wedding at a vineyard in Stellenbosch, we said yes before they finished the sentence. Here's how we planned, packed, and executed a destination wedding 4,700 kilometres from our Lagos studio.</p>
<h2>The Gear Strategy</h2>
<p>Flying with gear means ruthless minimalism. We packed two bodies, three lenses (35mm, 85mm, 24-70mm), two speedlights, and a single LED panel — all in carry-on. Checked luggage had light stands, modifiers, and backup chargers.</p>
<h2>Location Scouting Remotely</h2>
<p>We arrived three days early and spent the first 24 hours mapping every shooting location on the vineyard property. The golden hour hit the ceremony site at 17:47 — we tested this with a scouting app and confirmed it twice. That attention to timing is why the ceremony photos glow the way they do.</p>
<h2>The Result</h2>
<p>1,200 edited images delivered in 14 days. Three magazine features. And one very happy couple who now have a wedding album that looks like it belongs in a travel magazine — because it genuinely does.</p>`,
    category: "Wedding",
    tags: ["destination-wedding", "behind-the-scenes", "travel", "gear"],
    author_name: "Marco Gaspo",
    author_avatar: "/images/team_founder.webp",
    author_role: "Founder & Senior Photographer",
    featured_image: "/images/wedding_couple.webp",
    status: "published",
    published_at: "2026-02-10T09:00:00Z",
    views: 2890,
    comments: 17,
    seo_title: "Destination Wedding Photography in Cape Town — Behind the Scenes",
    seo_description:
      "How the Gaspo Studios team planned and shot a destination wedding at a Stellenbosch vineyard.",
    created_at: "2026-02-08T10:00:00Z",
    updated_at: "2026-02-10T08:30:00Z",
  },
  {
    id: "post-010",
    slug: "raw-vs-jpeg-photography-guide",
    title: "RAW vs JPEG: Why We Shoot RAW (And When We Don't)",
    excerpt:
      "The file format debate, settled. Here's when RAW is non-negotiable — and when JPEG is the smarter choice.",
    body: `<p>Every photographer has an opinion on RAW vs JPEG. Here's ours — backed by 12 years of shooting everything from dimly lit receptions to high-speed commercial campaigns.</p>
<h2>Why we shoot RAW for 90% of our work</h2>
<p>RAW files capture 12-14 bits of colour data per pixel. JPEG captures 8. That's the difference between recovering a blown-out wedding dress and losing it forever. For weddings, portraits, and commercial work — anything where post-processing matters — we shoot RAW, always.</p>
<h2>When JPEG wins</h2>
<p>Corporate event coverage with a 4-hour turnaround? JPEG. The client needs images during the event for social media, not after a week of editing. We shoot RAW+JPEG to one card for this exact scenario — JPEGs go to the client's social team on-site, RAWs come back to the studio for selects.</p>
<h2>The storage reality</h2>
<p>A full-day wedding in RAW can hit 128GB. That's 2-3 memory cards, plus redundant backups. Budget for storage — it's part of the cost of doing professional work.</p>`,
    category: "Editorial",
    tags: ["raw", "jpeg", "editing", "workflow", "gear"],
    author_name: "Aisha Bello",
    author_avatar: "/images/portrait_woman.webp",
    author_role: "Lead Retoucher & Editor",
    featured_image: "/images/corporate_team.webp",
    status: "published",
    published_at: "2026-01-28T10:00:00Z",
    views: 5670,
    comments: 41,
    seo_title: "RAW vs JPEG Photography Guide — When to Use Each Format",
    seo_description:
      "The definitive guide to RAW vs JPEG for professional photographers. When RAW is essential and when JPEG is the smarter choice.",
    created_at: "2026-01-25T09:00:00Z",
    updated_at: "2026-01-28T09:55:00Z",
  },
  {
    id: "post-011",
    slug: "building-photography-portfolio-gets-hired",
    title: "Building a Photography Portfolio That Gets You Hired",
    excerpt:
      "Your portfolio isn't a gallery of your best work — it's a sales tool. Here's how to build one that converts.",
    body: `<p>Most photographers treat their portfolio like a trophy case: 'Look at all the beautiful things I've made.' The best photographers treat it like a sales page: 'Here's exactly why you should hire me.' The difference shows in your booking rate.</p>
<h2>Rule 1: Show the work you want to get booked for</h2>
<p>If you want more wedding clients, don't fill your portfolio with landscape shots from your holiday in Ghana. Clients hire you for the work you show — not the work you wish you could do.</p>
<h2>Rule 2: 12 images is the sweet spot</h2>
<p>Research shows that after 12-15 images, a client's attention drops. Curate ruthlessly. If an image isn't strong enough to stand alone, it's weakening your portfolio — not strengthening it.</p>
<h2>Rule 3: Lead with emotion, follow with technique</h2>
<p>Your hero image shouldn't be your most technically perfect shot. It should be the one that makes someone feel something. A technically imperfect image that captures genuine emotion will always outperform a flawless but sterile image.</p>`,
    category: "Tips",
    tags: ["portfolio", "business", "marketing", "career"],
    author_name: "Marco Gaspo",
    author_avatar: "/images/team_founder.webp",
    author_role: "Founder & Senior Photographer",
    featured_image: "/images/portrait_woman.webp",
    status: "published",
    published_at: "2025-11-08T09:00:00Z",
    views: 7800,
    comments: 53,
    seo_title: "How to Build a Photography Portfolio That Books Clients",
    seo_description:
      "Your portfolio is a sales tool, not a gallery. Learn the 5 rules for building a photography portfolio that converts viewers into clients.",
    created_at: "2025-11-05T11:00:00Z",
    updated_at: "2025-11-08T08:40:00Z",
  },
  {
    id: "post-012",
    slug: "gaspo-studios-studio-refresh-2026",
    title: "Our Studio Refresh: New Gear, New Space, Same Passion",
    excerpt:
      "We renovated our Ikoyi studio, added new lighting rigs, and expanded our editing suite. Here's a tour.",
    body: `<p>After six months of planning and three weeks of construction, our refreshed Ikoyi studio is finally ready. We've doubled our shooting space, added a dedicated client lounge, and invested in new Profoto lighting equipment that's already transforming our portrait work.</p>
<h2>The New Space</h2>
<p>Our main shooting bay now spans 60 square metres with 4-metre ceilings — enough room for full bridal party portraits and large product installations. The north-facing windows give us consistent natural light from 9 AM to 3 PM, which our portrait clients love.</p>
<h2>The New Gear</h2>
<p>We've added two Profoto B10X Plus units and a full set of OCF modifiers to our lighting arsenal. The difference in our portrait work has been immediate — faster recycling, more consistent colour temperature, and the freedom to shoot anywhere without hunting for power outlets.</p>
<h2>What Hasn't Changed</h2>
<p>New walls and new lights don't change why we do this. Every morning we still walk into this studio with the same mission: to capture images that matter — images that families will pass down, that businesses will build their brands on, that couples will look back on in fifty years and remember exactly how they felt.</p>`,
    category: "Studio",
    tags: ["studio", "gear", "behind-the-scenes", "announcement"],
    author_name: "Marco Gaspo",
    author_avatar: "/images/team_founder.webp",
    author_role: "Founder & Senior Photographer",
    featured_image: "/images/photographer_hero.webp",
    status: "published",
    published_at: "2026-05-01T08:00:00Z",
    views: 1230,
    comments: 9,
    seo_title: "Gaspo Studios Ikoyi Studio Refresh 2026 — New Space & Gear",
    seo_description:
      "Take a tour of our newly renovated Ikoyi photography studio — expanded shooting bays, new Profoto lighting, and a dedicated client lounge.",
    created_at: "2026-04-28T09:00:00Z",
    updated_at: "2026-05-01T07:45:00Z",
  },
];

// ── 2. gallery_images ─────────────────────────────────────────────────────────
// Note: schema column is `display_order` (not `order`)

const galleryImages = [
  {
    id: "img-001",
    src: "/images/wedding_couple.webp",
    title: "Golden Hour Wedding",
    alt: "Couple embracing at golden hour",
    category: "Weddings",
    visible: true,
    display_order: 1,
    uploaded_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "img-002",
    src: "/images/portrait_woman.webp",
    title: "Studio Portrait — Adaeze",
    alt: "Woman with natural light portrait",
    category: "Portraits",
    visible: true,
    display_order: 2,
    uploaded_at: "2026-01-15T11:00:00Z",
  },
  {
    id: "img-003",
    src: "/images/corporate_team.webp",
    title: "Corporate Summit — Acme Group",
    alt: "Business panel at conference",
    category: "Commercial",
    visible: true,
    display_order: 3,
    uploaded_at: "2026-02-01T09:00:00Z",
  },
  {
    id: "img-004",
    src: "/images/events_crowd.webp",
    title: "Tech Conference 2026",
    alt: "Crowd at tech conference",
    category: "Events",
    visible: true,
    display_order: 4,
    uploaded_at: "2026-02-10T14:00:00Z",
  },
  {
    id: "img-005",
    src: "/images/wedding_couple.webp",
    title: "Beachside Ceremony",
    alt: "Wedding ceremony on the beach",
    category: "Weddings",
    visible: true,
    display_order: 5,
    uploaded_at: "2026-02-20T08:00:00Z",
  },
  {
    id: "img-006",
    src: "/images/team_founder.webp",
    title: "Executive Headshots — Chidi",
    alt: "Male executive professional headshot",
    category: "Portraits",
    visible: true,
    display_order: 6,
    uploaded_at: "2026-03-01T10:00:00Z",
  },
  {
    id: "img-007",
    src: "/images/photographer_hero.webp",
    title: "Studio Product Campaign",
    alt: "Photographer in studio",
    category: "Commercial",
    visible: true,
    display_order: 7,
    uploaded_at: "2026-03-10T13:00:00Z",
  },
  {
    id: "img-008",
    src: "/images/events_crowd.webp",
    title: "Gala Night 2026",
    alt: "Event photography at formal gala",
    category: "Events",
    visible: true,
    display_order: 8,
    uploaded_at: "2026-03-15T19:00:00Z",
  },
  {
    id: "img-009",
    src: "/images/wedding_couple.webp",
    title: "Reception Details",
    alt: "Wedding couple at reception",
    category: "Weddings",
    visible: true,
    display_order: 9,
    uploaded_at: "2026-03-20T11:00:00Z",
  },
  {
    id: "img-010",
    src: "/images/portrait_woman.webp",
    title: "Natural Light Portrait",
    alt: "Woman photographed in natural light",
    category: "Portraits",
    visible: true,
    display_order: 10,
    uploaded_at: "2026-04-01T09:00:00Z",
  },
  {
    id: "img-011",
    src: "/images/corporate_team.webp",
    title: "Brand Campaign — Lumière",
    alt: "Corporate brand campaign imagery",
    category: "Commercial",
    visible: true,
    display_order: 11,
    uploaded_at: "2026-04-10T10:00:00Z",
  },
  {
    id: "img-012",
    src: "/images/events_crowd.webp",
    title: "Outdoor Festival",
    alt: "Photography at outdoor music festival",
    category: "Events",
    visible: true,
    display_order: 12,
    uploaded_at: "2026-04-20T15:00:00Z",
  },
  {
    id: "img-013",
    src: "/images/photographer_hero.webp",
    title: "Behind the Lens",
    alt: "Photographer at work behind the scenes",
    category: "Behind the Scenes",
    visible: false,
    display_order: 13,
    uploaded_at: "2026-05-01T09:00:00Z",
  },
  {
    id: "img-014",
    src: "/images/corporate_team.webp",
    title: "Studio Setup",
    alt: "Photography studio team",
    category: "Behind the Scenes",
    visible: false,
    display_order: 14,
    uploaded_at: "2026-05-10T11:00:00Z",
  },
  {
    id: "img-015",
    src: "/images/wedding_couple.webp",
    title: "Vintage Wedding Detail",
    alt: "Vintage wedding detail shot",
    category: "Weddings",
    visible: true,
    display_order: 15,
    uploaded_at: "2026-05-15T10:00:00Z",
  },
  {
    id: "img-016",
    src: "/images/portrait_woman.webp",
    title: "Bridal Prep — The Quiet Moments",
    alt: "Bride getting ready, quiet moment",
    category: "Weddings",
    visible: true,
    display_order: 16,
    uploaded_at: "2026-05-18T11:00:00Z",
  },
  {
    id: "img-017",
    src: "/images/team_founder.webp",
    title: "Corporate Headshot Series — Ola",
    alt: "Corporate headshot of male executive",
    category: "Portraits",
    visible: true,
    display_order: 17,
    uploaded_at: "2026-05-20T09:00:00Z",
  },
  {
    id: "img-018",
    src: "/images/wedding_couple.webp",
    title: "Family Portrait — The Adeyemis",
    alt: "Family of four portrait session",
    category: "Portraits",
    visible: true,
    display_order: 18,
    uploaded_at: "2026-05-22T14:00:00Z",
  },
  {
    id: "img-019",
    src: "/images/corporate_team.webp",
    title: "Product Flat-Lay — Lumière Skincare",
    alt: "Product flat-lay skincare shoot",
    category: "Commercial",
    visible: true,
    display_order: 19,
    uploaded_at: "2026-05-25T10:00:00Z",
  },
  {
    id: "img-020",
    src: "/images/photographer_hero.webp",
    title: "Restaurant Menu Shoot — Cilantro",
    alt: "Restaurant menu photography session",
    category: "Commercial",
    visible: true,
    display_order: 20,
    uploaded_at: "2026-05-28T13:00:00Z",
  },
  {
    id: "img-021",
    src: "/images/events_crowd.webp",
    title: "Award Ceremony — Tech Innovation",
    alt: "Tech innovation awards ceremony",
    category: "Events",
    visible: true,
    display_order: 21,
    uploaded_at: "2026-05-30T16:00:00Z",
  },
  {
    id: "img-022",
    src: "/images/wedding_couple.webp",
    title: "Birthday Celebration — 50th Gala",
    alt: "50th birthday gala celebration",
    category: "Events",
    visible: true,
    display_order: 22,
    uploaded_at: "2026-06-01T19:00:00Z",
  },
  {
    id: "img-023",
    src: "/images/photographer_hero.webp",
    title: "Lighting Test Session",
    alt: "Lighting test session in studio",
    category: "Behind the Scenes",
    visible: false,
    display_order: 23,
    uploaded_at: "2026-06-02T09:00:00Z",
  },
  {
    id: "img-024",
    src: "/images/corporate_team.webp",
    title: "Team Retreat — Ikoyi Studio",
    alt: "Team retreat at Ikoyi studio",
    category: "Behind the Scenes",
    visible: false,
    display_order: 24,
    uploaded_at: "2026-06-02T15:00:00Z",
  },
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
    message:
      "We're planning an outdoor ceremony at Lekki Conservation Centre. Would love natural light shots.",
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
  {
    id: "bk-007",
    name: "Oluwaseun Adebayo",
    email: "seun.adebayo@gmail.com",
    phone: "+234 816 789 0123",
    service: "Wedding Photography",
    package: "Full Day Coverage",
    preferred_date: "2026-10-03",
    preferred_time: "09:00",
    message:
      "Church ceremony at House on the Rock, reception at The Civic Centre. Approx 350 guests. We love candid, photojournalistic style.",
    status: "new",
    submitted_at: "2026-06-01T07:15:00Z",
    total_value: 3600000,
  },
  {
    id: "bk-008",
    name: "Zainab Ibrahim",
    email: "zainab.ibrahim@outlook.com",
    phone: "+234 812 345 6789",
    service: "Portrait Session",
    package: "90-Minute Session",
    preferred_date: "2026-06-20",
    preferred_time: "11:00",
    message:
      "Graduation portraits — Law School. Would love both indoor studio and outdoor garden shots.",
    status: "reviewed",
    submitted_at: "2026-05-31T14:20:00Z",
    admin_notes: "Called client — confirmed outdoor location available at studio. Send mood board.",
    total_value: 675000,
  },
  {
    id: "bk-009",
    name: "David Okonkwo",
    email: "david@okonkwodesigns.com",
    phone: "+234 803 999 8888",
    service: "Commercial Shoot",
    package: "Half Day Shoot",
    preferred_date: "2026-06-25",
    preferred_time: "10:00",
    message:
      "Interior design portfolio shoot. 3 completed residential projects across Ikoyi. Need architectural + detail shots.",
    status: "confirmed",
    submitted_at: "2026-05-25T10:45:00Z",
    admin_notes: "Deposit paid ₦540,000. Locations confirmed. Transport arranged for 3-site shoot.",
    total_value: 1350000,
  },
  {
    id: "bk-010",
    name: "Amara Eze",
    email: "amara.eze@yahoo.com",
    phone: "+234 811 222 3333",
    service: "Wedding Photography",
    package: "Full Day Coverage",
    preferred_date: "2026-11-14",
    preferred_time: "08:00",
    message:
      "Traditional Igbo wedding (morning) + white wedding (afternoon). Two venues — family compound in Enugu, then church reception.",
    status: "new",
    submitted_at: "2026-06-01T16:30:00Z",
    total_value: 3600000,
  },
  {
    id: "bk-011",
    name: "Bola Shittu",
    email: "bola@firstbank.ng",
    phone: "+234 805 444 5555",
    service: "Corporate Event",
    package: "Half Day Coverage",
    preferred_date: "2026-05-05",
    preferred_time: "09:00",
    message:
      "Branch managers' quarterly meeting. 45 attendees. Formal headshots + candid meeting coverage.",
    status: "completed",
    submitted_at: "2026-04-20T09:00:00Z",
    admin_notes:
      "Delivered May 12th. 340 edited images. Client requested 10 additional retouched headshots — completed May 15th.",
    total_value: 1800000,
  },
  {
    id: "bk-012",
    name: "Ifeanyi Maduka",
    email: "ifeanyi.maduka@gmail.com",
    phone: "+234 813 666 7777",
    service: "Portrait Session",
    package: "90-Minute Session",
    preferred_date: "2026-06-01",
    preferred_time: "14:00",
    message: "Personal branding photos for my new consulting website.",
    status: "cancelled",
    submitted_at: "2026-05-28T11:00:00Z",
    admin_notes:
      "Client cancelled — scheduling conflict. Offered to reschedule, awaiting response.",
    total_value: 675000,
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
  // ── Past Events ──────────────────────────────────────────────────────────
  {
    id: "evt-004",
    slug: "the-art-of-photography-exhibition-2025",
    title: "The Art of Photography — Annual Exhibition 2025",
    summary:
      "Our flagship annual exhibition showcasing the best work from Gaspo Studios' 2025 portfolio — weddings, portraits, and commercial campaigns under one roof.",
    description:
      "In December 2025, we transformed the Terra Kulture gallery into a visual journey through a year of storytelling. Over 300 guests walked through six curated rooms, each dedicated to a different photography genre. The evening featured a fireside chat with Marco Gaspo, live portfolio reviews, and the announcement of our 2026 mentorship programme winners.",
    objectives: [
      "Showcase the year's best photography work",
      "Connect with the Lagos creative community",
      "Announce the 2026 mentorship programme",
      "Inspire the next generation of photographers",
    ],
    outcomes: [
      "300+ attendees",
      "15 mentorship applications received",
      "Featured in 3 Lagos lifestyle magazines",
      "Secured 2 corporate exhibition sponsors for 2026",
    ],
    topics: [
      "Wedding photography",
      "Portrait artistry",
      "Commercial campaigns",
      "Documentary storytelling",
    ],
    target_audience:
      "Photography enthusiasts, art collectors, creative professionals, and the general public.",
    category: "Exhibition",
    type: "physical",
    status: "completed",
    date: "2025-12-08T00:00:00Z",
    time: "17:00",
    end_time: "21:00",
    venue: "Terra Kulture",
    address: "Plot 1376, Tiamiyu Savage Street",
    city: "Victoria Island, Lagos",
    country: "Nigeria",
    banner_image: "/images/events_crowd.webp",
    gallery_images: [
      "/images/events_crowd.webp",
      "/images/wedding_couple.webp",
      "/images/portrait_woman.webp",
    ],
    speakers: [
      {
        id: "spk-005",
        name: "Marco Gaspo",
        title: "Founder & Senior Photographer",
        company: "Gaspo Studios",
        bio: "Marco Gaspo is the founder of Gaspo Studios and a photographer with over 12 years of experience.",
        photo: "/images/team_founder.webp",
        linkedin: "https://linkedin.com",
      },
    ],
    agenda: [
      { time: "17:00", title: "Doors Open & Welcome Drinks" },
      { time: "17:30", title: "Gallery Tour with Marco Gaspo", speaker: "Marco Gaspo" },
      { time: "18:30", title: "Fireside Chat: 'A Year in Frames'", speaker: "Marco Gaspo" },
      { time: "19:30", title: "Mentorship Programme Announcement" },
      { time: "20:00", title: "Networking & Closing" },
    ],
    sponsor_packages: [],
    sponsorship_enabled: false,
    registration_open: false,
    capacity: 300,
    registration_count: 287,
    featured: true,
    seo: {
      title: "The Art of Photography Exhibition 2025 — Gaspo Studios",
      description:
        "Relive our 2025 annual photography exhibition at Terra Kulture, Lagos. 300+ guests, six curated rooms, and an unforgettable evening of visual storytelling.",
    },
    created_at: "2025-11-01T09:00:00Z",
    updated_at: "2025-12-09T08:00:00Z",
  },
  {
    id: "evt-005",
    slug: "corporate-photography-summit-q4-2025",
    title: "Corporate Photography Summit — Q4 2025",
    summary:
      "A half-day summit for corporate communications professionals, HR leaders, and brand managers on leveraging professional photography for employer branding and corporate storytelling.",
    description:
      "In partnership with the Lagos Chamber of Commerce, we hosted 120 corporate leaders for an intensive afternoon on the power of visual storytelling in business. Sessions covered executive portraiture best practices, event coverage strategy, and the ROI of professional brand imagery. Each attendee received a complimentary headshot session voucher.",
    objectives: [
      "Educate corporate leaders on the ROI of professional photography",
      "Demonstrate best practices for executive portraiture",
      "Build relationships with Lagos' business community",
    ],
    outcomes: [
      "118 corporate leaders attended",
      "12 follow-up corporate bookings generated",
      "Partnership established with Lagos Chamber of Commerce",
    ],
    topics: [
      "Executive portraiture",
      "Event coverage strategy",
      "Brand imagery ROI",
      "Corporate visual identity",
    ],
    target_audience:
      "Corporate communications professionals, HR directors, brand managers, and business owners.",
    category: "Corporate",
    type: "physical",
    status: "completed",
    date: "2025-11-15T00:00:00Z",
    time: "12:00",
    end_time: "17:00",
    venue: "Lagos Chamber of Commerce",
    address: "1, Idowu Taylor Street",
    city: "Victoria Island, Lagos",
    country: "Nigeria",
    banner_image: "/images/corporate_team.webp",
    gallery_images: ["/images/corporate_team.webp", "/images/team_founder.webp"],
    speakers: [
      {
        id: "spk-006",
        name: "Marco Gaspo",
        title: "Founder & Senior Photographer",
        company: "Gaspo Studios",
        bio: "Founder of Gaspo Studios with 12+ years of commercial photography experience.",
        photo: "/images/team_founder.webp",
        linkedin: "https://linkedin.com",
      },
      {
        id: "spk-007",
        name: "Aisha Bello",
        title: "Lead Retoucher & Editor",
        company: "Gaspo Studios",
        bio: "Lead retoucher at Gaspo Studios, specialist in corporate image post-production.",
        photo: "/images/portrait_woman.webp",
        linkedin: "https://linkedin.com",
      },
    ],
    agenda: [
      { time: "12:00", title: "Registration & Lunch" },
      {
        time: "13:00",
        title: "Keynote: 'Visual Branding in the Digital Age'",
        speaker: "Marco Gaspo",
      },
      {
        time: "14:00",
        title: "Workshop: 'Planning Your Corporate Photoshoot'",
        speaker: "Aisha Bello",
      },
      { time: "15:30", title: "Live Demo: Executive Portraiture" },
      { time: "16:30", title: "Networking Reception" },
    ],
    sponsor_packages: [],
    sponsorship_enabled: false,
    registration_open: false,
    capacity: 120,
    registration_count: 118,
    featured: false,
    seo: {
      title: "Corporate Photography Summit Q4 2025 — Gaspo Studios",
      description:
        "120 corporate leaders gathered for a half-day summit on professional photography for employer branding. Hosted at Lagos Chamber of Commerce.",
    },
    created_at: "2025-10-01T09:00:00Z",
    updated_at: "2025-11-16T10:00:00Z",
  },
  {
    id: "evt-006",
    slug: "lagos-creatives-mixer-september-2025",
    title: "Lagos Creatives Mixer — September 2025",
    summary:
      "An informal evening bringing together photographers, designers, stylists, and content creators for drinks, conversation, and collaboration.",
    description:
      "Our quarterly creative mixer returned with its biggest turnout yet — 65 creatives from across Lagos gathered at our Ikoyi studio for an evening of genuine connection. No panels, no keynotes — just good people, great music, and the kind of conversations that spark collaborations. Special thanks to our drinks sponsor, Jameson.",
    objectives: [
      "Bring together Lagos' creative community",
      "Foster collaboration between photographers, designers, and stylists",
      "Create an informal space for organic networking",
    ],
    outcomes: [
      "65 creatives attended (sold out)",
      "3 collaborative projects initiated",
      "Strong repeat attendance — 40% were returning guests",
    ],
    topics: ["Creative networking", "Cross-industry collaboration", "Lagos creative scene"],
    target_audience:
      "Photographers, designers, stylists, content creators, and creative entrepreneurs in Lagos.",
    category: "Networking",
    type: "physical",
    status: "completed",
    date: "2025-09-20T00:00:00Z",
    time: "19:00",
    end_time: "22:00",
    venue: "Gaspo Studios",
    address: "14 Bayo Kuku Road, Ikoyi",
    city: "Lagos",
    country: "Nigeria",
    banner_image: "/images/events_crowd.webp",
    gallery_images: [],
    speakers: [],
    agenda: [
      { time: "19:00", title: "Arrivals & Welcome Drinks" },
      { time: "19:30", title: "Icebreaker & Introductions" },
      { time: "20:00", title: "Open Networking" },
    ],
    sponsor_packages: [],
    sponsorship_enabled: false,
    registration_open: false,
    capacity: 65,
    registration_count: 65,
    featured: false,
    seo: {
      title: "Lagos Creatives Mixer September 2025 — Gaspo Studios",
      description:
        "65 Lagos creatives gathered at Gaspo Studios for an evening of networking, collaboration, and genuine connection. Sold out.",
    },
    created_at: "2025-08-15T09:00:00Z",
    updated_at: "2025-09-21T08:00:00Z",
  },
  {
    id: "evt-007",
    slug: "mobile-photography-workshop-august-2025",
    title: "Mobile Photography Workshop — August 2025",
    summary:
      "A practical workshop teaching content creators and small business owners how to capture professional-quality images using only their smartphones.",
    description:
      "Not everyone has a DSLR — but everyone has a phone. This sold-out workshop taught 40 participants the fundamentals of composition, lighting, and editing using nothing but their smartphone cameras. Attendees left with a 30-page mobile photography guide, hands-on practice with product flat-lays, and edited images ready for social media.",
    objectives: [
      "Teach mobile photography fundamentals",
      "Demonstrate composition and lighting techniques",
      "Equip small business owners with practical photography skills",
    ],
    outcomes: [
      "40 participants trained (sold out)",
      "30-page mobile photography guide distributed",
      "95% satisfaction rating in post-event survey",
    ],
    topics: [
      "Smartphone camera basics",
      "Composition rules",
      "Natural lighting techniques",
      "Mobile editing apps",
      "Product flat-lay photography",
    ],
    target_audience:
      "Content creators, small business owners, social media managers, and anyone wanting to improve their mobile photography.",
    category: "Workshop",
    type: "physical",
    status: "completed",
    date: "2025-08-10T00:00:00Z",
    time: "10:00",
    end_time: "15:00",
    venue: "Gaspo Studios",
    address: "14 Bayo Kuku Road, Ikoyi",
    city: "Lagos",
    country: "Nigeria",
    banner_image: "/images/photographer_hero.webp",
    gallery_images: [],
    speakers: [
      {
        id: "spk-008",
        name: "Aisha Bello",
        title: "Lead Retoucher & Editor",
        company: "Gaspo Studios",
        bio: "Lead retoucher at Gaspo Studios, expert in mobile and desktop editing workflows.",
        photo: "/images/portrait_woman.webp",
        linkedin: "https://linkedin.com",
      },
    ],
    agenda: [
      { time: "10:00", title: "Welcome & Phone Camera Basics", speaker: "Aisha Bello" },
      { time: "10:45", title: "Composition & Lighting Fundamentals" },
      { time: "12:00", title: "Break" },
      { time: "12:30", title: "Hands-On: Product Photography with Phones" },
      { time: "14:00", title: "Editing Session & Q&A", speaker: "Aisha Bello" },
    ],
    sponsor_packages: [],
    sponsorship_enabled: false,
    registration_open: false,
    capacity: 40,
    registration_count: 40,
    featured: false,
    seo: {
      title: "Mobile Photography Workshop August 2025 — Gaspo Studios",
      description:
        "Sold-out workshop teaching 40 participants professional-quality mobile photography. Smartphone composition, lighting, and editing.",
    },
    created_at: "2025-07-01T09:00:00Z",
    updated_at: "2025-08-11T10:00:00Z",
  },
  // ── Additional Upcoming Events ────────────────────────────────────────────
  {
    id: "evt-008",
    slug: "creative-business-bootcamp-october-2026",
    title: "Creative Business Bootcamp — October 2026",
    summary:
      "A two-day intensive bootcamp for photographers and creatives ready to turn their craft into a sustainable, profitable business.",
    description:
      "Over two packed days, Marco Gaspo and guest speakers from finance, legal, and marketing will walk you through the business side of creativity — pricing strategies, client contracts, tax planning, social media marketing, and scaling your studio without burning out. Includes one-on-one portfolio and business plan reviews.",
    objectives: [
      "Teach profitable pricing strategies",
      "Cover client contracts and IP protection",
      "Provide tax and finance basics for creatives",
      "Develop marketing and scaling strategies",
    ],
    outcomes: [
      "Comprehensive business plan template",
      "Client contract template",
      "Pricing calculator tool",
      "Certificate of completion",
    ],
    topics: [
      "Pricing your work profitably",
      "Client contracts and IP rights",
      "Marketing on a budget",
      "Tax basics for freelancers",
      "Scaling from solo to studio",
      "Avoiding creative burnout",
    ],
    target_audience:
      "Photographers, designers, and creative professionals ready to build sustainable businesses.",
    category: "Workshop",
    type: "physical",
    status: "upcoming",
    date: "2026-10-17T00:00:00Z",
    time: "09:00",
    end_time: "17:00",
    venue: "Gaspo Studios",
    address: "14 Bayo Kuku Road, Ikoyi",
    city: "Lagos",
    country: "Nigeria",
    banner_image: "/images/photographer_hero.webp",
    gallery_images: [],
    speakers: [
      {
        id: "spk-009",
        name: "Marco Gaspo",
        title: "Founder & Senior Photographer",
        company: "Gaspo Studios",
        bio: "Founder of Gaspo Studios. Built a photography business from a borrowed camera to one of Lagos' most respected studios.",
        photo: "/images/team_founder.webp",
        linkedin: "https://linkedin.com",
      },
    ],
    agenda: [
      { time: "09:00", title: "Day 1: Registration & Welcome" },
      { time: "09:30", title: "Pricing Your Work Profitably", speaker: "Marco Gaspo" },
      { time: "11:00", title: "Client Contracts & IP Rights" },
      { time: "12:30", title: "Lunch Break" },
      { time: "13:30", title: "Marketing on a Budget" },
      { time: "15:00", title: "Portfolio Reviews (One-on-One)" },
      { time: "09:00", title: "Day 2: Tax Basics for Freelancers" },
      { time: "10:30", title: "Scaling from Solo to Studio", speaker: "Marco Gaspo" },
      { time: "12:00", title: "Avoiding Creative Burnout" },
      { time: "13:00", title: "Business Plan Presentations & Close" },
    ],
    sponsor_packages: [],
    sponsorship_enabled: false,
    registration_open: true,
    registration_deadline: "2026-10-10T00:00:00Z",
    capacity: 20,
    registration_count: 6,
    featured: false,
    seo: {
      title: "Creative Business Bootcamp October 2026 — Gaspo Studios Workshop",
      description:
        "Two-day intensive bootcamp for photographers. Pricing, contracts, tax, marketing, and scaling. Limited to 20 participants.",
    },
    created_at: "2026-05-15T09:00:00Z",
    updated_at: "2026-05-20T10:00:00Z",
  },
  {
    id: "evt-009",
    slug: "end-of-year-portfolio-review-gala-2026",
    title: "End-of-Year Portfolio Review & Gala 2026",
    summary:
      "Close the year with Gaspo Studios at our annual portfolio review night — featuring expert critique, champagne, and the announcement of our 2027 exhibition theme.",
    description:
      "Our most anticipated event of the year returns. Submit up to 10 of your best 2026 images for live critique from the Gaspo Studios team and guest judges. The evening culminates in awards for Best Wedding Image, Best Portrait, Best Commercial Work, and the People's Choice award. Black tie optional — champagne mandatory.",
    objectives: [
      "Celebrate the year's best photography",
      "Provide expert portfolio critique",
      "Announce the 2027 exhibition theme",
      "Award outstanding work across categories",
    ],
    outcomes: [
      "4 category awards presented",
      "2027 exhibition theme revealed",
      "Networking with Lagos' photography elite",
    ],
    topics: [
      "Portfolio critique",
      "Photography awards",
      "Year-in-review",
      "2027 creative direction",
    ],
    target_audience:
      "Professional and aspiring photographers, creative directors, and photography enthusiasts.",
    category: "Networking",
    type: "physical",
    status: "upcoming",
    date: "2026-12-05T00:00:00Z",
    time: "18:00",
    end_time: "22:00",
    venue: "The Wheatbaker Hotel",
    address: "4 Lawrence Road, Ikoyi",
    city: "Lagos",
    country: "Nigeria",
    banner_image: "/images/events_crowd.webp",
    gallery_images: [],
    speakers: [
      {
        id: "spk-010",
        name: "Marco Gaspo",
        title: "Founder & Senior Photographer",
        company: "Gaspo Studios",
        bio: "Founder of Gaspo Studios and lead judge for the annual portfolio review.",
        photo: "/images/team_founder.webp",
        linkedin: "https://linkedin.com",
      },
      {
        id: "spk-011",
        name: "Aisha Bello",
        title: "Lead Retoucher & Editor",
        company: "Gaspo Studios",
        bio: "Lead retoucher at Gaspo Studios and guest judge for the editorial category.",
        photo: "/images/portrait_woman.webp",
        linkedin: "https://linkedin.com",
      },
    ],
    agenda: [
      { time: "18:00", title: "Champagne Reception" },
      { time: "18:30", title: "Portfolio Review — Category 1: Weddings" },
      { time: "19:15", title: "Portfolio Review — Category 2: Portraits & Commercial" },
      { time: "20:00", title: "2027 Exhibition Theme Announcement", speaker: "Marco Gaspo" },
      { time: "20:30", title: "Awards Ceremony" },
      { time: "21:00", title: "Networking & Close" },
    ],
    sponsor_packages: defaultSponsorPackages,
    sponsorship_enabled: true,
    registration_open: true,
    registration_deadline: "2026-11-28T00:00:00Z",
    capacity: 150,
    registration_count: 42,
    featured: true,
    seo: {
      title: "End-of-Year Portfolio Review & Gala 2026 — Gaspo Studios",
      description:
        "Annual portfolio review night with expert critique, champagne, and photography awards. Limited tickets. Black tie optional.",
    },
    created_at: "2026-05-20T09:00:00Z",
    updated_at: "2026-05-25T14:00:00Z",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱  Gaspo Studios — Supabase Seed Script");
  console.log("   URL:", SUPABASE_URL);
  console.log("─".repeat(50));

  const results = await Promise.allSettled([
    upsertTable("blog_posts", blogPosts, "slug"),
    upsertTable("gallery_images", galleryImages, "id"),
    upsertTable("bookings", bookings, "id"),
    upsertTable("events", events, "slug"),
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
