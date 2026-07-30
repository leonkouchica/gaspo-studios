import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import {
  fetchEvent,
  fetchEventRegistrations,
  checkInAttendee,
} from "../../../../lib/actions/events";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/events/$eventId/check-in")({
  loader: async ({ params }) => {
    try {
      const [event, registrations] = await Promise.all([
        fetchEvent({ data: { id: params.eventId } }),
        fetchEventRegistrations({ data: { eventId: params.eventId } }),
      ]);
      return { event, registrations };
    } catch (err) {
      throw notFound();
    }
  },
  component: CheckInPage,
  notFoundComponent: () => (
    <div className="text-center py-20 bg-muted/20 min-h-screen flex flex-col items-center justify-center">
      <p className="text-muted-foreground font-semibold text-lg">
        Event or registrations not found.
      </p>
      <Link
        to="/admin/events"
        className="text-primary mt-4 inline-block hover:underline font-medium"
      >
        ← Back to Events
      </Link>
    </div>
  ),
});

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

function CheckInPage() {
  const { event, registrations: initialRegs } = Route.useLoaderData();
  const [attendees, setAttendees] = useState<Registration[]>((initialRegs as Registration[]) || []);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterText, setFilterText] = useState("");
  const [scanMode, setScanMode] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadLatestAttendees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEventRegistrations({ data: { eventId: event.id } });
      setAttendees(data as Registration[]);
      toast.success("Attendee list refreshed.");
    } catch (err: any) {
      toast.error(`Failed to refresh list: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  const handleCheckIn = async (regId: string) => {
    try {
      const updated = await checkInAttendee({
        data: { registrationId: regId, checkedIn: true },
      });
      setAttendees((prev) => prev.map((a) => (a.id === regId ? (updated as Registration) : a)));
      setScanResult({ success: true, message: `Successfully checked in ${updated.fullName}!` });
      toast.success(`Checked in ${updated.fullName}`);
    } catch (err: any) {
      setScanResult({ success: false, message: `Check-in failed: ${err.message}` });
      toast.error(`Check-in failed: ${err.message}`);
    }
    setTimeout(() => setScanResult(null), 4000);
  };

  const handleManualScan = () => {
    if (!search.trim()) return toast.error("Please enter a ticket ID.");
    // Look up attendee by ID or QR code
    const found = attendees.find(
      (a) =>
        a.id.toLowerCase() === search.toLowerCase() ||
        (a.qrCode && a.qrCode.toLowerCase() === search.toLowerCase()),
    );

    if (found) {
      if (found.checkedIn) {
        setScanResult({ success: false, message: `${found.fullName} is already checked in!` });
      } else {
        handleCheckIn(found.id);
        setSearch("");
      }
    } else {
      setScanResult({ success: false, message: `Ticket ID "${search}" not found.` });
    }
    setTimeout(() => setScanResult(null), 4000);
  };

  // Simulate scanning a random unchecked-in attendee for demonstration
  const handleSimulateScan = () => {
    const unchecked = attendees.filter((a) => !a.checkedIn);
    if (unchecked.length === 0) {
      setScanResult({ success: false, message: "No unchecked attendees left to scan!" });
      setTimeout(() => setScanResult(null), 3000);
      return;
    }
    const randomAttendee = unchecked[Math.floor(Math.random() * unchecked.length)];
    // Fill search with the ID and run manual check
    setSearch(randomAttendee.id);
    toast.info(`Simulated scanning ticket ${randomAttendee.id}`);
  };

  const checkedInCount = attendees.filter((a) => a.checkedIn).length;
  const totalCount = attendees.length;
  const progress = totalCount > 0 ? (checkedInCount / totalCount) * 100 : 0;

  const filteredAttendees = attendees.filter((a) => {
    if (!filterText) return true;
    const lower = filterText.toLowerCase();
    return (
      a.fullName.toLowerCase().includes(lower) ||
      a.email.toLowerCase().includes(lower) ||
      a.id.toLowerCase().includes(lower)
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/events"
            className="w-9 h-9 rounded-xl border border-border bg-white hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-dark transition-colors"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark">Event Check-in</h1>
            <p className="text-muted-foreground text-sm mt-0.5 max-w-sm truncate">{event.title}</p>
          </div>
        </div>
        <button
          onClick={loadLatestAttendees}
          disabled={loading}
          className="p-2.5 rounded-xl border border-border bg-white hover:bg-muted text-muted-foreground hover:text-dark transition-colors disabled:opacity-50"
          title="Refresh list"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Scanner Panel */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-dark text-white rounded-2xl p-6 text-center shadow-lg border border-border/10">
            <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
              <QrCode size={32} />
            </div>
            <h3 className="font-bold text-lg mb-1">Scan Ticket QR</h3>
            <p className="text-xs text-white/60 mb-6">
              Use your device camera or simulate a ticket scan.
            </p>

            {scanMode ? (
              <div className="aspect-square bg-black rounded-xl overflow-hidden relative flex flex-col items-center justify-center p-4 border border-white/10">
                <p className="text-xs text-white/50 absolute top-4">Camera Simulator Active</p>
                <div className="w-28 h-28 border-2 border-primary/50 border-dashed rounded-lg animate-pulse flex items-center justify-center">
                  <QrCode size={40} className="text-white/20" />
                </div>
                <div className="absolute bottom-4 flex flex-col gap-2 w-full px-4">
                  <button
                    onClick={handleSimulateScan}
                    className="text-xs bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-xl transition-colors font-semibold"
                  >
                    Simulate Scanned QR
                  </button>
                  <button
                    onClick={() => setScanMode(false)}
                    className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Stop Scanner
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setScanMode(true)}
                className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-3 text-sm font-semibold transition-all hover:scale-105"
              >
                Launch Scanner
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="font-semibold text-dark text-sm mb-3">Manual Entry</h3>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ticket ID or QR Code"
                className="w-full rounded-xl border border-border px-3 py-2.5 text-xs focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none uppercase font-mono"
                onKeyDown={(e) => e.key === "Enter" && handleManualScan()}
              />
              <button
                onClick={handleManualScan}
                className="bg-dark hover:bg-dark/80 text-white rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0"
              >
                Check
              </button>
            </div>

            {scanResult && (
              <div
                className={`mt-4 p-3 rounded-xl flex items-start gap-2 text-xs ${scanResult.success ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
              >
                {scanResult.success ? (
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                ) : (
                  <XCircle size={16} className="mt-0.5 shrink-0" />
                )}
                <p className="leading-relaxed">{scanResult.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* List Panel */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-border p-6 flex flex-col min-h-[450px] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-dark">Attendee List</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage attendee check-in and search registries.
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-dark">
                {checkedInCount} / {totalCount}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Checked In
              </p>
            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-2 mb-5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="relative mb-4">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter by attendee name, email or ID…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border focus:border-primary outline-none text-xs bg-muted/20"
            />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px] space-y-2 pr-1">
            {filteredAttendees.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-xs">No matching attendees found.</p>
              </div>
            ) : (
              filteredAttendees.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border hover:border-muted-foreground/30 transition-all bg-muted/5"
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-dark text-xs truncate">{a.fullName}</span>
                      <span className="text-[9px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded font-mono uppercase">
                        {a.id.substring(0, 8)}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{a.email}</p>
                    {a.company && (
                      <p className="text-[10px] text-dark truncate mt-0.5 font-medium">
                        {a.jobTitle ? `${a.jobTitle} @ ` : ""}
                        {a.company}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 ml-2">
                    {a.checkedIn ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
                        <CheckCircle2 size={11} /> Checked In
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(a.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-dark bg-white border border-border hover:bg-dark hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <UserCheck size={13} /> Check In
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
