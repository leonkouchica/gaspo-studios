// src/data/homepage.ts
// Static seed data for the Homepage CMS module.
// Each section maps to an editable block in the admin Homepage editor.

export interface HeroSlide {
  id: string;
  img: string;
  label: string;
  headline: string;
  sub: string;
  body: string;
  cta1: { label: string; to: string };
  cta2: { label: string; to: string };
}

export interface ServiceCard {
  id: string;
  icon: string; // lucide icon name
  title: string;
  desc: string;
  img: string;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface BrandItem {
  id: string;
  name: string;
  icon: string; // lucide icon name
}

export interface HomepageContent {
  heroSlides: HeroSlide[];
  about: {
    eyebrow: string;
    headline: string;
    body: string;
    stats: StatItem[];
    image: string;
    experienceBadge: string;
    featureCards: { id: string; icon: string; title: string; desc: string }[];
  };
  services: {
    eyebrow: string;
    headline: string;
    subtext: string;
    cards: ServiceCard[];
  };
  gallery: {
    eyebrow: string;
    headline: string;
    body: string;
    mainImage: string;
    thumbnails: string[];
  };
  bookingCta: {
    headline: string;
    body: string;
    buttonLabel: string;
    buttonTo: string;
    backgroundImage: string;
  };
  faq: FAQItem[];
  brands: BrandItem[];
}

export const homepageContent: HomepageContent = {
  heroSlides: [
    {
      id: "slide-1",
      img: "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=1920&q=80",
      label: "Professional Photography Studio",
      headline: "Capture Your Moments with Gaspo Studios",
      sub: "Where Art Meets Precision in Photography",
      body: "Your ultimate destination for professional photography services. Whether it's a wedding, portrait session or a bold commercial campaign — we're here for every story.",
      cta1: { label: "Book a Shoot", to: "/book" },
      cta2: { label: "View Gallery", to: "/gallery" },
    },
    {
      id: "slide-2",
      img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80",
      label: "Wedding & Portrait Specialists",
      headline: "Every Love Story Deserves a Masterpiece",
      sub: "Cinematic wedding coverage you'll treasure forever",
      body: "From intimate ceremonies to grand receptions, our award-winning photographers bring your wedding day to life with breathtaking, timeless imagery.",
      cta1: { label: "Book Your Wedding", to: "/book" },
      cta2: { label: "See Weddings", to: "/gallery" },
    },
    {
      id: "slide-3",
      img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=80",
      label: "Corporate & Commercial",
      headline: "Elevate Your Brand Through the Lens",
      sub: "Studio-quality commercial photography that converts",
      body: "From corporate headshots to full product campaigns, we craft visuals that align with your brand identity and speak directly to your audience.",
      cta1: { label: "Get a Quote", to: "/contact" },
      cta2: { label: "Our Services", to: "/about" },
    },
  ],
  about: {
    eyebrow: "About Us",
    headline: "Building Visual Stories That Last Forever",
    body: "At Gaspo Studios, we believe in creating memorable images that last a lifetime. Founded over a decade ago, our studio has been at the forefront of capturing stunning visual stories — blending creativity, reliability, and uncompromising craft.",
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=900&q=80",
    experienceBadge: "10+ Years Experience",
    stats: [
      { id: "stat-1", value: "200+", label: "Weddings" },
      { id: "stat-2", value: "50+", label: "Brands" },
      { id: "stat-3", value: "15", label: "Awards" },
    ],
    featureCards: [
      {
        id: "feat-1",
        icon: "Sparkles",
        title: "Creative Direction",
        desc: "Tailored concepts crafted from the first sketch all the way to the final frame.",
      },
      {
        id: "feat-2",
        icon: "Award",
        title: "Professional Editing",
        desc: "Color-graded and retouched by award-winning artists with a decade of precision.",
      },
    ],
  },
  services: {
    eyebrow: "Our Services",
    headline: "Integrated Photography Solutions",
    subtext:
      "From intimate portraits to large-scale commercial campaigns — one studio, every story told perfectly.",
    cards: [
      {
        id: "svc-1",
        icon: "Camera",
        title: "Wedding Photography",
        desc: "Let us capture the romance and joy of your special day with cinematic detail.",
        img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      },
      {
        id: "svc-2",
        icon: "Building2",
        title: "Corporate Photography",
        desc: "Elevate your brand with professional photographs that make a lasting statement.",
        img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
      },
      {
        id: "svc-3",
        icon: "Users",
        title: "Special Events",
        desc: "From birthdays to graduations, treasure every moment with stunning photographs.",
        img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
      },
    ],
  },
  gallery: {
    eyebrow: "Portfolio",
    headline: "Stunning Visuals for Every Occasion",
    body: "Explore a curated selection of weddings, portraits, and brand work spanning more than a decade. Every project is a collaboration — and the proof is in the gallery.",
    mainImage:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80",
    ],
  },
  bookingCta: {
    headline: "Ready to Capture Your Next Moment?",
    body: "Booking your photo shoot with Gaspo Studios is simple and convenient. Choose from our wide range of photography services tailored to meet your needs.",
    buttonLabel: "Book Your Session Today",
    buttonTo: "/book",
    backgroundImage:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1920&q=80",
  },
  faq: [
    {
      id: "faq-1",
      question: "What types of photography do you offer?",
      answer:
        "We specialize in weddings, portraits, corporate headshots, commercial work, and special events. Every shoot is tailored to your vision.",
      order: 1,
    },
    {
      id: "faq-2",
      question: "How far in advance should I book?",
      answer:
        "We recommend booking 2–6 months ahead for weddings and 2–4 weeks for portrait and corporate sessions.",
      order: 2,
    },
    {
      id: "faq-3",
      question: "Do you offer photo editing services?",
      answer:
        "Yes — every gallery is professionally color-graded and retouched. Advanced retouching is available as an add-on.",
      order: 3,
    },
    {
      id: "faq-4",
      question: "Can I purchase prints or digital copies?",
      answer:
        "Absolutely. High-resolution digital files are included with every package, and museum-grade prints are available through our shop.",
      order: 4,
    },
  ],
  brands: [
    { id: "brand-1", name: "AURELIA", icon: "Aperture" },
    { id: "brand-2", name: "NORTHWIND", icon: "ImageIcon" },
    { id: "brand-3", name: "BELLEVUE", icon: "Zap" },
    { id: "brand-4", name: "MAISON & CO", icon: "Star" },
    { id: "brand-5", name: "VERVE", icon: "Camera" },
  ],
};
