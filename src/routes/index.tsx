import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Camera, Users, Building2, Sparkles, Award, Plus, Minus } from "lucide-react";
import { useState } from "react";

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
  { icon: Building2, title: "Corporate Photography", desc: "Elevate your brand with professional photographs that make a statement.", img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80" },
  { icon: Users, title: "Special Events", desc: "From birthdays to graduations, treasure every moment with stunning photographs.", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80" },
];

const faqs = [
  { q: "What types of photography do you offer?", a: "We specialize in weddings, portraits, corporate headshots, commercial work, and special events. Every shoot is tailored to your vision." },
  { q: "How far in advance should I book?", a: "We recommend booking 2–6 months ahead for weddings and 2–4 weeks for portrait and corporate sessions." },
  { q: "Do you offer photo editing services?", a: "Yes — every gallery is professionally color-graded and retouched. Advanced retouching is available as an add-on." },
  { q: "Can I purchase prints or digital copies?", a: "Absolutely. High-resolution digital files are included with every package, and museum-grade prints are available through our shop." },
];

function Index() {
  const [open, setOpen] = useState(0);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden bg-dark">
        <img
          src="https://images.unsplash.com/photo-1554080353-a576cf803bda?w=1920&q=80"
          alt="Studio photography hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/60 to-transparent" />

        <div className="container-x relative grid lg:grid-cols-2 gap-12 items-center py-20">
          <div className="text-white max-w-xl fade-up">
            <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">Professional Photography Studio</p>
            <h1 className="text-5xl md:text-7xl font-bold mt-4">Capture Your Moments with Gaspo Studios</h1>
            <p className="text-xl md:text-2xl text-white/80 mt-4 font-light">Where Art Meets Precision in Photography</p>
            <p className="text-base text-white/70 mt-6 leading-relaxed">
              Welcome to Gaspo Studios, your ultimate destination for professional photography services. Whether you're looking to capture the magic of your wedding day, the essence of a portrait, or need commercial photography that stands out — we're here for you.
            </p>
            <div className="flex flex-wrap gap-3 mt-10">
              <Link to="/book" className="group inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-7 py-3.5 font-medium transition-all hover:scale-105">
                Book a Shoot
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/shop" className="inline-flex items-center gap-2 text-white border border-white/30 rounded-full px-7 py-3.5 font-medium hover:bg-white/10 transition-all">
                Visit the Shop
              </Link>
            </div>
          </div>

          {/* Floating stats card */}
          <div className="hidden lg:block relative">
            <div className="ml-auto w-72 bg-dark-secondary/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80" alt="" className="w-full h-32 object-cover rounded-xl" />
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-white">500+</p>
                  <p className="text-sm text-white/60 mt-1">Sessions captured<br />across 12 countries</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center text-white">
                  <ArrowUpRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white py-8 border-b border-border">
        <div className="container-x">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">Trusted by leading brands & happy couples</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-60">
            {["AURELIA", "NORTHWIND", "BELLEVUE", "MAISON & CO", "VERVE", "STILLPOINT"].map((n) => (
              <span key={n} className="text-dark font-bold tracking-[0.2em] text-sm">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container-x grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=900&q=80" alt="Studio" className="rounded-2xl shadow-xl w-full h-[520px] object-cover" />
            <div className="absolute -bottom-4 -right-4 bg-primary text-white rounded-full px-5 py-3 font-medium shadow-lg">
              10+ Years Experience
            </div>
          </div>
          <div>
            <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">About Us</p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark mt-3">Building Visual Stories That Last Forever</h2>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              At Gaspo Studios, we believe in creating memorable images that last a lifetime. Founded over a decade ago, our studio has been at the forefront of capturing stunning visual stories — blending creativity, reliability, and uncompromising craft.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { icon: Sparkles, t: "Creative Direction", d: "Tailored concepts from the first sketch to final frame." },
                { icon: Award, t: "Professional Editing", d: "Color-graded and retouched by award-winning artists." },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="bg-white rounded-xl p-5 border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Icon size={20} /></div>
                  <p className="mt-3 font-semibold text-dark">{t}</p>
                  <p className="text-sm text-muted-foreground mt-1">{d}</p>
                </div>
              ))}
            </div>
            <Link to="/about" className="inline-flex items-center gap-2 mt-8 border border-dark text-dark rounded-full px-7 py-3 font-medium hover:bg-dark hover:text-white transition-all group">
              Meet Our Team
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 md:py-28 bg-muted/40">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">Our Services</p>
              <h2 className="text-3xl md:text-5xl font-bold text-dark mt-3">Integrated Photography Solutions</h2>
              <p className="text-muted-foreground mt-4 text-lg">From intimate portraits to large-scale commercial campaigns — one studio, every story.</p>
            </div>
            <Link to="/book" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-3 font-medium transition-colors self-start md:self-end">
              View Services <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, desc, img }, i) => (
              <div key={title} className={`group relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${i === 0 ? "bg-dark border-border-dark text-white" : "bg-white border-border"}`}>
                <button className="absolute top-5 right-5 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center">
                  <ArrowUpRight size={16} />
                </button>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${i === 0 ? "bg-white/10 text-primary" : "bg-primary/10 text-primary"}`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mt-5">{title}</h3>
                <p className={`mt-3 text-sm leading-relaxed ${i === 0 ? "text-white/70" : "text-muted-foreground"}`}>{desc}</p>
                <img src={img} alt={title} className="mt-6 rounded-xl h-40 w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container-x grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[520px]">
            <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=80" alt="" className="absolute top-0 left-0 w-3/4 h-80 object-cover rounded-2xl" />
            <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80" alt="" className="absolute bottom-0 right-0 w-1/2 h-64 object-cover rounded-2xl border-4 border-white shadow-xl" />
            <div className="absolute top-1/2 -left-2 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2 text-sm font-medium">
              <Award size={16} className="text-primary" /> Award Winning Portfolio
            </div>
          </div>
          <div>
            <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">Portfolio</p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark mt-3">Stunning Visuals for Every Occasion</h2>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              Explore a curated selection of weddings, portraits, and brand work spanning more than a decade. Every project is a collaboration — and the proof is in the gallery.
            </p>
            <Link to="/gallery" className="inline-flex items-center gap-2 mt-8 bg-primary hover:bg-primary-hover text-white rounded-full px-7 py-3.5 font-medium transition-colors">
              Explore Our Portfolio <ArrowRight size={18} />
            </Link>
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
          </div>
        </div>
      </section>

      {/* BOOKING CTA */}
      <section className="py-20 md:py-28 bg-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(225,45,45,0.25),transparent_60%)]" />
        <div className="container-x relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold">Ready to Capture Your Next Moment?</h2>
          <p className="text-white/70 max-w-2xl mx-auto mt-5 text-lg">
            Booking your photo shoot with Gaspo Studios is simple and convenient. Choose from our wide range of photography services tailored to meet your needs.
          </p>
          <Link to="/book" className="inline-flex items-center gap-2 mt-8 bg-primary hover:bg-primary-hover text-white rounded-full px-8 py-4 font-semibold transition-all hover:scale-105">
            Book Your Session Today <ArrowRight size={18} />
          </Link>
          <div className="grid md:grid-cols-3 gap-4 mt-14 max-w-3xl mx-auto">
            {["Select Service", "Choose Date", "Confirm Booking"].map((t, i) => (
              <div key={t} className="bg-dark-secondary rounded-xl p-5 border border-border-dark text-left">
                <span className="text-primary font-bold text-sm">0{i + 1}</span>
                <p className="font-semibold mt-1">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-muted/40">
        <div className="container-x grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">FAQ</p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark mt-3">Frequently Asked Questions</h2>
            <div className="mt-8 divide-y divide-border border-t border-b border-border">
              {faqs.map((f, i) => (
                <div key={f.q}>
                  <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between text-left py-5">
                    <span className="font-semibold text-dark text-lg pr-4">{f.q}</span>
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {open === i ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>
                  <div className={`grid transition-all duration-300 ${open === i ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"}`}>
                    <p className="overflow-hidden text-muted-foreground">{f.a}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/contact" className="inline-flex items-center gap-2 mt-8 bg-primary hover:bg-primary-hover text-white rounded-full px-7 py-3 font-medium transition-colors">
              View All FAQ <ArrowRight size={18} />
            </Link>
          </div>
          <img src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=900&q=80" alt="Photographer at work" className="rounded-2xl w-full h-[520px] object-cover" />
        </div>
      </section>
    </>
  );
}
