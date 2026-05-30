import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Instagram, Facebook, Twitter } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Gaspo Studios" },
      { name: "description", content: "Photography insights, tips, and studio stories from the Gaspo team." },
      { property: "og:title", content: "Blog — Gaspo Studios" },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

const featured = {
  cat: "Wedding",
  title: "Ten Lessons From a Decade of Wedding Photography",
  excerpt: "Marco reflects on the moments, mistakes and breakthroughs that have shaped Gaspo Studios' wedding work — and what every couple should know before booking.",
  img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
  date: "May 28, 2026",
};

import { BlogPost } from "../types";

const posts: BlogPost[] = [
  { cat: "Tips", title: "How to Pose for Headshots: A Practical Guide", excerpt: "Small adjustments make a huge difference. Here's the cheat sheet we share with every client.", img: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&q=80", date: "May 12, 2026", comments: 8 },
  { cat: "Studio", title: "Behind the Scenes of Our Latest Brand Shoot", excerpt: "A look inside our two-day campaign for an emerging skincare label.", img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80", date: "April 30, 2026", comments: 3 },
  { cat: "Gear", title: "Lenses We Reach For Every Single Shoot", excerpt: "From the workhorse 35mm to the dreamy 85, our editors share their favorite glass.", img: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80", date: "April 21, 2026", comments: 12 },
  { cat: "Tips", title: "Lighting a Newborn Session at Home", excerpt: "Soft window light, calm rooms — how we approach delicate first portraits.", img: "https://images.unsplash.com/photo-1546015720-b8b30df5aa27?w=800&q=80", date: "April 8, 2026", comments: 5 },
  { cat: "Industry", title: "Why We Print: The Case for Physical Photographs", excerpt: "Hard drives die. Prints outlast generations. Here's our pitch.", img: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80", date: "March 27, 2026", comments: 2 },
  { cat: "Editorial", title: "Color Grading: Where Art Meets Math", excerpt: "Aisha walks through her three-stage grading workflow.", img: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80", date: "March 14, 2026", comments: 9 },
];

function BlogPage() {
  return (
    <>
      <PageHeader 
        title="Photography Insights" 
        crumb="Blog" 
        subtitle="Tips, studio updates, and featured shoots from the Gaspo team." 
        image="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1920&q=80"
      />

      <section className="py-20 md:py-28">
        <div className="container-x">
          <div className="bg-white rounded-2xl border border-border overflow-hidden grid md:grid-cols-2">
            <img src={featured.img} alt={featured.title} className="w-full h-72 md:h-full object-cover" />
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium self-start">{featured.cat}</span>
              <h2 className="text-2xl md:text-4xl font-bold text-dark mt-4">{featured.title}</h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">{featured.excerpt}</p>
              <div className="flex items-center justify-between mt-6">
                <span className="text-sm text-muted-foreground">{featured.date}</span>
                <a href="#" className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">Read More <ArrowRight size={16} /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container-x">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((p) => (
              <article key={p.title} className="bg-white rounded-2xl p-5 border border-border hover:-translate-y-1 hover:shadow-lg transition-all">
                <img src={p.img} alt={p.title} className="rounded-xl h-48 w-full object-cover" />
                <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                  <span>{p.date}</span>
                  <span>·</span>
                  <span className="text-primary font-medium">{p.cat}</span>
                </div>
                <h3 className="text-lg font-bold text-dark mt-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.excerpt}</p>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <a href="#" className="text-primary text-sm font-medium inline-flex items-center gap-1">Read Article <ArrowRight size={14} /></a>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1 text-xs"><MessageCircle size={14} /> {p.comments}</span>
                    <Instagram size={14} className="hover:text-primary cursor-pointer" />
                    <Facebook size={14} className="hover:text-primary cursor-pointer" />
                    <Twitter size={14} className="hover:text-primary cursor-pointer" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}