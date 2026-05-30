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
  { cat: "Weddings", img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80" },
  { cat: "Portraits", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&q=80" },
  { cat: "Commercial", img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=900&q=80" },
  { cat: "Events", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80" },
  { cat: "Weddings", img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=80" },
  { cat: "Portraits", img: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=900&q=80" },
  { cat: "Commercial", img: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=900&q=80" },
  { cat: "Events", img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=900&q=80" },
  { cat: "Weddings", img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=900&q=80" },
  { cat: "Portraits", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80" },
  { cat: "Commercial", img: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=900&q=80" },
  { cat: "Events", img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80" },
];

function GalleryPage() {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const visible = filter === "All" ? items : items.filter((i) => i.cat === filter);

  return (
    <>
      <PageHeader title="Our Portfolio" crumb="Gallery" subtitle="Explore our collection of weddings, portraits, and commercial work." />

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
                className="mb-6 break-inside-avoid relative group block w-full rounded-2xl overflow-hidden"
              >
                <img src={it.img} alt={it.cat} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
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