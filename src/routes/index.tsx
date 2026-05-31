import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Users,
  Building2,
  Sparkles,
  Award,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Star,
  Aperture,
  ImageIcon,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ScrollReveal } from "../components/ScrollReveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gaspo Studios — Capture Your Moments" },
      { name: "description", content: "Where art meets precision in photography. Weddings, portraits, corporate and commercial photography by Gaspo Studios." },
      { property: "og:title", content: "Gaspo Studios — Capture Your Moments" },
      { property: "og:description", content: "Where art meets precision in photography." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const services = [
  { icon: Camera, title: "Wedding Photography", desc: "Let us capture the romance and joy of your special day with cinematic detail.", img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80" },
  { icon: Building2, title: "Corporate Photography", desc: "Elevate your brand with professional photographs that make a lasting statement.", img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80" },
  { icon: Users, title: "Special Events", desc: "From birthdays to graduations, treasure every moment with stunning photographs.", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80" },
];

const brands = [
  { icon: Aperture, name: "AURELIA" },
  { icon: ImageIcon, name: "NORTHWIND" },
  { icon: Zap, name: "BELLEVUE" },
  { icon: Star, name: "MAISON & CO" },
  { icon: Camera, name: "VERVE" },
];

const steps = [
  { num: 1, title: "Select Service", desc: "Choose from weddings, portraits, events or commercial.", img: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80" },
  { num: 2, title: "Choose Your Date", desc: "Pick an available slot that fits your schedule.", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80" },
  { num: 3, title: "Confirm Booking", desc: "Secure your session with a simple deposit.", img: "https://images.unsplash.com/photo-1560472355-536de3962603?w=600&q=80" },
];



const heroSlides = [
  {
    img: "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=1920&q=80",
    label: "Professional Photography Studio",
    headline: "Capture Your Moments with Gaspo Studios",
    sub: "Where Art Meets Precision in Photography",
    body: "Your ultimate destination for professional photography services. Whether it's a wedding, portrait session or a bold commercial campaign — we're here for every story.",
    cta1: { label: "Book a Shoot", to: "/book" },
    cta2: { label: "View Gallery", to: "/gallery" },
  },
  {
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80",
    label: "Wedding & Portrait Specialists",
    headline: "Every Love Story Deserves a Masterpiece",
    sub: "Cinematic wedding coverage you'll treasure forever",
    body: "From intimate ceremonies to grand receptions, our award-winning photographers bring your wedding day to life with breathtaking, timeless imagery.",
    cta1: { label: "Book Your Wedding", to: "/book" },
    cta2: { label: "See Weddings", to: "/gallery" },
  },
  {
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=80",
    label: "Corporate & Commercial",
    headline: "Elevate Your Brand Through the Lens",
    sub: "Studio-quality commercial photography that converts",
    body: "From corporate headshots to full product campaigns, we craft visuals that align with your brand identity and speak directly to your audience.",
    cta1: { label: "Get a Quote", to: "/contact" },
    cta2: { label: "Our Services", to: "/about" },
  },
];

function Index() {
  const [open, setOpen] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* ─── HERO SLIDER ─── */}
      <section className="relative h-[calc(85vh+87px)] flex items-center justify-center overflow-hidden bg-[#F5F5F5]">
        {/* Slides */}
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={`absolute top-2 bottom-4 left-4 right-4 md:top-2 md:bottom-6 md:left-6 md:right-6 transition-opacity duration-1000 overflow-hidden rounded-3xl md:rounded-[3rem] ${i === heroIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <img
              src={slide.img}
              alt={slide.headline}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-dark/60" />
          </div>
        ))}

        {/* Content */}
        <div className="container-x relative z-20 w-full text-center flex flex-col items-center mt-10 md:mt-16">
          <div key={heroIndex} className="max-w-4xl text-white animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col items-center">
            <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">
              {heroSlides[heroIndex].label}
            </p>
            <h1 className="text-5xl md:text-7xl font-bold mt-4 leading-tight transition-all duration-500">
              {heroSlides[heroIndex].headline}
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mt-4 font-light">
              {heroSlides[heroIndex].sub}
            </p>
            <p className="text-base text-white/70 mt-6 leading-relaxed max-w-2xl">
              {heroSlides[heroIndex].body}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <Link
                to={heroSlides[heroIndex].cta1.to}
                className="group inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-8 py-3.5 font-medium transition-all hover:scale-105"
              >
                {heroSlides[heroIndex].cta1.label}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to={heroSlides[heroIndex].cta2.to}
                className="inline-flex items-center justify-center gap-2 text-white border border-white/30 rounded-full px-8 py-3.5 font-medium hover:bg-white/10 transition-all"
              >
                {heroSlides[heroIndex].cta2.label}
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={() => setHeroIndex((i) => (i === 0 ? heroSlides.length - 1 : i - 1))}
          className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-primary border border-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={() => setHeroIndex((i) => (i + 1) % heroSlides.length)}
          className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-primary border border-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
        
        {/* Indicators */}
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`transition-all duration-300 rounded-full ${
                i === heroIndex ? "w-8 h-2 bg-primary" : "w-2 h-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>


      </section>

      {/* ─── TRUST / LOGO BAR ─── */}
      <section className="bg-white py-8 border-b border-border">
        <div className="container-x">
          <ScrollReveal direction="none" delay={100}>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-50">
              {brands.map(({ icon: Icon, name }) => (
                <div key={name} className="flex items-center gap-2">
                  <Icon size={18} className="text-dark" />
                  <span className="text-dark font-semibold tracking-[0.18em] text-sm">{name}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── ABOUT PREVIEW ─── */}
      <section className="pt-20 pb-12 md:pt-28 md:pb-16 bg-background overflow-hidden">
        <div className="container-x">
          {/* Header row: headline left, body right */}
          <ScrollReveal>
            <div className="grid md:grid-cols-2 gap-8 items-start mb-12">
              <div>
                <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium flex items-center gap-3">
                  <span className="inline-block w-6 h-px bg-primary" />
                  About Us
                </p>
                <h2 className="text-4xl md:text-5xl font-bold text-dark mt-4 leading-tight">
                  Building Visual Stories That Last Forever
                </h2>
              </div>
              <div className="md:pt-10">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  At Gaspo Studios, we believe in creating memorable images that last a lifetime. Founded over a decade ago, our studio has been at the forefront of capturing stunning visual stories — blending creativity, reliability, and uncompromising craft.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Image + dark feature cards */}
          <div className="grid md:grid-cols-5 gap-5 items-stretch">
            {/* Large image — left 3 cols */}
            <ScrollReveal className="md:col-span-3 relative h-full" direction="left">
              <div className="h-full">
                <img
                  src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=900&q=80"
                  alt="Studio"
                  className="w-full h-[480px] object-cover rounded-2xl shadow-xl"
                />
                <div className="absolute bottom-5 left-5 bg-primary text-white rounded-full px-5 py-2.5 font-medium shadow-lg text-sm">
                  10+ Years Experience
                </div>
              </div>
            </ScrollReveal>

            {/* Dark feature cards — right 2 cols, stacked */}
            <div className="md:col-span-2 flex flex-col gap-5">
              {[
                { icon: Sparkles, t: "Creative Direction", d: "Tailored concepts crafted from the first sketch all the way to the final frame." },
                { icon: Award, t: "Professional Editing", d: "Color-graded and retouched by award-winning artists with a decade of precision." },
              ].map(({ icon: Icon, t, d }, idx) => (
                <ScrollReveal key={t} delay={idx * 150} direction="right" className="flex-1">
                  <div className="bg-dark rounded-2xl p-7 border border-border-dark h-full relative group hover:-translate-y-1 transition-all duration-300">
                    <button className="absolute top-5 right-5 w-9 h-9 rounded-full bg-primary hover:bg-primary-hover transition-colors text-white flex items-center justify-center">
                      <ArrowUpRight size={16} />
                    </button>
                    <div className="w-12 h-12 rounded-xl bg-white/10 text-primary flex items-center justify-center">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-xl font-bold text-white mt-5">{t}</h3>
                    <p className="text-white/60 text-sm mt-3 leading-relaxed">{d}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Carousel nav + CTA below */}
          <ScrollReveal direction="none" delay={200}>
            <div className="flex items-center gap-3 mt-10">
              <button className="w-10 h-10 rounded-full border border-border text-dark hover:bg-dark hover:text-white hover:border-dark transition-all flex items-center justify-center">
                <ChevronLeft size={18} />
              </button>
              <button className="w-10 h-10 rounded-full border border-border text-dark hover:bg-dark hover:text-white hover:border-dark transition-all flex items-center justify-center">
                <ChevronRight size={18} />
              </button>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 ml-3 border border-dark text-dark rounded-full px-7 py-3 font-medium hover:bg-dark hover:text-white transition-all group"
              >
                Meet Our Team
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="pt-12 pb-12 md:pt-16 md:pb-16 bg-muted/40">
        <div className="container-x">
          {/* Header row */}
          <ScrollReveal>
            <div className="grid md:grid-cols-2 gap-8 items-end mb-12">
              <div>
                <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">Our Services</p>
                <h2 className="text-4xl md:text-5xl font-bold text-dark mt-3">Integrated Photography Solutions</h2>
              </div>
              <div className="md:text-right md:pb-1">
                <p className="text-muted-foreground text-base leading-relaxed">
                  From intimate portraits to large-scale commercial campaigns — one studio, every story told perfectly.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* All-dark service cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, desc, img }, idx) => (
              <ScrollReveal key={title} delay={idx * 150} className="h-full">
                <div
                  className="group relative bg-dark rounded-2xl p-6 border border-border-dark text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl h-full flex flex-col justify-between"
                >
                  <div>
                    <button className="absolute top-5 right-5 w-9 h-9 rounded-full bg-primary hover:bg-primary-hover transition-colors text-white flex items-center justify-center">
                      <ArrowUpRight size={16} />
                    </button>
                    <div className="w-12 h-12 rounded-xl bg-white/10 text-primary flex items-center justify-center">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mt-5">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">{desc}</p>
                  </div>
                  <img src={img} alt={title} className="mt-6 rounded-xl h-40 w-full object-cover" />
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Carousel controls + CTA at the bottom */}
          <ScrollReveal direction="none" delay={200}>
            <div className="flex items-center gap-3 mt-10">
              <button className="w-10 h-10 rounded-full border border-border text-dark hover:bg-dark hover:text-white hover:border-dark transition-all flex items-center justify-center">
                <ChevronLeft size={18} />
              </button>
              <button className="w-10 h-10 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors flex items-center justify-center">
                <ChevronRight size={18} />
              </button>
              {/* Progress bar */}
              <div className="flex-1 mx-4 h-0.5 bg-border rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-primary rounded-full" />
              </div>
              <Link
                to="/book"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-3 font-medium transition-colors"
              >
                View Services <ArrowRight size={18} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── GALLERY PREVIEW ─── */}
      <section className="pt-12 pb-12 md:pt-16 md:pb-16 bg-background overflow-hidden">
        <div className="container-x grid md:grid-cols-2 gap-12 items-center">
          {/* Left: single main image + dark info overlay card */}
          <ScrollReveal direction="left">
            <div className="relative h-[520px]">
              <img
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=80"
                alt="Gallery"
                className="w-full h-full object-cover rounded-2xl"
              />
              {/* Dark info overlay card — bottom-left */}
              <div className="absolute bottom-6 left-6 bg-dark/90 backdrop-blur-sm rounded-2xl p-5 border border-white/10 max-w-[220px]">
                <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                  <Camera size={20} />
                </div>
                <p className="font-bold text-white mt-3 text-sm leading-snug">Award Winning<br />Portfolio</p>
                <div className="flex justify-end mt-3">
                  <button className="w-8 h-8 rounded-full bg-primary hover:bg-primary-hover transition-colors text-white flex items-center justify-center">
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right: text content */}
          <ScrollReveal direction="right" delay={150}>
            <div>
              <div className="flex items-center justify-between">
                <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">Portfolio</p>
                <button className="w-9 h-9 rounded-full border border-border text-dark hover:bg-dark hover:text-white transition-all flex items-center justify-center">
                  <ArrowUpRight size={16} />
                </button>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-dark mt-3">Stunning Visuals for Every Occasion</h2>
              <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
                Explore a curated selection of weddings, portraits, and brand work spanning more than a decade. Every project is a collaboration — and the proof is in the gallery.
              </p>
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 mt-8 bg-primary hover:bg-primary-hover text-white rounded-full px-7 py-3.5 font-medium transition-colors"
              >
                Explore Our Portfolio <ArrowRight size={18} />
              </Link>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-border">
                {[
                  { n: "200+", l: "Weddings" },
                  { n: "50+", l: "Brands" },
                  { n: "15", l: "Awards" },
                ].map(({ n, l }) => (
                  <div key={l}>
                    <p className="text-3xl font-bold text-primary">{n}</p>
                    <p className="text-sm text-muted-foreground mt-1">{l}</p>
                  </div>
                ))}
              </div>

              {/* Two small thumbnails stacked */}
              <div className="grid grid-cols-2 gap-3 mt-8">
                <img
                  src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80"
                  alt=""
                  className="rounded-xl h-28 w-full object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80"
                  alt=""
                  className="rounded-xl h-28 w-full object-cover"
                />
              </div>

              {/* Prev/next nav below thumbnails */}
              <div className="flex items-center gap-3 mt-5">
                <button className="w-10 h-10 rounded-full border border-border text-dark hover:bg-dark hover:text-white transition-all flex items-center justify-center">
                  <ChevronLeft size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors flex items-center justify-center">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── BOOKING CTA — rounded dark container on light background ─── */}
      <section className="pt-12 pb-20 md:pt-16 md:pb-28 bg-muted/40">
        <div className="container-x">
          <ScrollReveal>
            <div className="bg-dark rounded-3xl p-10 md:p-16 relative overflow-hidden animate-gradient-slow">
              {/* Background Image */}
              <img 
                src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1920&q=80" 
                alt="Studio Background" 
                className="absolute inset-0 w-full h-full object-cover opacity-[0.29] mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(225,45,45,0.4),transparent_60%)]" />
              <div className="relative text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white">Ready to Capture Your Next Moment?</h2>
                <p className="text-white/70 max-w-2xl mx-auto mt-5 text-lg">
                  Booking your photo shoot with Gaspo Studios is simple and convenient. Choose from our wide range of photography services tailored to meet your needs.
                </p>
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 mt-8 bg-primary hover:bg-primary-hover text-white rounded-full px-8 py-4 font-semibold transition-all hover:scale-105"
                >
                  Book Your Session Today <ArrowRight size={18} />
                </Link>

                {/* Rich step cards with images */}
                <div className="grid md:grid-cols-3 gap-5 mt-14">
                  {steps.map(({ num, title, desc, img }, idx) => (
                    <ScrollReveal key={title} delay={idx * 150} className="h-full" direction="up">
                      <div className="bg-dark-secondary rounded-2xl overflow-hidden border border-border-dark relative group text-left hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between">
                        <div>
                          <div className="relative">
                            <img src={img} alt={title} className="w-full h-44 object-cover" />
                            <div className="absolute top-3 left-3 bg-primary/20 text-primary rounded-lg px-2.5 py-1 text-xs font-bold border border-primary/30">
                              0{num}
                            </div>
                          </div>
                          <div className="p-5 pr-14">
                            <p className="font-semibold text-white text-lg">{title}</p>
                            <p className="text-white/60 text-sm mt-2 leading-relaxed">{desc}</p>
                          </div>
                        </div>
                        <div className="p-5 pt-0 flex justify-end">
                          <button className="w-9 h-9 rounded-full bg-primary hover:bg-primary-hover transition-colors text-white flex items-center justify-center">
                            <ArrowUpRight size={15} />
                          </button>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>

                {/* Carousel nav — right-aligned */}
                <div className="flex items-center justify-end gap-2 mt-7">
                  <button className="w-10 h-10 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center justify-center">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-primary hover:bg-primary-hover transition-colors text-white flex items-center justify-center">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>


    </>
  );
}
