import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Search, Upload, Eye, CheckCircle2, AlertCircle, FileText, Download } from "lucide-react";
import { events } from "../../data/events";

export const Route = createFileRoute("/admin/sponsor-portal")({
  component: SponsorPortalPage,
});

// Mock Sponsors Data
const sponsorsData = [
  {
    id: "sp-1",
    name: "TechNova Corp",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop&q=80",
    eventSlug: "future-of-ai-networking-2026",
    package: "Gold Sponsor",
    amount: "₦6,000,000",
    status: "Active",
    materialsUploaded: true,
    views: 12450,
    clicks: 840,
  },
  {
    id: "sp-2",
    name: "CreativeFlow Agency",
    logo: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100&h=100&fit=crop&q=80",
    eventSlug: "portrait-lighting-masterclass",
    package: "Silver Sponsor",
    amount: "₦4,000,000",
    status: "Pending Materials",
    materialsUploaded: false,
    views: 0,
    clicks: 0,
  },
  {
    id: "sp-3",
    name: "Lagos Tech Hub",
    logo: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=100&h=100&fit=crop&q=80",
    eventSlug: "future-of-ai-networking-2026",
    package: "Official Partner",
    amount: "₦2,500,000",
    status: "Active",
    materialsUploaded: true,
    views: 8900,
    clicks: 420,
  }
];

function SponsorPortalPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"directory" | "requests">("directory");

  const filteredSponsors = sponsorsData.filter(s => 
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.package.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Sponsor Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage event sponsorships, materials, and performance metrics.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105">
          <Building2 size={16} /> Add Sponsor
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Sponsors</p>
          <p className="text-2xl font-bold text-dark mt-2">18</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Deals</p>
          <p className="text-2xl font-bold text-green-600 mt-2">₦24.5M</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Materials</p>
          <p className="text-2xl font-bold text-amber-600 mt-2">3</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Reach</p>
          <p className="text-2xl font-bold text-dark mt-2">45K+</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "directory" ? "bg-white shadow text-dark" : "text-muted-foreground hover:text-dark"}`}
        >
          Sponsor Directory
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "requests" ? "bg-white shadow text-dark" : "text-muted-foreground hover:text-dark"}`}
        >
          New Requests <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
        </button>
      </div>

      {activeTab === "directory" && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sponsors…"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-muted/30"
              />
            </div>
            <button className="px-3 py-2 text-sm font-medium border border-border rounded-xl text-dark hover:bg-muted">Filter</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sponsor</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event & Package</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Materials</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Performance</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSponsors.map(sponsor => {
                  const event = events.find(e => e.slug === sponsor.eventSlug);
                  return (
                    <tr key={sponsor.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={sponsor.logo} alt={sponsor.name} className="w-10 h-10 rounded-lg object-cover border border-border shrink-0" />
                          <p className="font-semibold text-dark">{sponsor.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-dark font-medium line-clamp-1">{event?.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{sponsor.package} · {sponsor.amount}</p>
                      </td>
                      <td className="px-5 py-4">
                        {sponsor.materialsUploaded ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                            <CheckCircle2 size={12} /> Received
                          </span>
                        ) : (
                          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-md border border-amber-500/20 transition-colors">
                            <AlertCircle size={12} /> Request Upload
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-dark"><span className="font-semibold">{sponsor.views.toLocaleString()}</span> views</p>
                        <p className="text-xs text-muted-foreground mt-0.5"><span className="font-medium text-dark">{sponsor.clicks.toLocaleString()}</span> clicks</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${sponsor.status === 'Active' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                          {sponsor.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-dark transition-colors">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "requests" && (
        <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground">
          <Building2 size={40} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-semibold text-dark">Sponsorship Inquiries</p>
          <p className="text-sm mt-1 max-w-sm mx-auto">
            When Supabase is connected in Phase 3, public sponsorship requests from the event pages will appear here for your approval.
          </p>
        </div>
      )}
    </div>
  );
}
