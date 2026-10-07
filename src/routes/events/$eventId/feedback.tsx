import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MessageSquareHeart, ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { fetchEvent } from "../../../lib/actions/events";
import { EventFeedbackForm } from "../../../components/events/EventFeedbackForm";
import { ScrollReveal } from "../../../components/ScrollReveal";

export const Route = createFileRoute("/events/$eventId/feedback")({
  loader: async ({ params }) => {
    try {
      const event = await fetchEvent({ data: { slug: params.eventId } });
      if (!event) throw notFound();
      return event;
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData: event }) => {
    if (!event) return { meta: [{ title: "Event Feedback — Gaspo Studios" }] };
    return {
      meta: [
        { title: `Feedback for ${event.title} — Gaspo Studios` },
        {
          name: "description",
          content: `Share your thoughts, ratings, and feedback for ${event.title} hosted by Gaspo Studios.`,
        },
        { property: "og:title", content: `Feedback for ${event.title}` },
      ],
    };
  },
  component: EventFeedbackDetailPage,
});

function EventFeedbackDetailPage() {
  const event = Route.useLoaderData();
  if (!event) return null;

  return (
    <div className="min-h-screen bg-dark text-white pt-24 pb-20">
      <div className="container-x max-w-4xl mx-auto px-4">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/events/$eventId"
            params={{ eventId: event.slug }}
            className="inline-flex items-center gap-2 text-white/60 hover:text-primary text-sm transition-colors py-1 px-3 rounded-full hover:bg-white/5"
          >
            <ArrowLeft size={16} /> Back to Event Details
          </Link>
        </div>

        {/* Page Hero Header */}
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold tracking-wide">
              <MessageSquareHeart size={14} /> Official Event Survey
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Event Feedback & Insights
            </h1>
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              Were you part of <span className="text-white font-medium">{event.title}</span>? Tell us
              what went well and how we can make our next experience even better.
            </p>
          </div>
        </ScrollReveal>

        {/* The Feedback Form */}
        <ScrollReveal delay={100}>
          <EventFeedbackForm
            event={{
              id: event.id,
              slug: event.slug,
              title: event.title,
              date: event.date,
              bannerImage: event.bannerImage,
              city: event.city,
              category: event.category,
            }}
          />
        </ScrollReveal>
      </div>
    </div>
  );
}
