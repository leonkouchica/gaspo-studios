import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  CalendarDays,
  Users,
  ArrowRight,
  Search,
  Grid3X3,
  List,
  ChevronRight,
  Clock,
  Globe,
  Wifi,
  Landmark,
  Star,
  TrendingUp,
  Zap,
  Loader2,
  Check,
} from "lucide-react";
import { ScrollReveal } from "../../components/ScrollReveal";
import { type Event } from "../../data/events";
import { fetchEvents } from "../../lib/actions/events";
import { toast } from "sonner";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Upcoming Events — Gaspo Studios" },
      {
        name: "description",
        content:
          "Discover upcoming workshops, conferences, and exhibitions at Gaspo Studios. Register now and be part of something extraordinary.",
      },
      { property: "og:title", content: "Upcoming Events — Gaspo Studios" },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: EventsListPage,
});

const TYPE_ICONS = {
  physical: Landmark,
  virtual: Wifi,
  hybrid: Globe,
} as const;

const TYPE_LABELS = {
  physical: "In-Person",
  virtual: "Virtual",
  hybrid: "Hybrid",
} as const;

const CATEGORY_COLORS: Record<string, string> = {
  Technology: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Workshop: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Networking: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Exhibition: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Default: "bg-primary/10 text-primary border-primary/20",
};

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ days, hours, mins, secs });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

