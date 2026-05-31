import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { QrCode, Search, CheckCircle2, XCircle, ChevronLeft, UserCheck } from "lucide-react";
import { events } from "../../../../data/events";

export const Route = createFileRoute("/admin/events/$eventId/check-in")({
  loader: ({ params }) => {
    const event = events.find(e => e.id === params.eventId);
    if (!event) throw notFound();
    return event;
  },
  component: CheckInPage,
});

// Mock Attendees Data for Check-in
const MOCK_ATTENDEES = [
  { id: "A-1029", name: "Jane Doe", email: "jane@example.com", status: "registered" },
  { id: "A-1030", name: "John Smith", email: "john@example.com", status: "checked-in" },
  { id: "A-1031", name: "Alice Johnson", email: "alice@example.com", status: "registered" },
  { id: "A-1032", name: "Bob Williams", email: "bob@example.com", status: "registered" },
];

function CheckInPage() {
  const event = Route.useLoaderData();
  const [attendees, setAttendees] = useState(MOCK_ATTENDEES);
  const [search, setSearch] = useState("");
  const [scanMode, setScanMode] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCheckIn = (id: string) => {
    setAttendees(prev => prev.map(a => 
      a.id === id ? { ...a, status: "checked-in" } : a
    ));
    setScanResult({ success: true, message: `Successfully checked in ticket ${id}!` });
    setTimeout(() => setScanResult(null), 3000);
  };

  const handleManualScan = () => {
    const found = attendees.find(a => a.id.toLowerCase() === search.toLowerCase());
    if (found) {
      if (found.status === "checked-in") {
        setScanResult({ success: false, message: `${found.name} is already checked in!` });
      } else {
        handleCheckIn(found.id);
        setSearch("");
      }
    } else {
      setScanResult({ success: false, message: "Ticket ID not found." });
    }
    setTimeout(() => setScanResult(null), 3000);
  };

  const checkedInCount = attendees.filter(a => a.status === "checked-in").length;
  const totalCount = attendees.length;
  const progress = (checkedInCount / totalCount) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/events"
          className="w-9 h-9 rounded-xl border border-border bg-white hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-dark transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-dark">Event Check-in</h1>
          <p className="text-muted-foreground text-sm mt-0.5 truncate max-w-xs">{event.title}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Scanner Panel */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-dark text-white rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
              <QrCode size={32} />
            </div>
            <h3 className="font-bold text-lg mb-1">Scan Ticket QR</h3>
            <p className="text-xs text-white/60 mb-6">Use your device camera to scan attendee tickets.</p>
            
            {scanMode ? (
              <div className="aspect-square bg-black rounded-xl overflow-hidden relative flex items-center justify-center">
                <p className="text-xs text-white/50 absolute z-10">Camera Simulator Active</p>
                <div className="absolute inset-10 border-2 border-primary/50 border-dashed rounded-lg animate-pulse" />
                <button 
                  onClick={() => setScanMode(false)}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
                >
                  Stop Scanner
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setScanMode(true)}
                className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-3 text-sm font-semibold transition-all"
              >
                Launch Scanner
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-dark text-sm mb-3">Manual Entry</h3>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Enter Ticket ID (e.g. A-1029)"
                className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none uppercase"
                onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
              />
              <button 
                onClick={handleManualScan}
                className="bg-dark hover:bg-dark/80 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
              >
                Check
              </button>
            </div>
            
            {scanResult && (
              <div className={`mt-4 p-3 rounded-xl flex items-start gap-2 text-sm ${scanResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {scanResult.success ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />}
                {scanResult.message}
              </div>
            )}
          </div>
        </div>

        {/* List Panel */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-dark">Attendee List</h3>
              <p className="text-xs text-muted-foreground mt-1">Live check-in status.</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-dark">{checkedInCount} / {totalCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Checked In</p>
            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-2 mb-6 overflow-hidden">
            <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Filter by name..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border focus:border-primary outline-none text-sm bg-muted/30"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {attendees.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                  <div>
                    <p className="font-semibold text-dark text-sm">{a.name} <span className="text-xs text-muted-foreground font-normal ml-2">{a.id}</span></p>
                    <p className="text-xs text-muted-foreground">{a.email}</p>
                  </div>
                  {a.status === "checked-in" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                      <CheckCircle2 size={12} /> Checked In
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleCheckIn(a.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-dark bg-muted hover:bg-dark hover:text-white px-3 py-1.5 rounded-md transition-colors"
                    >
                      <UserCheck size={14} /> Check In
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
