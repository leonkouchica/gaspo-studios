import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { Clock, MapPin, ArrowRight, CalendarDays, Users, Tag } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { EventItem } from "../types";

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

interface UpcomingEvent {
  m: string;
  d: number;
  title: string;
  time: string;
  loc: string;
  desc: string;
  spots: number;
  price: string;
  tag: string;
  flyer: string;
}

const upcoming: UpcomingEvent[] = [
  {
    m: "JUL", d: 12,
    title: "Portrait Lighting Workshop",
    time: "10:00 – 16:00",
    loc: "Gaspo Studios, Lagos",
    desc: "A hands-on deep-dive into one, two and three-light portrait setups led by our senior photographer. You'll leave with edited images from the day and a comprehensive lighting guide.",
    spots: 12,
    price: "₦45,000",
    tag: "Workshop",
    flyer: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
  },
  {
    m: "AUG", d: 3,
    title: "Wedding Photographer Meetup",
    time: "18:30 – 21:00",
    loc: "Rooftop Venue, Victoria Island",
    desc: "An intimate evening of talks, drinks and portfolio reviews with the Gaspo team and fellow photographers. Perfect for networking and growing your wedding photography career.",
    spots: 30,
    price: "Free",
    tag: "Networking",
    flyer: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
  },
  {
    m: "SEP", d: 21,
    title: "Exhibition: A Decade of Stories",
    time: "All day (10:00 – 19:00)",
    loc: "Gaspo Gallery, Lagos",
    desc: "Our ten-year retrospective spanning over 80 selected works across weddings, portraits, corporate and fine art photography. Live printing demonstrations and artist Q&A sessions included.",
    spots: 200,
    price: "₦5,000",
    tag: "Exhibition",
    flyer: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  },
];

const past: EventItem[] = [
  { title: "Spring Portrait Marathon", date: "March 2026", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80" },
  { title: "Brand Photography Masterclass", date: "February 2026", img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80" },
  { title: "New Year Studio Open House", date: "January 2026", img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80" },
];

const tagColors: Record<string, string> = {
  Workshop: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Networking: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Exhibition: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

function EventsPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  return (
    <>
      <PageHeader
        title="Studio Events"
        crumb="Events"
        subtitle="Workshops, exhibitions, and behind-the-scenes nights at Gaspo Studios."
        image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
      />

      {/* ── UPCOMING EVENTS ── */}
      <section id="upcoming" className="py-20 md:py-28 scroll-mt-24 bg-background">
        <div className="container-x">
          {/* Section heading */}
          <div className="mb-12">
            <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium flex items-center gap-3">
              <span className="inline-block w-6 h-px bg-primary" />
              What's Coming Up
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark mt-3">Upcoming Events</h2>
          </div>

          <div className="space-y-10">
            {upcoming.map((e, idx) => (
              <div
                key={e.title}
                className={`group rounded-3xl overflow-hidden border border-border bg-white shadow-sm hover:shadow-xl transition-all duration-500 grid lg:grid-cols-[420px_1fr] ${idx % 2 === 1 ? "lg:grid-cols-[1fr_420px]" : ""}`}
              >
                {/* ─── FLYER IMAGE (left on even, right on odd) ─── */}
                <div className={`relative overflow-hidden ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                  <img
                    src={e.flyer}
                    alt={`${e.title} flyer`}
                    className="w-full h-72 lg:h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Date badge overlaid on image */}
                  <div className="absolute top-5 left-5 bg-dark/80 backdrop-blur-sm rounded-2xl px-4 py-3 text-white text-center border border-white/10">
                    <p className="text-xs uppercase tracking-widest text-primary font-semibold">{e.m}</p>
                    <p className="text-3xl font-bold leading-none mt-0.5">{e.d}</p>
                  </div>
                  {/* Tag badge */}
                  <div className={`absolute top-5 right-5 text-xs font-semibold px-3 py-1.5 rounded-full border ${tagColors[e.tag] ?? "bg-white/10 text-white"} backdrop-blur-sm`}>
                    {e.tag}
                  </div>
                </div>

                {/* ─── EVENT DETAILS (right on even, left on odd) ─── */}
                <div className={`flex flex-col justify-between p-8 md:p-10 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-dark leading-tight">{e.title}</h3>
                    <p className="text-muted-foreground mt-4 leading-relaxed text-base">{e.desc}</p>

                    {/* Meta grid */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Clock size={15} />
                        </span>
                        {e.time}
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <MapPin size={15} />
                        </span>
                        {e.loc}
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Users size={15} />
                        </span>
                        {e.spots} spots available
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Tag size={15} />
                        </span>
                        <span className="font-semibold text-dark">{e.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-8 flex items-center gap-4">
                    <button className="group/btn inline-flex items-center gap-2 bg-primary hover:bg-primary-hover transition-colors text-white rounded-full px-7 py-3.5 font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all">
                      <CalendarDays size={16} />
                      Register Now
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <span className="text-xs text-muted-foreground">Limited seats — reserve yours today</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAST EVENTS ── */}
      <section id="past" className="py-20 md:py-28 bg-muted/40 scroll-mt-24">
        <div className="container-x">
          <div className="mb-12">
            <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium flex items-center gap-3">
              <span className="inline-block w-6 h-px bg-primary" />
              Look Back
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark mt-3">Past Events</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
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