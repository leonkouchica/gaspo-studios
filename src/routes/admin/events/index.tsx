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
  Megaphone,
  BarChart2,
  X,
  TriangleAlert,
  Clock,
  CheckCheck,
  FlaskConical,
} from "lucide-react";
import {
  fetchEvents,
  deleteEvent,
  fetchEventRegistrations,
  checkInAttendee,
  enableSponsorshipForAllEvents,
  resendConfirmationEmail,
  fetchEventCampaigns,
  createEventCampaign,
  sendEventCampaign,
  sendTestCampaignEmail,
  fetchCampaignReport,
  deleteEventCampaign,
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
  const [activeTab, setActiveTab] = useState<"events" | "registrations" | "sponsors" | "campaign">("events");

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
        {(["events", "registrations", "sponsors", "campaign"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize flex items-center gap-1.5 ${
              activeTab === tab ? "bg-white shadow text-dark" : "text-muted-foreground hover:text-dark"
            }`}
          >
            {tab === "campaign" && <Megaphone size={13} />}
            {tab === "campaign" ? "Event Campaign" : tab}
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

      {/* ── EVENT CAMPAIGN TAB ── */}
      {activeTab === "campaign" && (
        <EventCampaignTab allEvents={eventsList} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EventCampaignTab — full campaign management UI
// ─────────────────────────────────────────────────────────────────────────────

type TemplateType =
  | "registration_confirmation"
  | "pre_event_appreciation"
  | "post_event_thank_you"
  | "new_registration_notification"
  | "custom";

interface Campaign {
  id: string;
  eventId: string;
  name: string;
  templateType: TemplateType;
  subject: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  totalRecipients: number;
  successCount: number;
  failCount: number;
  createdAt: string;
}

interface CampaignRecipient {
  id: string;
  registrationId: string;
  email: string;
  fullName: string;
  status: string;
  sentAt: string | null;
  errorMessage: string | null;
}

interface CampaignReport extends Campaign {
  recipients: CampaignRecipient[];
}

const TEMPLATE_META: Record<
  TemplateType,
  { label: string; icon: string; trigger: string; description: string }
> = {
  registration_confirmation: {
    label: "Registration Confirmation",
    icon: "✅",
    trigger: "Immediately after registration",
    description: "Confirms registration with event details and attendee ID.",
  },
  new_registration_notification: {
    label: "New Registration Notification",
    icon: "🔔",
    trigger: "Any time",
    description: "General notification to all current registrants.",
  },
  pre_event_appreciation: {
    label: "Pre-Event Appreciation",
    icon: "📅",
    trigger: "3 days before event",
    description: "What to expect, schedule, venue, and important notes.",
  },
  post_event_thank_you: {
    label: "Post-Event Thank You",
    icon: "🎉",
    trigger: "After event completion",
    description: "Thank you, highlights, gallery photos, and feedback CTA.",
  },
  custom: {
    label: "Custom Campaign",
    icon: "✏️",
    trigger: "Any time",
    description: "Write your own message to selected registrants.",
  },
};

const CAMPAIGN_STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  queued: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  sending: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  sent: "bg-green-500/10 text-green-600 border-green-500/20",
  partially_sent: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const DEFAULT_SUBJECTS: Record<TemplateType, string> = {
  registration_confirmation: "Your registration is confirmed!",
  new_registration_notification: "You're registered — here's what to know",
  pre_event_appreciation: "We can't wait to see you — event details inside",
  post_event_thank_you: "Thank you for joining us!",
  custom: "",
};

function EventCampaignTab({ allEvents }: { allEvents: Event[] }) {
  // ── Event selection ──
  const [selectedEventId, setSelectedEventId] = useState("");
  const [eventSearch, setEventSearch] = useState("");

  // ── Registrations / audience ──
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [selectedRegIds, setSelectedRegIds] = useState<Set<string>>(new Set());
  const [audienceSearch, setAudienceSearch] = useState("");

  // ── Template & campaign builder ──
  const [templateType, setTemplateType] = useState<TemplateType | "">("");
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [customBodyHtml, setCustomBodyHtml] = useState("");

  // ── Send/schedule ──
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [testEmail, setTestEmail] = useState("");

  // ── Loading states ──
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  // ── Campaigns history ──
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  // ── Report modal ──
  const [reportCampaign, setReportCampaign] = useState<CampaignReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const selectedEvent = allEvents.find((e) => e.id === selectedEventId) || null;

  // Filtered events for the dropdown search
  const filteredEvents = allEvents.filter((e) =>
    !eventSearch || e.title.toLowerCase().includes(eventSearch.toLowerCase()),
  );

  // Load registrations when event changes
  const loadRegistrations = useCallback(async (eventId: string) => {
    setLoadingRegs(true);
    setRegistrations([]);
    setSelectedRegIds(new Set());
    setAudienceSearch("");
    try {
      const data = await fetchEventRegistrations({ data: { eventId } });
      setRegistrations(data as Registration[]);
    } catch (err: any) {
      toast.error(`Failed to load registrations: ${err.message}`);
    } finally {
      setLoadingRegs(false);
    }
  }, []);

  // Load campaigns history when event changes
  const loadCampaigns = useCallback(async (eventId: string) => {
    setLoadingCampaigns(true);
    try {
      const data = await fetchEventCampaigns({ data: { eventId } });
      setCampaigns(data as Campaign[]);
    } catch (err: any) {
      toast.error(`Failed to load campaigns: ${err.message}`);
    } finally {
      setLoadingCampaigns(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadRegistrations(selectedEventId);
      loadCampaigns(selectedEventId);
    }
  }, [selectedEventId, loadRegistrations, loadCampaigns]);

  // Auto-fill name + subject when template changes
  useEffect(() => {
    if (templateType && selectedEvent) {
      setCampaignName(`${TEMPLATE_META[templateType].label} — ${selectedEvent.title}`);
      setSubject(DEFAULT_SUBJECTS[templateType]);
    }
  }, [templateType, selectedEvent]);

  // ── Audience helpers ──
  const eligibleRegs = registrations.filter((r) => r.email && r.email.includes("@"));
  const ineligibleRegs = registrations.filter((r) => !r.email || !r.email.includes("@"));
  const filteredRegs = registrations.filter((r) => {
    if (!audienceSearch) return true;
    const q = audienceSearch.toLowerCase();
    return r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
  });

  const allEligibleSelected = eligibleRegs.length > 0 &&
    eligibleRegs.every((r) => selectedRegIds.has(r.id));
  const someSelected = selectedRegIds.size > 0;
  const partialSelection = someSelected && selectedRegIds.size < eligibleRegs.length;

  const toggleReg = (id: string) => {
    setSelectedRegIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedRegIds(new Set(eligibleRegs.map((r) => r.id)));
  const selectNone = () => setSelectedRegIds(new Set());

  // ── Save draft ──
  const handleSaveDraft = async () => {
    if (!selectedEventId || !templateType || !subject || !campaignName) {
      toast.error("Please fill in campaign name, template, and subject.");
      return;
    }
    setSaving(true);
    try {
      await createEventCampaign({
        data: {
          eventId: selectedEventId,
          name: campaignName,
          templateType: templateType as TemplateType,
          subject,
          customBodyHtml: customBodyHtml || undefined,
        },
      });
      toast.success("Campaign saved as draft.");
      loadCampaigns(selectedEventId);
    } catch (err: any) {
      toast.error(`Failed to save draft: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Send test ──
  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error("Enter a test email address.");
      return;
    }
    if (!templateType || !selectedEventId) {
      toast.error("Select an event and template first.");
      return;
    }
    setSendingTest(true);
    try {
      await sendTestCampaignEmail({
        data: {
          toEmail: testEmail,
          eventId: selectedEventId,
          templateType: templateType as TemplateType,
          subject: subject || DEFAULT_SUBJECTS[templateType],
          customBodyHtml: customBodyHtml || undefined,
        },
      });
      toast.success(`Test email sent to ${testEmail}.`);
    } catch (err: any) {
      toast.error(`Test send failed: ${err.message}`);
    } finally {
      setSendingTest(false);
    }
  };

  // ── Send/schedule campaign ──
  const handleSend = async () => {
    if (!selectedEventId || !templateType || !subject || !campaignName) {
      toast.error("Complete all required fields before sending.");
      return;
    }
    if (selectedRegIds.size === 0) {
      toast.error("Select at least one recipient.");
      return;
    }

    if (
      !confirm(
        `Send "${campaignName}" to ${selectedRegIds.size} selected recipient${selectedRegIds.size === 1 ? "" : "s"}?`,
      )
    )
      return;

    setSending(true);
    try {
      // Create draft first, then send
      const draft = await createEventCampaign({
        data: {
          eventId: selectedEventId,
          name: campaignName,
          templateType: templateType as TemplateType,
          subject,
          customBodyHtml: customBodyHtml || undefined,
        },
      });

      const scheduledAt =
        scheduleMode === "later" && scheduledDate && scheduledTime
          ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
          : undefined;

      const result = await sendEventCampaign({
        data: {
          campaignId: (draft as any).id,
          eventId: selectedEventId,
          selectedRegistrationIds: Array.from(selectedRegIds),
          scheduledAt,
        },
      });

      if ((result as any).scheduled) {
        toast.success(`Campaign scheduled for ${new Date((result as any).scheduledAt).toLocaleString()}.`);
      } else {
        const { successCount, failCount } = result as any;
        toast.success(
          `Campaign sent: ${successCount} delivered${failCount > 0 ? `, ${failCount} failed` : ""}.`,
        );
      }
      loadCampaigns(selectedEventId);
    } catch (err: any) {
      toast.error(`Send failed: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  // ── View report ──
  const handleViewReport = async (campaignId: string) => {
    setShowReport(true);
    setLoadingReport(true);
    try {
      const data = await fetchCampaignReport({ data: { campaignId } });
      setReportCampaign(data as CampaignReport);
    } catch (err: any) {
      toast.error(`Failed to load report: ${err.message}`);
      setShowReport(false);
    } finally {
      setLoadingReport(false);
    }
  };

  // ── Cancel campaign ──
  const handleCancelCampaign = async (campaignId: string, name: string) => {
    if (!confirm(`Cancel campaign "${name}"?`)) return;
    try {
      await deleteEventCampaign({ data: { campaignId } });
      toast.success("Campaign cancelled.");
      loadCampaigns(selectedEventId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Section Header ── */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <Megaphone size={18} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-dark">Event Campaign</h2>
          <p className="text-sm text-muted-foreground">Send targeted email campaigns to event registrants</p>
        </div>
      </div>

      {/* ── Step 1: Event Selector ── */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">1</span>
          <h3 className="font-semibold text-dark">Select Event</h3>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={eventSearch}
            onChange={(e) => setEventSearch(e.target.value)}
            placeholder="Search events…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
          {filteredEvents.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedEventId(e.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedEventId === e.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-white hover:border-primary/40 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-dark text-sm leading-snug line-clamp-2">{e.title}</p>
                <span
                  className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${
                    STATUS_COLORS[e.status] ?? "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {e.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {new Date(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Users size={11} /> {e.registrationCount} registrants
              </p>
            </button>
          ))}
          {filteredEvents.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full py-4 text-center">No events found.</p>
          )}
        </div>

        {/* Selected event summary */}
        {selectedEvent && (
          <div className="mt-3 p-4 bg-primary/5 border border-primary/20 rounded-xl flex flex-wrap gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Event</p>
              <p className="font-semibold text-dark">{selectedEvent.title}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium text-dark">{new Date(selectedEvent.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Venue</p>
              <p className="font-medium text-dark">{selectedEvent.venue}, {selectedEvent.city}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Registrants</p>
              <p className="font-medium text-dark">{selectedEvent.registrationCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[selectedEvent.status] ?? "bg-muted text-muted-foreground border-border"}`}>
                {selectedEvent.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {selectedEvent && (
        <>
          {/* ── Step 2: Audience & Recipient Selection ── */}
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">2</span>
                <h3 className="font-semibold text-dark">Audience &amp; Recipients</h3>
              </div>
              {loadingRegs && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
            </div>

            {/* Summary chips */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5 text-sm">
                <Users size={14} className="text-muted-foreground" />
                <span className="text-dark font-medium">{registrations.length}</span>
                <span className="text-muted-foreground">Total Registered</span>
              </div>
              <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5 text-sm">
                <CheckCheck size={14} className="text-green-600" />
                <span className="text-green-700 font-medium">{eligibleRegs.length}</span>
                <span className="text-green-700">Eligible</span>
              </div>
              {ineligibleRegs.length > 0 && (
                <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 text-sm">
                  <TriangleAlert size={14} className="text-red-600" />
                  <span className="text-red-700 font-medium">{ineligibleRegs.length}</span>
                  <span className="text-red-700">Missing/Invalid Email</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 text-sm">
                <CheckCircle2 size={14} className="text-primary" />
                <span className="text-primary font-medium">{selectedRegIds.size}</span>
                <span className="text-primary">Selected</span>
              </div>
            </div>

            {/* Quick-select buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={selectAll}
                className="text-xs px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/5 transition-colors font-medium"
              >
                Select All Eligible ({eligibleRegs.length})
              </button>
              <button
                onClick={selectNone}
                disabled={selectedRegIds.size === 0}
                className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-dark hover:border-dark/30 transition-colors font-medium disabled:opacity-40"
              >
                Select None
              </button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={audienceSearch}
                onChange={(e) => setAudienceSearch(e.target.value)}
                placeholder="Filter by name or email…"
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white"
              />
            </div>

            {/* Recipient table */}
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60 border-b border-border">
                    <th className="px-4 py-2.5 text-left w-10">
                      <input
                        type="checkbox"
                        checked={allEligibleSelected}
                        onChange={(e) => (e.target.checked ? selectAll() : selectNone())}
                        className="rounded"
                        title="Select all eligible"
                      />
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Registered</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingRegs ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        <Loader2 size={20} className="animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredRegs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground text-sm">
                        No registrants found.
                      </td>
                    </tr>
                  ) : (
                    filteredRegs.map((reg) => {
                      const isEligible = reg.email && reg.email.includes("@");
                      const isChecked = selectedRegIds.has(reg.id);
                      return (
                        <tr
                          key={reg.id}
                          onClick={() => isEligible && toggleReg(reg.id)}
                          className={`transition-colors ${
                            isEligible
                              ? "hover:bg-muted/40 cursor-pointer"
                              : "opacity-40 cursor-not-allowed"
                          } ${isChecked ? "bg-primary/5" : ""}`}
                        >
                          <td className="px-4 py-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={!isEligible}
                              onChange={() => isEligible && toggleReg(reg.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-2.5 font-medium text-dark">{reg.fullName}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{reg.email || <span className="text-red-500 italic">No email</span>}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {new Date(reg.registeredAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-4 py-2.5">
                            {isEligible ? (
                              <span className="text-xs text-green-600 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">Eligible</span>
                            ) : (
                              <span className="text-xs text-red-600 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">Invalid email</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Selection summary footer */}
            <p className="text-xs text-muted-foreground">
              {registrations.length} registrants · <strong className="text-dark">{selectedRegIds.size} selected</strong> · {eligibleRegs.length - selectedRegIds.size < 0 ? 0 : eligibleRegs.length - selectedRegIds.size} not selected
            </p>
          </div>

          {/* ── Step 3: Template Picker ── */}
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">3</span>
              <h3 className="font-semibold text-dark">Select Template</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.entries(TEMPLATE_META) as [TemplateType, typeof TEMPLATE_META[TemplateType]][]).map(
                ([key, meta]) => {
                  const isPostEvent = key === "post_event_thank_you";
                  const disabled = isPostEvent && selectedEvent.status !== "completed";
                  return (
                    <button
                      key={key}
                      onClick={() => !disabled && setTemplateType(key)}
                      disabled={disabled}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        templateType === key
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : disabled
                            ? "border-border bg-muted/40 opacity-50 cursor-not-allowed"
                            : "border-border bg-white hover:border-primary/40 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{meta.icon}</span>
                        <span className="font-semibold text-dark text-sm">{meta.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{meta.description}</p>
                      <p className="text-xs text-primary/80 mt-2 font-medium">⏱ {meta.trigger}</p>
                      {disabled && (
                        <p className="text-xs text-orange-600 mt-1">Event must be completed</p>
                      )}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* ── Step 4: Campaign Builder ── */}
          {templateType && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">4</span>
                <h3 className="font-semibold text-dark">Campaign Builder</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-dark mb-1.5">Campaign Name</label>
                  <input
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g. Pre-Event Email — African Photo Week"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark mb-1.5">Email Subject</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject line…"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Custom body for custom/broadcast type */}
              {(templateType === "custom" || templateType === "new_registration_notification") && (
                <div>
                  <label className="block text-xs font-medium text-dark mb-1.5">Email Body (HTML)</label>
                  <textarea
                    value={customBodyHtml}
                    onChange={(e) => setCustomBodyHtml(e.target.value)}
                    placeholder="<p>Hi {{first_name}}, ...</p>"
                    rows={8}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-mono resize-y"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Available variables: <code className="bg-muted px-1 rounded">{"{{first_name}}"}</code>
                  </p>
                </div>
              )}

              {/* Template preview info */}
              {templateType !== "custom" && templateType !== "new_registration_notification" && (
                <div className="bg-muted/50 border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <AlertCircle size={13} className="text-primary shrink-0" />
                    The <strong className="text-dark">{TEMPLATE_META[templateType].label}</strong> template
                    is pre-designed with your event data auto-injected (event name, date, venue,
                    agenda, and recipient name). Use <strong>Send Test</strong> below to preview the exact email.
                  </p>
                </div>
              )}

              {/* Send test */}
              <div className="flex flex-wrap items-end gap-3 pt-1">
                <div className="flex-1 min-w-48">
                  <label className="block text-xs font-medium text-dark mb-1.5">
                    <FlaskConical size={12} className="inline mr-1" />
                    Send Test Email To
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  />
                </div>
                <button
                  onClick={handleSendTest}
                  disabled={sendingTest}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {sendingTest ? <Loader2 size={14} className="animate-spin" /> : <FlaskConical size={14} />}
                  Send Test
                </button>
              </div>

              {/* Save draft */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                  Save as Draft
                </button>
              </div>
            </div>
          )}

          {/* ── Step 5: Send / Schedule ── */}
          {templateType && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">5</span>
                <h3 className="font-semibold text-dark">Send / Schedule</h3>
              </div>

              {/* Partial selection warning */}
              {partialSelection && (
                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <TriangleAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    You have selected <strong>{selectedRegIds.size}</strong> of{" "}
                    <strong>{eligibleRegs.length}</strong> eligible recipients. Only selected
                    recipients will receive this campaign.
                  </p>
                </div>
              )}

              {/* Recipient count */}
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <Users size={18} className="text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-dark text-sm">
                    Sending to{" "}
                    <span className="text-primary">{selectedRegIds.size}</span>{" "}
                    of {eligibleRegs.length} eligible recipients
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Go to Step 2 to change your selection.
                  </p>
                </div>
              </div>

              {/* Send mode */}
              <div className="flex gap-3">
                <button
                  onClick={() => setScheduleMode("now")}
                  className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    scheduleMode === "now"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Send size={14} /> Send Now
                </button>
                <button
                  onClick={() => setScheduleMode("later")}
                  className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    scheduleMode === "later"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Clock size={14} /> Schedule
                </button>
              </div>

              {scheduleMode === "later" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1.5">Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1.5">Time</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Primary CTA */}
              <button
                onClick={handleSend}
                disabled={sending || selectedRegIds.size === 0 || !campaignName || !subject}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl py-3.5 text-sm font-semibold transition-all hover:scale-[1.01] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {sending ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending…</>
                ) : scheduleMode === "later" ? (
                  <><Clock size={16} /> Schedule Campaign</>
                ) : (
                  <><Send size={16} /> Send Campaign to {selectedRegIds.size} Recipient{selectedRegIds.size !== 1 ? "s" : ""}</>
                )}
              </button>

              {selectedRegIds.size === 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  ↑ Select recipients in Step 2 to enable sending
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Campaign History ── */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-primary" />
            <h3 className="font-semibold text-dark">Campaign History</h3>
            {selectedEvent && (
              <span className="text-xs text-muted-foreground">for {selectedEvent.title}</span>
            )}
          </div>
          {selectedEventId && (
            <button
              onClick={() => loadCampaigns(selectedEventId)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>

        {!selectedEventId ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Select an event above to view its campaign history.</p>
        ) : loadingCampaigns ? (
          <div className="py-6 text-center"><Loader2 size={20} className="animate-spin mx-auto text-muted-foreground" /></div>
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No campaigns yet for this event.</p>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 border-b border-border">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Campaign</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Template</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Recipients</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Sent At</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-dark">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{c.subject}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{TEMPLATE_META[c.templateType as TemplateType]?.icon} {TEMPLATE_META[c.templateType as TemplateType]?.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${CAMPAIGN_STATUS_STYLES[c.status] ?? "bg-muted text-muted-foreground border-border"}`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.totalRecipients > 0 ? (
                        <span>
                          <span className="text-green-600 font-medium">{c.successCount}</span>
                          {c.failCount > 0 && <span className="text-red-500"> / {c.failCount} failed</span>}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {c.sentAt
                        ? new Date(c.sentAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                        : c.scheduledAt
                          ? <span className="text-blue-600">Scheduled</span>
                          : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {["sent", "partially_sent", "failed"].includes(c.status) && (
                          <button
                            onClick={() => handleViewReport(c.id)}
                            className="text-xs text-primary hover:underline px-2 py-1 rounded hover:bg-primary/5"
                          >
                            <BarChart2 size={12} className="inline mr-1" />Report
                          </button>
                        )}
                        {["draft", "scheduled"].includes(c.status) && (
                          <button
                            onClick={() => handleCancelCampaign(c.id, c.name)}
                            className="text-xs text-red-500 hover:underline px-2 py-1 rounded hover:bg-red-500/5"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Campaign Report Modal ── */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-border w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div>
                <h3 className="font-bold text-dark text-lg">Campaign Report</h3>
                {reportCampaign && (
                  <p className="text-sm text-muted-foreground mt-0.5">{reportCampaign.name}</p>
                )}
              </div>
              <button
                onClick={() => setShowReport(false)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5">
              {loadingReport ? (
                <div className="py-12 text-center">
                  <Loader2 size={28} className="animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-3">Loading report…</p>
                </div>
              ) : reportCampaign ? (
                <>
                  {/* Summary stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Total Sent", value: reportCampaign.totalRecipients, color: "text-dark" },
                      { label: "Delivered", value: reportCampaign.successCount, color: "text-green-600" },
                      { label: "Failed", value: reportCampaign.failCount, color: "text-red-500" },
                      {
                        label: "Delivery Rate",
                        value: reportCampaign.totalRecipients > 0
                          ? `${Math.round((reportCampaign.successCount / reportCampaign.totalRecipients) * 100)}%`
                          : "—",
                        color: "text-primary",
                      },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-muted/50 rounded-xl p-4 text-center">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span><strong className="text-dark">Subject:</strong> {reportCampaign.subject}</span>
                    <span><strong className="text-dark">Template:</strong> {TEMPLATE_META[reportCampaign.templateType as TemplateType]?.label}</span>
                    <span><strong className="text-dark">Sent:</strong> {reportCampaign.sentAt ? new Date(reportCampaign.sentAt).toLocaleString() : "—"}</span>
                  </div>

                  {/* Per-recipient table */}
                  <div className="border border-border rounded-xl overflow-hidden">
                    <div className="bg-muted/60 px-4 py-2.5 border-b border-border">
                      <p className="text-xs font-medium text-muted-foreground">Recipients ({reportCampaign.recipients.length})</p>
                    </div>
                    <div className="overflow-x-auto max-h-72 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white border-b border-border">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Email</th>
                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Sent At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {reportCampaign.recipients.map((r) => (
                            <tr key={r.id} className="hover:bg-muted/20">
                              <td className="px-4 py-2.5 font-medium text-dark">{r.fullName}</td>
                              <td className="px-4 py-2.5 text-muted-foreground">{r.email}</td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${
                                    r.status === "sent"
                                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                                      : r.status === "failed"
                                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                                        : "bg-muted text-muted-foreground border-border"
                                  }`}
                                >
                                  {r.status}
                                </span>
                                {r.errorMessage && (
                                  <p className="text-xs text-red-500 mt-0.5">{r.errorMessage}</p>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                                {r.sentAt ? new Date(r.sentAt).toLocaleString() : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
