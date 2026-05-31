import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft, Save } from "lucide-react";
import { events } from "../../../../data/events";

export const Route = createFileRoute("/admin/events/$eventId/edit")({
  loader: ({ params }) => {
    const event = events.find((e) => e.id === params.eventId);
    if (!event) throw notFound();
    return event;
  },
  component: EditEventPage,
  notFoundComponent: () => (
    <div className="text-center py-20">
      <p className="text-muted-foreground">Event not found.</p>
      <Link to="/admin/events" className="text-primary mt-4 inline-block hover:underline">← Back to Events</Link>
    </div>
  ),
});

function EditEventPage() {
  const event = Route.useLoaderData();
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/events"
          className="w-9 h-9 rounded-xl border border-border bg-white hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-dark transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-dark">Edit Event</h1>
          <p className="text-muted-foreground text-sm mt-0.5 truncate max-w-xs">{event.title}</p>
        </div>
        <button className="ml-auto inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105">
          <Save size={15} /> Save Changes
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground">
        <p className="font-semibold text-dark">Editing: {event.title}</p>
        <p className="text-sm mt-2">This form mirrors the Create Event flow, pre-populated with the selected event's data.</p>
        <p className="text-xs mt-4 bg-muted rounded-xl p-3 text-muted-foreground">
          In preview mode, changes are not persisted. Full save functionality activates when Supabase is connected in Phase 3.
        </p>
        <Link to="/events/$eventId" params={{ eventId: event.slug }} target="_blank"
          className="mt-5 inline-flex items-center gap-2 bg-dark text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-primary transition-colors">
          Preview Event Page
        </Link>
      </div>
    </div>
  );
}
