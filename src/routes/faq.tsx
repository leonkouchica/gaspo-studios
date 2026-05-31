import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Minus, ArrowRight } from "lucide-react";
import { useState } from "react";
import { ScrollReveal } from "../components/ScrollReveal";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Gaspo Studios" },
      { name: "description", content: "Frequently asked questions about Gaspo Studios photography services." },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FAQPage,
});

const faqs = [
  { q: "What types of photography do you offer?", a: "We specialize in weddings, portraits, corporate headshots, commercial work, and special events. Every shoot is tailored to your vision." },
  { q: "How far in advance should I book?", a: "We recommend booking 2–6 months ahead for weddings and 2–4 weeks for portrait and corporate sessions." },
  { q: "Do you offer photo editing services?", a: "Yes — every gallery is professionally color-graded and retouched. Advanced retouching is available as an add-on." },
  { q: "Can I purchase prints or digital copies?", a: "Absolutely. High-resolution digital files are included with every package, and museum-grade prints are available through our shop." },
];

function FAQPage() {
  const [open, setOpen] = useState<number>(0);

  return (
    <>
      <PageHeader 
        title="Frequently Asked Questions"
        subtitle="Clear and helpful answers to common questions about our photography services, booking timelines and long-term value."
        image="/faq-hero.png"
      />

      <section className="py-20 md:py-28 bg-background overflow-hidden">
        <div className="container-x">
          {/* 2-col: FAQ left, image right */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <div className="divide-y divide-border border-t border-b border-border">
                  {faqs.map((f, i) => (
                    <div key={f.q}>
                      <button
                        onClick={() => setOpen(open === i ? -1 : i)}
                        className="w-full flex items-center justify-between text-left py-5"
                      >
                        <span className="font-semibold text-dark text-lg pr-4">{f.q}</span>
                        <span className="text-primary shrink-0 text-xl font-light">
                          {open === i ? <Minus size={18} /> : <Plus size={18} />}
                        </span>
                      </button>
                      <div className={`grid transition-all duration-300 ${open === i ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"}`}>
                        <p className="overflow-hidden text-muted-foreground leading-relaxed">{f.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 mt-8 bg-primary hover:bg-primary-hover text-white rounded-full px-7 py-3 font-medium transition-colors"
                >
                  Still Have Questions? <ArrowRight size={18} />
                </Link>
              </div>
            </ScrollReveal>

            {/* Image with floating badge */}
            <ScrollReveal direction="right" delay={150}>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=900&q=80"
                  alt="Photographer at work"
                  className="rounded-2xl w-full h-[520px] object-cover"
                />
                <div className="absolute bottom-6 right-6 bg-primary text-white rounded-full px-5 py-2.5 text-sm font-medium shadow-lg">
                  Free Consultation
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