function CountdownPill({ date }: { date: string }) {
  const { days, hours, mins } = useCountdown(date);
  if (days === 0 && hours === 0 && mins === 0) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
      <Clock size={12} />
      {days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`} to go
    </div>
  );
}

function EventCard({ event, view }: { event: Event; view: "grid" | "list" }) {
  const TypeIcon = TYPE_ICONS[event.type];
  const categoryColor = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.Default;
  const spotsLeft = event.capacity ? event.capacity - event.registrationCount : null;
  const spotsPct = event.capacity ? (event.registrationCount / event.capacity) * 100 : 0;

  if (view === "list") {
    return (
      <div className="group bg-white rounded-2xl border border-border hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col md:flex-row">
        <div className="relative md:w-72 shrink-0 overflow-hidden">
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-52 md:h-full object-cover group-hover:scale-105 transition-transform duration-700 bg-muted"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark/50 to-transparent md:bg-gradient-to-t" />
          <div className="absolute top-4 left-4 bg-dark/80 backdrop-blur-sm rounded-xl px-3 py-2 text-white text-center border border-white/10">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold">
              {new Date(event.date).toLocaleString("default", { month: "short" })}
            </p>
            <p className="text-2xl font-bold leading-none mt-0.5">
              {new Date(event.date).getDate()}
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-between p-6 flex-1">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryColor}`}
              >
                {event.category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                <TypeIcon size={11} />
                {TYPE_LABELS[event.type]}
              </span>
            </div>
            <h3 className="text-xl font-bold text-dark leading-tight">{event.title}</h3>
            <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{event.summary}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} className="text-primary" />
                {new Date(event.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" />
                {event.city}
              </span>
              {spotsLeft !== null && (
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-primary" />
                  {spotsLeft} spots left
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-5 pt-5 border-t border-border">
            <CountdownPill date={event.date} />
            <Link
              to="/events/$eventId"
              params={{ eventId: event.slug }}
              className="group/btn inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-5 py-2.5 text-sm font-medium transition-all hover:scale-105"
            >
              View Event
              <ArrowRight
                size={14}
                className="group-hover/btn:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="relative overflow-hidden h-52">
        <img
          src={event.bannerImage}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 bg-muted"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/70 to-transparent" />
        <div className="absolute top-4 left-4 bg-dark/80 backdrop-blur-sm rounded-xl px-3 py-2 text-white text-center border border-white/10">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">
            {new Date(event.date).toLocaleString("default", { month: "short" })}
          </p>
          <p className="text-2xl font-bold leading-none mt-0.5">{new Date(event.date).getDate()}</p>
        </div>
        <div
          className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${categoryColor}`}
        >
          {event.category}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
            <TypeIcon size={11} /> {TYPE_LABELS[event.type]}
          </span>
          <CountdownPill date={event.date} />
        </div>
        <h3 className="text-lg font-bold text-dark leading-tight">{event.title}</h3>
        <p className="text-muted-foreground text-sm mt-1.5 line-clamp-3 flex-1">{event.summary}</p>

        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={12} className="text-primary shrink-0" />
            {new Date(event.date).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "long",
            })}{" "}
            · {event.time}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-primary shrink-0" />
            {event.venue}, {event.city}
          </div>
        </div>

        {spotsLeft !== null && event.capacity && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{event.registrationCount} registered</span>
              <span>{spotsLeft} spots left</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(spotsPct, 100)}%` }}
              />
            </div>
          </div>
        )}

        <Link
          to="/events/$eventId"
          params={{ eventId: event.slug }}
          className="group/btn mt-5 w-full inline-flex items-center justify-center gap-2 bg-dark hover:bg-primary text-white rounded-full py-2.5 text-sm font-medium transition-all"
        >
          View More About Event
          <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

function FeaturedHero({ event }: { event: Event }) {
  const { days, hours, mins, secs } = useCountdown(event.date);
  const isCompleted = event.status === "completed" || event.status === "archived";

  return (
    <section className="relative min-h-[calc(70vh+80px)] flex items-end overflow-hidden bg-dark">
      <img
        src={event.bannerImage}
        alt={event.title}
        className="absolute inset-0 w-full h-full object-cover bg-muted opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-dark/20" />

      <div className="container-x relative z-10 pt-28 pb-16 md:pt-32 md:pb-20 w-full">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/30 text-primary text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Star size={11} fill="currentColor" /> Featured Event
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Check size={11} /> Concluded
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">{event.title}</h1>
          <p className="text-white/75 text-lg mt-4 leading-relaxed max-w-2xl">{event.summary}</p>
          <div className="flex flex-wrap gap-4 mt-5 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={15} className="text-primary" />
              {new Date(event.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={15} className="text-primary" />
              {event.venue}, {event.city}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={15} className="text-primary" />
              {event.registrationCount} {isCompleted ? "attended" : "registered"}
            </span>
          </div>

          {/* Countdown or Concluded Pill */}
          {!isCompleted ? (
            <div className="flex gap-3 mt-6">
              {[
                { v: days, l: "Days" },
                { v: hours, l: "Hrs" },
                { v: mins, l: "Min" },
                { v: secs, l: "Sec" },
              ].map(({ v, l }) => (
                <div
                  key={l}
                  className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-3 text-center min-w-[60px]"
                >
                  <p className="text-2xl font-bold text-white tabular-nums">
                    {String(v).padStart(2, "0")}
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium px-4 py-2 rounded-full backdrop-blur-sm mt-6">
              <Check size={15} /> Event Concluded Successfully
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              to="/events/$eventId"
              params={{ eventId: event.slug }}
              className="group inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-7 py-3.5 font-semibold transition-all hover:scale-105 shadow-lg shadow-primary/30"
            >
              {isCompleted ? "View Event Recap" : "Register Now"}{" "}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            {!isCompleted && event.sponsorshipEnabled && (
              <Link
                to="/events/$eventId"
                params={{ eventId: event.slug }}
                className="inline-flex items-center gap-2 text-white border border-white/30 rounded-full px-7 py-3.5 font-medium hover:bg-white/10 transition-all"
              >
                Become a Sponsor
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function EventsListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEvents({ data: { visibleOnly: true } });
      setEvents(data as Event[]);
    } catch (err: any) {
      console.error("Failed to load events:", err);
      toast.error(err.message || "Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const upcomingEvents = events.filter((e) => e.status !== "completed" && e.status !== "archived");
  const pastEvents = events.filter((e) => e.status === "completed" || e.status === "archived");

  const featured = (() => {
    if (upcomingEvents.length > 0) {
      const sorted = [...upcomingEvents].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      const explicitFeatured = sorted.find((e) => e.featured);
      return explicitFeatured || sorted[0];
    }
    return events[0] || null;
  })();
  const categories = Array.from(new Set(upcomingEvents.map((e) => e.category)));

  const filtered = upcomingEvents.filter((e) => {
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.summary.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || e.type === typeFilter;
    const matchCat = categoryFilter === "all" || e.category === categoryFilter;
    return matchSearch && matchType && matchCat;
  });

  return (
    <>
      {loading ? (
        <div className="py-32 text-center text-muted-foreground min-h-[80vh] flex flex-col justify-center items-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm">Loading events…</p>
        </div>
      ) : (
        <>
          {/* ── FEATURED HERO ── */}
          {featured && <FeaturedHero event={featured} />}

          {/* ── STATS BAR ── */}
          <section className="bg-dark border-b border-border-dark">
            <div className="container-x">
              <div className="grid grid-cols-3 divide-x divide-border-dark">
                {[
                  { icon: TrendingUp, label: "Upcoming Events", value: upcomingEvents.length },
                  {
                    icon: Users,
                    label: "Total Registered",
                    value: events.reduce((s, e) => s + e.registrationCount, 0),
                  },
                  { icon: Zap, label: "Cities", value: new Set(events.map((e) => e.city)).size },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 px-6 py-5">
                    <Icon size={20} className="text-primary shrink-0" />
                    <div>
                      <p className="text-xl font-bold text-white">{value}</p>
                      <p className="text-xs text-white/50">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── EVENTS LISTING ── */}
          <section className="py-16 md:py-20 bg-background">
            <div className="container-x">
              <ScrollReveal>
                <div className="mb-6">
                  <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium flex items-center gap-3">
                    <span className="inline-block w-6 h-px bg-primary" />
                    What's Coming Up
                  </p>
                  <h2 className="text-3xl md:text-5xl font-bold text-dark mt-3">Upcoming Events</h2>
                </div>
              </ScrollReveal>

              {/* Filter bar */}
              <ScrollReveal delay={100}>
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="text"
                      placeholder="Search events…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-full border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all bg-white"
                    />
                  </div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-full border border-border px-4 py-3 text-sm bg-white focus:border-primary outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="physical">In-Person</option>
                    <option value="virtual">Virtual</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-full border border-border px-4 py-3 text-sm bg-white focus:border-primary outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-1 bg-muted rounded-full p-1">
                    <button
                      onClick={() => setView("grid")}
                      className={`p-2.5 rounded-full transition-all ${view === "grid" ? "bg-white shadow text-dark" : "text-muted-foreground hover:text-dark"}`}
                      aria-label="Grid view"
                    >
                      <Grid3X3 size={16} />
                    </button>
                    <button
                      onClick={() => setView("list")}
                      className={`p-2.5 rounded-full transition-all ${view === "list" ? "bg-white shadow text-dark" : "text-muted-foreground hover:text-dark"}`}
                      aria-label="List view"
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </ScrollReveal>

              {/* Results */}
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-3xl border border-dashed border-border px-4">
                  <CalendarDays size={38} className="mx-auto mb-3 text-muted-foreground/50" />
                  <h3 className="text-xl font-bold text-dark">No Upcoming Events Right Now</h3>
                  <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
                    We don't have new upcoming events scheduled at the moment. Take a look at our past events below or subscribe to stay notified!
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">
                    No events match your filters.{" "}
                    <button
                      className="text-primary underline"
                      onClick={() => {
                        setSearch("");
                        setTypeFilter("all");
                        setCategoryFilter("all");
                      }}
                    >
                      Clear filters
                    </button>
                  </p>
                </div>
              ) : view === "grid" ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((event, i) => (
                    <ScrollReveal key={event.id} delay={i * 80} className="h-full">
                      <EventCard event={event} view="grid" />
                    </ScrollReveal>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((event, i) => (
                    <ScrollReveal key={event.id} delay={i * 60}>
                      <EventCard event={event} view="list" />
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── PAST EVENTS ── */}
          {pastEvents.length > 0 && (
            <section className="py-16 md:py-20 bg-muted/40">
              <div className="container-x">
                <ScrollReveal>
                  <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium flex items-center gap-3">
                        <span className="inline-block w-6 h-px bg-primary" />
                        Look Back
                      </p>
                      <h2 className="text-3xl md:text-5xl font-bold text-dark mt-3">Past Events</h2>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-md">
                      Relive highlights and insights from our concluded workshops, masterclasses, and conferences.
                    </p>
                  </div>
                </ScrollReveal>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((p, i) => (
                    <ScrollReveal key={p.id} delay={i * 100}>
                      <Link
                        to="/events/$eventId"
                        params={{ eventId: p.slug }}
                        className="group rounded-2xl overflow-hidden relative block h-80 shadow-md hover:shadow-xl transition-all duration-300"
                      >
                        <img
                          src={p.bannerImage || "/images/gallery_1.webp"}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-muted"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/50 to-transparent" />
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                          <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Completed
                          </span>
                          <span className="bg-dark/70 backdrop-blur-sm text-white/90 text-xs px-2.5 py-1 rounded-full border border-white/10 capitalize">
                            {p.category}
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-semibold mb-1.5">
                            <CalendarDays size={13} />
                            <span>
                              {new Date(p.date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            {p.city && (
                              <>
                                <span className="text-white/40">•</span>
                                <span>{p.city}</span>
                              </>
                            )}
                          </div>
                          <p className="font-bold text-lg md:text-xl line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {p.title}
                          </p>
                          <div className="flex items-center justify-between mt-3 text-white/70 text-sm border-t border-white/10 pt-3">
                            <span className="flex items-center gap-1.5 text-xs text-white/75">
                              <Users size={13} className="text-primary" />
                              {p.registrationCount || 0} attendees
                            </span>
                            <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              View Event <ArrowRight size={12} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── NEWSLETTER ── */}
          <section className="py-16 bg-dark">
            <div className="container-x text-center max-w-2xl">
              <ScrollReveal>
                <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">
                  Stay Updated
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
                  Never Miss an Event
                </h2>
                <p className="text-white/60 mt-4 leading-relaxed">
                  Subscribe for early access to new events, registration reminders, and sponsorship
                  opportunities.
                </p>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex flex-col sm:flex-row gap-3 mt-8 max-w-md mx-auto"
                >
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 rounded-full border border-white/20 bg-white/10 text-white placeholder:text-white/40 px-5 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white rounded-full px-7 py-3 text-sm font-semibold transition-all hover:scale-105 whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
              </ScrollReveal>
            </div>
          </section>
        </>
      )}
    </>
  );
}
