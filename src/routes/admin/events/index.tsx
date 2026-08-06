import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  CalendarDays,
  Users,
  ArrowRight,
  Globe,
  Wifi,
  Landmark,
  QrCode,
  RefreshCw,
  AlertCircle,
  Loader2,
  UserCheck,
  UserMinus,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Mail,
  Send,
} from "lucide-react";
import {
  fetchEvents,
  deleteEvent,
  fetchEventRegistrations,
  checkInAttendee,
  enableSponsorshipForAllEvents,
  resendConfirmationEmail,
} from "../../../lib/actions/events";
import { fetchEventSponsors, updateSponsorStatus } from "../../../lib/actions/sponsors";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/events/")({
  component: AdminEventsPage,
});

interface Event {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  type: "physical" | "virtual" | "hybrid";
  status: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  country: string;
  bannerImage: string;
  registrationCount: number;
  capacity?: number;
}

interface Registration {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  country: string;
  city: string;
  linkedin?: string;
  howHeard: string;
  ticketType?: string;
  paymentStatus: string;
  registeredAt: string;
  qrCode?: string;
  checkedIn: boolean;
  checkedInAt?: string;
}

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
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {status}
    </span>
  );
}

function AdminEventsPage() {
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "title" | "registrationCount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState<"events" | "registrations" | "sponsors">("events");

  // Registration states
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [regSearch, setRegSearch] = useState("");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendingAll, setResendingAll] = useState(false);

  // Sponsor states
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(false);
  const [sponsorPaymentFilter, setSponsorPaymentFilter] = useState("all");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents({ data: { status: "all" } });
      setEventsList(data as Event[]);
    } catch (err: any) {
      setError(err.message || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const loadRegistrations = useCallback(async (eventId: string) => {
    setLoadingRegs(true);
    try {
      const data = await fetchEventRegistrations({ data: { eventId } });
      setRegistrations(data as Registration[]);
    } catch (err: any) {
      toast.error(`Failed to load registrations: ${err.message}`);
    } finally {
      setLoadingRegs(false);
    }
  }, []);

  const loadSponsors = useCallback(async () => {
    setLoadingSponsors(true);
    try {
      const data = await fetchEventSponsors({ data: { paymentStatus: sponsorPaymentFilter } });
      setSponsors(data as any[]);
    } catch (err: any) {
      toast.error(`Failed to load sponsors: ${err.message}`);
    } finally {
      setLoadingSponsors(false);
    }
  }, [sponsorPaymentFilter]);

  useEffect(() => {
    if (activeTab === "sponsors") loadSponsors();
  }, [activeTab, loadSponsors]);

  const handleSelectEventForRegs = (event: Event) => {
    setSelectedEvent(event);
    loadRegistrations(event.id);
  };

  const handleToggleCheckIn = async (regId: string, currentStatus: boolean) => {
    try {
      const updated = await checkInAttendee({
        data: { registrationId: regId, checkedIn: !currentStatus },
      });
      setRegistrations((prev) => prev.map((r) => (r.id === regId ? (updated as Registration) : r)));
      toast.success(
        `Successfully ${!currentStatus ? "checked in" : "removed check-in for"} ${updated.fullName}`,
      );
    } catch (err: any) {
      toast.error(`Failed to update check-in: ${err.message}`);
    }
  };

  /** Resend confirmation email to a single attendee or all attendees of selected event */
  const handleResendEmail = async (registrationId?: string) => {
    if (!selectedEvent) return;
    const isBulk = !registrationId;
    if (isBulk) {
      if (
        !confirm(
          `Resend the corrected confirmation email to ALL ${registrations.length} registrant(s) for "${selectedEvent.title}"?`,
        )
      )
        return;
      setResendingAll(true);
    } else {
      setResendingId(registrationId);
    }
    try {
      const result = await resendConfirmationEmail({
        data: { eventId: selectedEvent.id, registrationId },
      });
      if (isBulk) {
        toast.success(
          `Confirmation emails resent: ${result.successCount} succeeded${
            result.failCount > 0 ? `, ${result.failCount} failed` : ""
          }.`,
        );
      } else {
        toast.success(`Confirmation email resent successfully.`);
      }
    } catch (err: any) {
      toast.error(`Failed to resend: ${err.message}`);
    } finally {
      setResendingAll(false);
      setResendingId(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the event "${title}"?`)) return;

    try {
      await deleteEvent({ data: { id } });
      toast.success("Event deleted successfully.");
      setEventsList((prev) => prev.filter((e) => e.id !== id));
      if (selectedEvent?.id === id) {
        setSelectedEvent(null);
      }
    } catch (err: any) {
      toast.error(`Failed to delete event: ${err.message}`);
    }
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = eventsList
    .filter((e) => {
      const matchSearch =
        !search ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.city.toLowerCase().includes(search.toLowerCase());
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

  const filteredRegs = registrations.filter((r) => {
    if (!regSearch) return true;
    const searchLower = regSearch.toLowerCase();
    return (
      r.fullName.toLowerCase().includes(searchLower) ||
      r.email.toLowerCase().includes(searchLower) ||
      (r.company && r.company.toLowerCase().includes(searchLower)) ||
      (r.jobTitle && r.jobTitle.toLowerCase().includes(searchLower))
    );
  });

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field ? (
      sortDir === "asc" ? (
        <ChevronUp size={13} />
      ) : (
        <ChevronDown size={13} />
      )
    ) : (
      <ChevronDown size={13} className="opacity-30" />
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Events</h1>
          <p className="text-muted-foreground text-sm mt-1">{eventsList.length} total events</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadEvents}
            disabled={loading}
            className="p-2.5 rounded-xl border border-border bg-white hover:bg-muted text-muted-foreground hover:text-dark transition-colors disabled:opacity-50"
            title="Refresh events"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            to="/admin/events/new"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105"
          >
            <Plus size={16} /> Create Event
          </Link>
          <button
            type="button"
            onClick={async () => {
              if (
                !confirm(
                  "Enable sponsorship for ALL existing events? This will make the Sponsor section visible on every event page.",
                )
              )
                return;
              try {
                const result = await enableSponsorshipForAllEvents();
                toast.success(`Sponsorship enabled for ${(result as any).updatedCount} events.`);
                loadEvents();
              } catch (err: any) {
                toast.error(`Failed: ${err.message}`);
              }
            }}
            className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 hover:bg-amber-500/20 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
            title="Enable sponsorship for all existing events so sponsors appear on event pages"
          >
            <Sparkles size={14} /> Enable Sponsors
          </button>
        </div>
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
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events by title or city…"
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
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Error Loading Events</p>
                <p className="text-sm mt-0.5">{error}</p>
                <button
                  onClick={loadEvents}
                  className="mt-2 text-xs font-semibold underline hover:text-red-800 flex items-center gap-1"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <button
                        onClick={() => toggleSort("title")}
                        className="flex items-center gap-1 hover:text-dark transition-colors"
                      >
                        Title <SortIcon field="title" />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Category / Type
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <button
                        onClick={() => toggleSort("date")}
                        className="flex items-center gap-1 hover:text-dark transition-colors"
                      >
                        Date <SortIcon field="date" />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <button
                        onClick={() => toggleSort("registrationCount")}
                        className="flex items-center gap-1 hover:text-dark transition-colors"
                      >
                        Registrations <SortIcon field="registrationCount" />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                        <Loader2 size={24} className="animate-spin mx-auto mb-3 text-primary" />
                        <p className="text-sm">Loading events from Supabase…</p>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                        No events found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((event) => {
                      const TypeIcon = TYPE_ICONS[event.type] || Landmark;
                      return (
                        <tr key={event.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {event.bannerImage ? (
                                <img
                                  src={event.bannerImage}
                                  alt={event.title}
                                  className="w-12 h-10 rounded-lg object-cover shrink-0 bg-muted"
                                />
                              ) : (
                                <div className="w-12 h-10 rounded-lg bg-muted shrink-0 flex items-center justify-center text-muted-foreground text-xs font-bold">
                                  No Banner
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-dark line-clamp-1">
                                  {event.title}
                                </p>
                                <p className="text-xs text-muted-foreground">{event.city}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-dark">{event.category}</p>
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <TypeIcon size={11} /> {TYPE_LABELS[event.type] || event.type}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            {new Date(event.date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Users size={13} className="text-primary" />
                              <span className="font-medium text-dark">
                                {event.registrationCount}
                              </span>
                              {event.capacity && (
                                <span className="text-xs text-muted-foreground">
                                  / {event.capacity}
                                </span>
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
                                title="Preview Page"
                              >
                                <Eye size={14} />
                              </Link>
                              <Link
                                to="/admin/events/$eventId/edit"
                                params={{ eventId: event.id }}
                                className="w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-dark flex items-center justify-center transition-colors"
                                title="Edit Event"
                              >
                                <Pencil size={14} />
                              </Link>
                              <Link
                                to="/admin/events/$eventId/check-in"
                                params={{ eventId: event.id }}
                                className="w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-dark flex items-center justify-center transition-colors"
                                title="Attendee Check-in"
                              >
                                <QrCode size={14} />
                              </Link>
                              <button
                                onClick={() => handleDelete(event.id, event.title)}
                                className="w-8 h-8 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 flex items-center justify-center transition-colors"
                                title="Delete Event"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "registrations" && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left panel: events selector */}
          <div className="md:col-span-1 bg-white rounded-2xl border border-border p-4 h-fit">
            <h3 className="font-bold text-dark text-sm mb-3 px-2">Select Event</h3>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 size={18} className="animate-spin mx-auto mb-2 text-primary" />
                <p className="text-xs">Loading events…</p>
              </div>
            ) : eventsList.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 py-4">No events found.</p>
            ) : (
              <div className="space-y-1 max-h-[450px] overflow-y-auto pr-1">
                {eventsList.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => handleSelectEventForRegs(e)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${selectedEvent?.id === e.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/50"}`}
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-semibold text-dark truncate">{e.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {e.registrationCount} registered •{" "}
                        {new Date(e.date).toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <ArrowRight
                      size={12}
                      className={`shrink-0 ${selectedEvent?.id === e.id ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right panel: registrations list */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-border p-5 flex flex-col min-h-[400px]">
            {!selectedEvent ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                <Users size={36} className="mb-3 opacity-30 text-primary" />
                <p className="font-semibold text-dark text-sm">No Event Selected</p>
                <p className="text-xs mt-1 max-w-xs">
                  Select an event from the left panel to manage registrations and handle guest
                  check-ins.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-border">
                  <div>
                    <h3 className="font-bold text-dark text-base line-clamp-1">
                      {selectedEvent.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {filteredRegs.length} shown of {registrations.length} registrations
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleResendEmail()}
                      disabled={resendingAll || registrations.length === 0}
                      className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl px-3 py-1.5 text-xs font-semibold transition-all self-start sm:self-auto"
                      title="Resend corrected confirmation email to all registrants"
                    >
                      {resendingAll ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Send size={13} />
                      )}
                      Resend All
                    </button>
                    <Link
                      to="/admin/events/$eventId/check-in"
                      params={{ eventId: selectedEvent.id }}
                      className="inline-flex items-center gap-1.5 bg-dark text-white rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-primary transition-all self-start sm:self-auto"
                    >
                      <QrCode size={13} /> Scanner View
                    </Link>
                  </div>
                </div>

                <div className="relative mb-4">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={regSearch}
                    onChange={(e) => setRegSearch(e.target.value)}
                    placeholder="Search by name, email, company, job title…"
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-border focus:border-primary outline-none text-xs bg-muted/20"
                  />
                </div>

                <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2 pr-1">
                  {loadingRegs ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Loader2 size={20} className="animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-xs">Loading attendee registrations…</p>
                    </div>
                  ) : filteredRegs.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-16">
                      {regSearch
                        ? "No attendees match your search."
                        : "No attendees have registered for this event yet."}
                    </p>
                  ) : (
                    filteredRegs.map((reg) => (
                      <div
                        key={reg.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-border bg-muted/5 gap-3 hover:border-muted-foreground/30 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-dark text-sm">{reg.fullName}</span>
                            <span className="text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded uppercase font-mono">
                              {reg.id.substring(0, 8)}
                            </span>
                            {reg.ticketType && (
                              <span className="text-[10px] text-primary bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded font-medium capitalize">
                                {reg.ticketType}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {reg.email} • {reg.phone}
                          </p>
                          {reg.company && (
                            <p className="text-[11px] text-dark mt-1 font-medium">
                              {reg.jobTitle ? `${reg.jobTitle} at ` : ""}
                              {reg.company}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Registered on{" "}
                            {new Date(reg.registeredAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap justify-end">
                          {/* Payment status */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${reg.paymentStatus === "completed" || reg.paymentStatus === "paid" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}
                          >
                            {reg.paymentStatus === "completed" || reg.paymentStatus === "paid"
                              ? "Paid"
                              : reg.paymentStatus}
                          </span>

                          {/* Resend confirmation email */}
                          <button
                            onClick={() => handleResendEmail(reg.id)}
                            disabled={resendingId === reg.id}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            title="Resend corrected confirmation email to this attendee"
                          >
                            {resendingId === reg.id ? (
                              <Loader2 size={12} className="shrink-0 animate-spin" />
                            ) : (
                              <Mail size={12} className="shrink-0" />
                            )}
                            Resend
                          </button>

                          {/* Check-in status and trigger */}
                          {reg.checkedIn ? (
                            <button
                              onClick={() => handleToggleCheckIn(reg.id, reg.checkedIn)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                              title="Click to remove check-in"
                            >
                              <CheckCircle2 size={12} className="shrink-0" /> Checked In
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleCheckIn(reg.id, reg.checkedIn)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-dark bg-white border border-border hover:bg-dark hover:text-white px-2.5 py-1.5 rounded-lg transition-colors"
                              title="Click to check in"
                            >
                              <UserCheck size={12} className="shrink-0" /> Check In
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "sponsors" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={sponsorPaymentFilter}
              onChange={(e) => setSponsorPaymentFilter(e.target.value)}
              className="rounded-xl border border-border px-3 py-2 text-sm bg-white focus:border-primary outline-none"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <button onClick={() => loadSponsors()} className="text-sm text-primary hover:underline">
              Refresh
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">
                      Company
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">
                      Event
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">
                      Package
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">
                      Amount
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">
                      Payment
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">
                      Status
                    </th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingSponsors ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-muted-foreground">
                        <Loader2 size={24} className="animate-spin mx-auto mb-3 text-primary" />
                        <p className="text-sm">Loading sponsors…</p>
                      </td>
                    </tr>
                  ) : sponsors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-muted-foreground">
                        <CalendarDays size={32} className="mx-auto mb-3 text-muted-foreground/40" />
                        <p className="font-semibold text-dark">No sponsors yet</p>
                        <p className="text-sm mt-1">
                          Sponsor submissions will appear here when visitors sponsor an event.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    sponsors.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-dark">{s.companyName}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.contactName} • {s.contactEmail}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground text-xs">{s.eventTitle}</td>
                        <td className="px-5 py-4">
                          <span className="text-dark font-medium">{s.packageName}</span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-dark">
                          ₦{Number(s.packagePrice).toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              s.paymentStatus === "paid"
                                ? "bg-green-500/10 text-green-600"
                                : s.paymentStatus === "failed"
                                  ? "bg-red-500/10 text-red-600"
                                  : "bg-amber-500/10 text-amber-600"
                            }`}
                          >
                            {s.paymentStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              s.status === "active"
                                ? "bg-blue-500/10 text-blue-600"
                                : s.status === "completed"
                                  ? "bg-green-500/10 text-green-600"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            {s.status === "active" && (
                              <button
                                onClick={async () => {
                                  try {
                                    await updateSponsorStatus({
                                      data: { sponsorId: s.id, status: "completed" },
                                    });
                                    toast.success("Sponsor marked as completed.");
                                    loadSponsors();
                                  } catch (err: any) {
                                    toast.error(err.message);
                                  }
                                }}
                                className="text-xs text-green-600 hover:underline px-2"
                              >
                                Complete
                              </button>
                            )}
                            {s.status !== "cancelled" && (
                              <button
                                onClick={async () => {
                                  if (!confirm(`Cancel sponsorship from ${s.companyName}?`)) return;
                                  try {
                                    await updateSponsorStatus({
                                      data: { sponsorId: s.id, status: "cancelled" },
                                    });
                                    toast.success("Sponsor cancelled.");
                                    loadSponsors();
                                  } catch (err: any) {
                                    toast.error(err.message);
                                  }
                                }}
                                className="text-xs text-red-500 hover:underline px-2"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
