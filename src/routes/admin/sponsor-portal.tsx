import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Building2, Search, CheckCircle2, AlertCircle, Eye, Loader2, RefreshCw, CalendarDays } from "lucide-react";
import { fetchEventSponsors } from "../../lib/actions/sponsors";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sponsor-portal")({
  component: SponsorPortalPage,
});

interface EventSponsor {
  id: string;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  packageName: string;
  packagePrice: number;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  paymentRef: string;
  paymentStatus: string;
  paidAt: string;
  status: string;
}

function SponsorPortalPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"directory" | "requests">("directory");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sponsors, setSponsors] = useState<EventSponsor[]>([]);

  const loadSponsors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEventSponsors({ data: {} });
      setSponsors(data as EventSponsor[]);
    } catch (err: any) {
      setError(err.message || "Failed to load sponsor data.");
      toast.error("Failed to load sponsor data from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSponsors();
  }, [loadSponsors]);

  const filteredSponsors = sponsors.filter(
    (s) =>
      !search ||
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.packageName.toLowerCase().includes(search.toLowerCase()) ||
      s.eventTitle.toLowerCase().includes(search.toLowerCase()),
  );

  const paidSponsors = sponsors.filter(s => s.paymentStatus === "paid");
  const totalPaidValue = paidSponsors.reduce((sum, s) => sum + Number(s.packagePrice), 0);

  const formatNaira = (val: number) => {
    if (val >= 1_000_000) return `₦${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `₦${(val / 1_000).toFixed(0)}K`;
    return `₦${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Sponsor Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage event sponsorships and track payments.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadSponsors}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white border border-border text-dark rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Sponsors</p>
          {loading ? (
            <div className="w-12 h-7 bg-muted animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="text-2xl font-bold text-dark mt-2">{sponsors.length}</p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Paid Sponsors</p>
          {loading ? (
            <div className="w-12 h-7 bg-muted animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="text-2xl font-bold text-green-600 mt-2">{paidSponsors.length}</p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Value</p>
          {loading ? (
            <div className="w-20 h-7 bg-muted animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="text-2xl font-bold text-primary mt-2">{formatNaira(totalPaidValue)}</p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending</p>
          {loading ? (
            <div className="w-12 h-7 bg-muted animate-pulse rounded-lg mt-2" />
          ) : (
            <p className="text-2xl font-bold text-amber-600 mt-2">{sponsors.filter(s => s.paymentStatus === "pending").length}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === "directory" ? "bg-white shadow text-dark" : "text-muted-foreground hover:text-dark"
          }`}
        >
          Sponsor Packages
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "requests" ? "bg-white shadow text-dark" : "text-muted-foreground hover:text-dark"
          }`}
        >
          New Requests{" "}
          <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">0</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {activeTab === "directory" && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sponsor packages…"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-muted/30"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-muted-foreground" />
            </div>
          ) : filteredSponsors.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Building2 size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium text-dark">No sponsor packages found</p>
              <p className="text-sm mt-1">
                {search
                  ? "No results match your search."
                  : "Add sponsor packages to events via the Events manager to see them here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Package</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSponsors.map((sponsor) => (
                    <tr key={sponsor.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-dark">{sponsor.packageName}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-dark font-medium line-clamp-1">{sponsor.eventTitle}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-dark">{formatNaira(sponsor.packagePrice)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                            sponsor.status === "Active"
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {sponsor.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={`/admin/events`}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-dark transition-colors"
                          title="View event"
                        >
                          <Eye size={16} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "requests" && (
        <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground">
          <Building2 size={40} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-semibold text-dark">Sponsorship Inquiries</p>
          <p className="text-sm mt-1 max-w-sm mx-auto">
            Public sponsorship requests from event pages will appear here. Enable sponsorship on an event to start receiving applications.
          </p>
        </div>
      )}
    </div>
  );
}
