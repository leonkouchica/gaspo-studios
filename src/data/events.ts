// src/data/events.ts
// Static data for the frontend preview phase.
// Types are pre-aligned with the planned Supabase schema — swap the data
// source without touching the UI when the backend is ready.

export interface SEOMeta {
  title: string;
  description: string;
  ogImage?: string;
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  photo: string;
  linkedin?: string;
  twitter?: string;
}

export interface AgendaItem {
  time: string;
  title: string;
  speaker?: string;
  description?: string;
}

export interface SponsorPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  benefits: string[];
  highlighted?: boolean;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  country: string;
  city: string;
  linkedin?: string;
  howHeard: string;
  interests: string[];
  questions?: string;
  consent: boolean;
  status: "pending" | "confirmed" | "cancelled";
  registeredAt: string;
}

export interface EventSponsor {
  id: string;
  eventId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  industry: string;
  description?: string;
  package: string;
  additionalRequests?: string;
  logoUrl?: string;
  status: "pending" | "confirmed" | "paid" | "rejected";
  submittedAt: string;
}

export type EventStatus =
  | "draft"
  | "published"
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "archived";

export type EventType = "physical" | "virtual" | "hybrid";

export interface Event {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  objectives: string[];
  outcomes: string[];
  topics: string[];
  targetAudience: string;
  category: string;
  type: EventType;
  status: EventStatus;
  date: string; // ISO date string
  time: string;
  endTime?: string;
  venue: string;
  address: string;
  city: string;
  country: string;
  mapEmbedUrl?: string;
  bannerImage: string;
  galleryImages?: string[];
  speakers: Speaker[];
  agenda: AgendaItem[];
  sponsorPackages: SponsorPackage[];
  sponsorshipEnabled: boolean;
  registrationOpen: boolean;
  registrationDeadline?: string;
  capacity?: number;
  registrationCount: number;
  featured: boolean;
  seo: SEOMeta;
  createdAt: string;
  updatedAt: string;
}

// ─── STATIC SEED DATA ────────────────────────────────────────────────────────

const defaultSponsorPackages: SponsorPackage[] = [
  {
    id: "gold",
    name: "Gold Sponsor",
    price: 6_000_000,
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
    price: 4_000_000,
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
    price: 3_000_000,
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
    price: 2_500_000,
    currency: "NGN",
    benefits: [
      "Partner recognition across channels",
      "Certificate award",
      "Media mentions",
    ],
  },
  {
    id: "general-partner",
    name: "General Partner",
    price: 1_500_000,
    currency: "NGN",
    benefits: ["Vendor booth access"],
  },
];

