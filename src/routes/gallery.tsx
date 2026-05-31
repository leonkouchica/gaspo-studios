import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Portfolio — Gaspo Studios" },
      { name: "description", content: "Explore our portfolio of weddings, portraits, commercial and event photography." },
      { property: "og:title", content: "Portfolio — Gaspo Studios" },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: GalleryPage,
});

const categories = ["All", "Weddings", "Portraits", "Commercial", "Events"] as const;

const items = [
  { cat: "Weddings", img: "/images/wedding_couple.webp", aspect: "aspect-[4/5]" },
  { cat: "Portraits", img: "/images/portrait_woman.webp", aspect: "aspect-square" },
  { cat: "Commercial", img: "/images/corporate_team.webp", aspect: "aspect-[3/2]" },
  { cat: "Events", img: "/images/events_crowd.webp", aspect: "aspect-[4/3]" },
  { cat: "Weddings", img: "/images/wedding_couple.webp", aspect: "aspect-[16/9]" },
  { cat: "Portraits", img: "/images/team_founder.webp", aspect: "aspect-[9/16]" },
  { cat: "Commercial", img: "/images/photographer_hero.webp", aspect: "aspect-[4/5]" },
  { cat: "Events", img: "/images/events_crowd.webp", aspect: "aspect-square" },
  { cat: "Weddings", img: "/images/wedding_couple.webp", aspect: "aspect-[3/2]" },
  { cat: "Portraits", img: "/images/portrait_woman.webp", aspect: "aspect-[4/3]" },
  { cat: "Commercial", img: "/images/corporate_team.webp", aspect: "aspect-[16/9]" },
  { cat: "Events", img: "/images/events_crowd.webp", aspect: "aspect-[9/16]" },
];

function GalleryPage() {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const visible = filter === "All" ? items : items.filter((i) => i.cat === filter);

  return (
    <>
      <PageHeader 
        title="Our Portfolio" 
        crumb="Gallery" 
        subtitle="Explore our collection of weddings, portraits, and commercial work." 
        image="/images/photographer_hero.webp"
      />

      <section className="py-12">
        <div className="container-x">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                  filter === c
                    ? "bg-primary text-white"
                    : "bg-white text-dark border border-border hover:border-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container-x">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
            {visible.map((it, i) => (
              <button
                key={i}
                onClick={() => setLightbox(it.img)}
                className={`mb-6 break-inside-avoid relative group block w-full rounded-2xl overflow-hidden ${it.aspect}`}
              >
                <img src={it.img} alt={it.cat} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <p className="uppercase text-xs tracking-[0.25em] text-primary">{it.cat}</p>
                  <p className="font-bold text-lg mt-2">View Project</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="fixed inset-0 z-[60] bg-dark/95 flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-primary"><X size={20} /></button>
          <img src={lightbox} alt="" className="max-h-[90vh] max-w-full rounded-2xl" />
        </div>
      )}
    </>
  );
}