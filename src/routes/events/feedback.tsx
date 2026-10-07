import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  MessageSquareHeart,
  CalendarDays,
  MapPin,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Users,
} from "lucide-react";
import { fetchEvents } from "../../lib/actions/events";
import { EventFeedbackForm } from "../../components/events/EventFeedbackForm";
import { ScrollReveal } from "../../components/ScrollReveal";
import { type Event } from "../../data/events";

interface FeedbackSearchParams {
  event?: string;
}

export const Route = createFileRoute("/events/feedback")({
  validateSearch: (search: Record<string, unknown>): FeedbackSearchParams => {
    return {
      event: typeof search.event === "string" ? search.event : undefined,
    };
  },
  loader: async () => {
    try {
      const data = await fetchEvents({ data: { visibleOnly: true } });
      return (data || []) as Event[];
    } catch {
      return [] as Event[];
    }
  },
  head: () => ({
    meta: [
      { title: "Event Feedback & Survey — Gaspo Studios" },
      {
        name: "description",
        content:
          "Share your feedback, ratings, and thoughts on events and masterclasses hosted by Gaspo Studios.",
      },
      { property: "og:title", content: "Event Feedback — Gaspo Studios" },
    ],
  }),
  component: GeneralEventFeedbackPage,
});

function GeneralEventFeedbackPage() {
  const events = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  // Prioritize completed events first, then others
  const sortedEvents = [...events].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return -1;
    if (b.status === "completed" && a.status !== "completed") return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const selectedEvent = search.event
    ? events.find((e) => e.slug === search.event || e.id === search.event)
    : null;

  const handleSelectEvent = (slug: string) => {
    navigate({
      search: { event: slug },
    });
  };

  return (
    <div className="min-h-screen bg-dark text-white pt-24 pb-20">
      <div className="container-x max-w-4xl mx-auto px-4">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold tracking-wide">
              <MessageSquareHeart size={14} /> Community Insights
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Event Feedback & Survey
            </h1>
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              Your honest perspective shapes the future of Gaspo Studios masterclasses,
              conferences, and networking gatherings.
            </p>
          </div>
        </ScrollReveal>

        {/* Event Quick Switcher Bar */}
        {sortedEvents.length > 0 && (
          <ScrollReveal delay={50} className="mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-white/60 font-medium">
                {selectedEvent ? "Currently Giving Feedback For:" : "Select an Event to Begin:"}
              </span>
              <div className="relative w-full sm:w-80">
                <select
                  value={selectedEvent ? selectedEvent.slug : ""}
                  onChange={(e) => handleSelectEvent(e.target.value)}
                  className="w-full bg-dark-secondary border border-border-dark text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 appearance-none focus:border-primary outline-none cursor-pointer"
                >
                  <option value="">-- Choose an Event --</option>
                  {sortedEvents.map((e) => (
                    <option key={e.id} value={e.slug}>
                      {e.title} {e.status === "completed" ? "(Concluded)" : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
                />
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Main Content Area */}
        {selectedEvent ? (
          <ScrollReveal delay={100}>
            <EventFeedbackForm
              event={{
                id: selectedEvent.id,
                slug: selectedEvent.slug,
                title: selectedEvent.title,
                date: selectedEvent.date,
                bannerImage: selectedEvent.bannerImage,
                city: selectedEvent.city,
                category: selectedEvent.category,
              }}
            />
          </ScrollReveal>
        ) : (
          <ScrollReveal delay={100}>
            <div className="space-y-6">
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold text-white">
                  Which Gaspo Studios event did you attend?
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  Click on any event below to load its feedback survey.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {sortedEvents.map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => handleSelectEvent(evt.slug)}
                    className="group bg-dark-secondary/80 border border-border-dark hover:border-primary/50 rounded-2xl p-4 text-left transition-all hover:scale-[1.01] flex items-center gap-4"
                  >
                    <img
                      src={evt.bannerImage || "/images/gallery_1.webp"}
                      alt={evt.title}
                      className="w-20 h-20 rounded-xl object-cover bg-muted shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          {evt.category}
                        </span>
                        {evt.status === "completed" && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            Concluded
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-sm truncate group-hover:text-primary transition-colors">
                        {evt.title}
                      </h4>
                      <p className="text-white/50 text-xs flex items-center gap-1 mt-1">
                        <CalendarDays size={12} className="text-primary shrink-0" />
                        {new Date(evt.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-white/40 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0"
                    />
                  </button>
                ))}
              </div>

              {sortedEvents.length === 0 && (
                <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-white/60 text-sm">No events found to provide feedback for.</p>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
