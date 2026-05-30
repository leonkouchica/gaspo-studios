import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Gaspo Studios" },
      { name: "description", content: "Upcoming workshops, exhibitions and past events at Gaspo Studios." },
      { property: "og:title", content: "Events — Gaspo Studios" },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: EventsPage,
});

const upcoming = [
  { m: "JUL", d: 12, title: "Portrait Lighting Workshop", time: "10:00 – 16:00", loc: "Brooklyn Studio", desc: "A hands-on session with Marco covering one, two and three-light portrait setups." },
  { m: "AUG", d: 3, title: "Wedding Photographer Meetup", time: "18:30 – 21:00", loc: "Rooftop, Manhattan", desc: "Casual evening of talks, drinks and portfolio reviews with the Gaspo team." },
  { m: "SEP", d: 21, title: "Exhibition: A Decade of Stories", time: "All day", loc: "Gaspo Gallery", desc: "Our ten-year retrospective spanning more than 80 selected works." },
];

const past = [
  { title: "Spring Portrait Marathon", date: "March 2026", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80" },
  { title: "Brand Photography Masterclass", date: "February 2026", img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80" },
  { title: "New Year Studio Open House", date: "January 2026", img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80" },
];

function EventsPage() {
  return (
    <>
      <PageHeader title="Studio Events" crumb="Events" subtitle="Workshops, exhibitions, and behind-the-scenes nights at Gaspo Studios." />

      <section className="py-20 md:py-28">
        <div className="container-x">
          <h2 className="text-2xl md:text-4xl font-bold text-dark">Upcoming Events</h2>
          <div className="mt-10 space-y-6">
            {upcoming.map((e) => (
              <div key={e.title} className="bg-white rounded-2xl p-6 border border-border flex flex-col md:flex-row gap-6 items-start md:items-center hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="bg-primary text-white rounded-xl p-4 text-center min-w-[88px]">
                  <p className="text-xs uppercase tracking-widest">{e.m}</p>
                  <p className="text-3xl font-bold mt-1">{e.d}</p>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-dark">{e.title}</h3>
                  <p className="text-muted-foreground mt-2">{e.desc}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /> {e.time}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {e.loc}</span>
                  </div>
                </div>
                <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover transition-colors text-white rounded-full px-6 py-3 font-medium">
                  Register <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-muted/40">
        <div className="container-x">
          <h2 className="text-2xl md:text-4xl font-bold text-dark">Past Events</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {past.map((p) => (
              <div key={p.title} className="group rounded-2xl overflow-hidden relative">
                <img src={p.img} alt={p.title} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-xs uppercase tracking-widest text-primary">{p.date}</p>
                  <p className="font-bold text-lg mt-1">{p.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}