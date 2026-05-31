import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, Phone, Mail, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { fetchBookings, updateBookingStatus } from "../../../lib/actions/bookings";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/bookings/")({
  component: AdminBookingsPage,
});

type BookingStatus = "new" | "reviewed" | "confirmed" | "completed" | "cancelled";

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  package: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  status: BookingStatus;
  submittedAt: string;
  adminNotes?: string;
  totalValue: number;
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  reviewed: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const ALL_STATUSES: BookingStatus[] = ["new", "reviewed", "confirmed", "completed", "cancelled"];

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
}

function BookingRow({
  booking,
  onSaved,
}: {
  booking: Booking;
  onSaved: (updated: Booking) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [notes, setNotes] = useState(booking.adminNotes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaving(true);
    try {
      const updated = await updateBookingStatus({
        data: { id: booking.id, status, adminNotes: notes },
      });
      onSaved(updated as Booking);
      toast.success("Booking updated successfully.");
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <tr className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <td className="px-5 py-4">
          <p className="font-semibold text-dark">{booking.name}</p>
          <p className="text-xs text-muted-foreground">{booking.email}</p>
        </td>
        <td className="px-5 py-4 text-sm text-dark">{booking.service}</td>
        <td className="px-5 py-4 text-sm text-muted-foreground">
          {new Date(booking.preferredDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </td>
        <td className="px-5 py-4 text-sm font-medium text-dark">₦{booking.totalValue.toLocaleString()}</td>
        <td className="px-5 py-4">
          <StatusBadge status={status} />
        </td>
        <td className="px-5 py-4 text-right text-muted-foreground">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-muted/30">
          <td colSpan={6} className="px-5 py-5">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Booking details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-dark text-sm">Booking Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Phone", booking.phone],
                    ["Service", booking.service],
                    ["Package", booking.package],
                    [
                      "Preferred Date",
                      new Date(booking.preferredDate).toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }),
                    ],
                    ["Preferred Time", booking.preferredTime],
                    [
                      "Submitted",
                      new Date(booking.submittedAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    ],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className="font-medium text-dark mt-0.5">{val}</p>
                    </div>
                  ))}
                </div>
                {booking.message && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Client Message</p>
                    <p className="text-sm text-dark mt-1 bg-white rounded-xl p-3 border border-border leading-relaxed">
                      {booking.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Admin actions */}
              <div className="space-y-4">
                <h4 className="font-semibold text-dark text-sm">Admin Actions</h4>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
                    Update Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatus(s);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize transition-all ${
                          status === s
                            ? "bg-dark text-white border-dark"
                            : "border-border hover:border-dark text-muted-foreground hover:text-dark"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => {
                      e.stopPropagation();
                      setNotes(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    rows={3}
                    placeholder="Add internal notes about this booking…"
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${booking.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-xs bg-white border border-border rounded-xl px-3 py-2 hover:border-primary hover:text-primary transition-colors font-medium"
                  >
                    <Mail size={12} /> Email Client
                  </a>
                  <a
                    href={`tel:${booking.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-xs bg-white border border-border rounded-xl px-3 py-2 hover:border-primary hover:text-primary transition-colors font-medium"
                  >
                    <Phone size={12} /> Call Client
                  </a>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 text-xs bg-primary text-white rounded-xl px-3 py-2 hover:bg-primary-hover transition-colors font-medium ml-auto disabled:opacity-60 cursor-pointer"
                  >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : null}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBookings({ data: { status: statusFilter, search } });
      setBookings(data as Booking[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timeout = setTimeout(() => loadBookings(), search ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [loadBookings, search]);

  const handleBookingUpdated = (updated: Booking) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const newCount = bookings.filter((b) => b.status === "new").length;
  const countsByStatus = ALL_STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: bookings.filter((b) => b.status === s).length }),
    {} as Record<BookingStatus, number>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Book a Shoot</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? "Loading…" : `${bookings.length} total requests`}
            {!loading && newCount > 0 && (
              <span className="ml-2 bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-semibold px-2 py-0.5 rounded-full">
                {newCount} new
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => loadBookings()}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-white border border-border text-dark rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            statusFilter === "all"
              ? "bg-dark text-white border-dark"
              : "bg-white border-border hover:border-dark text-muted-foreground hover:text-dark"
          }`}
        >
          All
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
              statusFilter === s
                ? "bg-dark text-white border-dark"
                : "bg-white border-border hover:border-dark text-muted-foreground hover:text-dark"
            }`}
          >
            {s} {!loading && statusFilter !== s ? `(${countsByStatus[s]})` : ""}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or service…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Client", "Service", "Preferred Date", "Value", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                    <Loader2 size={24} className="animate-spin mx-auto mb-3 text-primary" />
                    <p className="text-sm">Loading bookings from Supabase…</p>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                    {search || statusFilter !== "all"
                      ? "No bookings match your filters."
                      : "No bookings yet. They'll appear here when clients submit the booking form."}
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <BookingRow key={b.id} booking={b} onSaved={handleBookingUpdated} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