export const events: Event[] = [
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
    targetAudience:
      "Tech professionals, entrepreneurs, business leaders, investors, researchers, and anyone passionate about the intersection of AI and business innovation.",
    category: "Technology",
    type: "hybrid",
    status: "upcoming",
    date: "2026-09-12",
    time: "09:30",
    endTime: "17:00",
    venue: "Eko Hotel & Suites, Victoria Island",
    address: "Plot 1415, Adetokunbo Ademola Street",
    city: "Lagos",
    country: "Nigeria",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7!2d3.4282!3d6.4281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjUnNDEuMiJOIDPCsDI1JzQxLjUiRQ!5e0!3m2!1sen!2sng!4v1234567890",
    bannerImage:
      "/images/events_crowd.webp",
    galleryImages: [
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
        photo:
          "/images/portrait_woman.webp",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
      },
      {
        id: "spk-002",
        name: "Elon Park",
        title: "CEO & Co-Founder",
        company: "FutureStack",
        bio: "Elon Park is the co-founder of FutureStack, a Silicon Valley-backed startup redefining enterprise automation. A serial entrepreneur and angel investor, Elon has built and sold three companies across fintech and AI verticals.",
        photo:
          "/images/team_founder.webp",
        linkedin: "https://linkedin.com",
      },
      {
        id: "spk-003",
        name: "Laura Kim",
        title: "VP of Engineering",
        company: "DeepMind Lagos",
        bio: "Laura Kim leads engineering at DeepMind Lagos, overseeing a team of 120 engineers building next-generation AI infrastructure. Prior to DeepMind, she held senior roles at Google Brain and OpenAI.",
        photo:
          "/images/portrait_woman.webp",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
      },
      {
        id: "spk-004",
        name: "Dr. Alan Foster",
        title: "Professor of AI Ethics",
        company: "University of Lagos",
        bio: "Dr. Alan Foster is Nigeria's foremost authority on AI governance and ethics. His research on bias in algorithmic decision-making has influenced policy across 12 African nations. He advises the African Union on digital transformation.",
        photo:
          "/images/team_founder.webp",
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
      {
        time: "16:30",
        title: "Closing Keynote & Awards",
        speaker: "Elon Park",
      },
      { time: "17:00", title: "End of Conference" },
    ],
    sponsorPackages: defaultSponsorPackages,
    sponsorshipEnabled: true,
    registrationOpen: true,
    registrationDeadline: "2026-09-05",
    capacity: 500,
    registrationCount: 234,
    featured: true,
    seo: {
      title: "Future of AI & Networking 2026 — Gaspo Studios",
      description:
        "Join 500+ tech leaders at the Future of AI & Networking conference in Lagos. Expert keynotes, workshops, and unmatched networking. Register now.",
      ogImage:
        "/images/events_crowd.webp",
    },
    createdAt: "2026-04-01T10:00:00Z",
    updatedAt: "2026-05-20T14:30:00Z",
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
    targetAudience:
      "Intermediate photographers who want to elevate their portrait work. Bring your own camera — all lighting equipment is provided.",
    category: "Workshop",
    type: "physical",
    status: "upcoming",
    date: "2026-07-12",
    time: "10:00",
    endTime: "16:00",
    venue: "Gaspo Studios",
    address: "14 Bayo Kuku Road, Ikoyi",
    city: "Lagos",
    country: "Nigeria",
    bannerImage:
      "/images/photographer_hero.webp",
    speakers: [
      {
        id: "spk-005",
        name: "Marco Gaspo",
        title: "Founder & Senior Photographer",
        company: "Gaspo Studios",
        bio: "Marco Gaspo is the founder of Gaspo Studios and a photographer with over 12 years of experience spanning weddings, editorial, and commercial work. His images have appeared in Vogue, Forbes Africa, and TED stages globally.",
        photo:
          "/images/team_founder.webp",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
      },
    ],
    agenda: [
      { time: "10:00", title: "Welcome & Equipment Overview" },
      {
        time: "10:30",
        title: "One-Light Setups — Theory & Practice",
        speaker: "Marco Gaspo",
      },
      { time: "12:00", title: "Lunch Break" },
      {
        time: "13:00",
        title: "Two & Three-Light Rigs",
        speaker: "Marco Gaspo",
      },
      { time: "14:30", title: "Open Shooting — Model Session" },
      {
        time: "15:30",
        title: "Live Edit & Q&A",
        speaker: "Marco Gaspo",
      },
      { time: "16:00", title: "Close" },
    ],
    sponsorPackages: [],
    sponsorshipEnabled: false,
    registrationOpen: true,
    registrationDeadline: "2026-07-05",
    capacity: 12,
    registrationCount: 9,
    featured: false,
    seo: {
      title: "Portrait Lighting Masterclass — Gaspo Studios Workshop",
      description:
        "Hands-on portrait lighting workshop at Gaspo Studios Lagos. Limited to 12 photographers. Expert guidance, professional models, edited portfolio images.",
    },
    createdAt: "2026-04-15T09:00:00Z",
    updatedAt: "2026-05-10T11:00:00Z",
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
    targetAudience:
      "Wedding photographers of all experience levels based in Lagos and surroundings.",
    category: "Networking",
    type: "physical",
    status: "upcoming",
    date: "2026-08-03",
    time: "18:30",
    endTime: "21:00",
    venue: "Rooftop Venue",
    address: "27 Adeola Odeku Street",
    city: "Victoria Island, Lagos",
    country: "Nigeria",
    bannerImage:
      "/images/wedding_couple.webp",
    speakers: [],
    agenda: [
      { time: "18:30", title: "Arrivals & Drinks" },
      { time: "19:00", title: "Welcome from Gaspo Studios" },
      { time: "19:15", title: "Portfolio Review Round — Group Feedback" },
      { time: "20:00", title: "Panel Discussion: Pricing & Business Tips" },
      { time: "20:45", title: "Open Networking" },
      { time: "21:00", title: "End of Evening" },
    ],
    sponsorPackages: [],
    sponsorshipEnabled: false,
    registrationOpen: true,
    capacity: 30,
    registrationCount: 17,
    featured: false,
    seo: {
      title: "Wedding Photographer Meetup Lagos — August 2026",
      description:
        "Free networking evening for wedding photographers in Lagos. Portfolio reviews, panel talks, and great company. RSVP now — limited spots.",
    },
    createdAt: "2026-05-01T08:00:00Z",
    updatedAt: "2026-05-25T09:00:00Z",
  },
];

export const pastEvents = [
  {
    id: "past-001",
    title: "Spring Portrait Marathon",
    date: "March 2026",
    img: "/images/portrait_woman.webp",
    attendees: 45,
    recap: "An incredible two-day sprint with 45 participants across 6 shooting stations.",
  },
  {
    id: "past-002",
    title: "Brand Photography Masterclass",
    date: "February 2026",
    img: "/images/corporate_team.webp",
    attendees: 28,
    recap: "Full-day commercial photography workshop covering product, lifestyle, and editorial techniques.",
  },
  {
    id: "past-003",
    title: "New Year Studio Open House",
    date: "January 2026",
    img: "/images/events_crowd.webp",
    attendees: 120,
    recap: "Our biggest open house yet — tours, live shoots, and a panel on the year ahead in photography.",
  },
];

// Helpers
export function getEventBySlug(slug: string): Event | undefined {
  return events.find((e) => e.slug === slug);
}

export function getFeaturedEvent(): Event | undefined {
  return events.find((e) => e.featured && e.status !== "completed");
}

export function getUpcomingEvents(): Event[] {
  return events.filter((e) =>
    ["upcoming", "published"].includes(e.status)
  );
}
