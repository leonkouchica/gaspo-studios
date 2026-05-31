import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus, Search, Eye, Pencil, Trash2, ChevronUp, ChevronDown,
  CalendarDays, Users, ArrowRight, Globe, Wifi, Landmark, QrCode
} from "lucide-react";
import { events, type Event } from "../../../data/events";

export const Route = createFileRoute("/admin/events/")({
  component: AdminEventsPage,
});

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  published: "bg-green-500/10 text-green-600 border-green-500/20",
  upcoming: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const TYPE_ICONS = { physical: Landmark, virtual: Wifi, hybrid: Globe };
const TYPE_LABELS = { physical: "In-Person", virtual: "Virtual", hybrid: "Hybrid" };

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  );
}

function AdminEventsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "title" | "registrationCount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<"events" | "registrations" | "sponsors">("events");

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = events
    .filter((e) => {
      const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.city.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortField === "date") diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortField === "title") diff = a.title.localeCompare(b.title);
      if (sortField === "registrationCount") diff = a.registrationCount - b.registrationCount;
      return sortDir === "asc" ? diff : -diff;
    });

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field ? (
      sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
    ) : (
      <ChevronDown size={13} className="opacity-30" />
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Events</h1>
          <p className="text-muted-foreground text-sm mt-1">{events.length} total events</p>
        </div>
        <Link
          to="/admin/events/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105"
        >
          <Plus size={16} /> Create Event
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {(["events", "registrations", "sponsors"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? "bg-white shadow text-dark" : "text-muted-foreground hover:text-dark"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "events" && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-border px-3 py-2.5 text-sm bg-white focus:border-primary outline-none"
            >
              <option value="all">All Statuses</option>
              {["draft", "published", "upcoming", "completed", "cancelled"].map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <button onClick={() => toggleSort("title")} className="flex items-center gap-1 hover:text-dark transition-colors">
                        Title <SortIcon field="title" />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category / Type</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <button onClick={() => toggleSort("date")} className="flex items-center gap-1 hover:text-dark transition-colors">
                        Date <SortIcon field="date" />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <button onClick={() => toggleSort("registrationCount")} className="flex items-center gap-1 hover:text-dark transition-colors">
                        Registrations <SortIcon field="registrationCount" />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((event) => {
                    const TypeIcon = TYPE_ICONS[event.type];
                    return (
                      <tr key={event.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={event.bannerImage}
                              alt={event.title}
                              className="w-12 h-10 rounded-lg object-cover shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-dark line-clamp-1">{event.title}</p>
                              <p className="text-xs text-muted-foreground">{event.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-dark">{event.category}</p>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <TypeIcon size={11} /> {TYPE_LABELS[event.type]}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Users size={13} className="text-primary" />
                            <span className="font-medium text-dark">{event.registrationCount}</span>
                            {event.capacity && (
                              <span className="text-xs text-muted-foreground">/ {event.capacity}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={event.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 justify-end">
                            <Link
                              to="/events/$eventId"
                              params={{ eventId: event.slug }}
                              target="_blank"
                              className="w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-dark flex items-center justify-center transition-colors"
                              title="Preview"
                            >
                              <Eye size={14} />
                            </Link>
                            <Link
                              to="/admin/events/$eventId/edit"
                              params={{ eventId: event.id }}
                              className="w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-dark flex items-center justify-center transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </Link>
                            <Link
                              to="/admin/events/$eventId/check-in"
                              params={{ eventId: event.id }}
                              className="w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-dark flex items-center justify-center transition-colors"
                              title="Check-in"
                            >
                              <QrCode size={14} />
                            </Link>
                            <button
                              className="w-8 h-8 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 flex items-center justify-center transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                        No events match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "registrations" && (
        <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground">
          <Users size={40} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-semibold text-dark">Registration data</p>
          <p className="text-sm mt-1">Select an event to view its registrations.</p>
          <div className="mt-6 flex flex-col gap-2 max-w-sm mx-auto">
            {events.map((e) => (
              <button key={e.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left">
                <div>
                  <p className="text-sm font-semibold text-dark">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.registrationCount} registered</p>
                </div>
                <ArrowRight size={14} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "sponsors" && (
        <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground">
          <CalendarDays size={40} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-semibold text-dark">Sponsorship enquiries</p>
          <p className="text-sm mt-1">Sponsor submissions will appear here when connected to Supabase.</p>
        </div>
      )}
    </div>
  );
}
