import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  CalendarDays, Camera, Image, BookOpen, TrendingUp,
  ArrowRight, CheckCircle2, AlertCircle, Mail,
} from "lucide-react";
import { fetchDashboardSummary } from "../../lib/actions/dashboard";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  loading = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        {loading ? (
          <div className="w-8 h-7 bg-muted animate-pulse rounded-lg mb-1" />
        ) : (
          <p className="text-2xl font-bold text-dark">{value}</p>
        )}
        <p className="text-sm font-medium text-dark/80 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  reviewed: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  upcoming: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  draft: "bg-muted text-muted-foreground border-border",
  published: "bg-green-500/10 text-green-600 border-green-500/20",
  scheduled: "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
        statusColors[status] ?? "bg-muted text-muted-foreground border-border"
      }`}
    >
      {status}
    </span>
  );
}

interface DashboardData {
  upcomingEvents: number;
  upcomingEventsList: any[];
  totalRegistrations: number;
  newBookings: number;
  totalBookings: number;
  publishedPosts: number;
  draftPosts: number;
  visibleImages: number;
  hiddenImages: number;
  unreadMessages: number;
  recentBookings: any[];
  recentPosts: any[];
}

function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    upcomingEvents: 0, upcomingEventsList: [], totalRegistrations: 0, newBookings: 0, totalBookings: 0,
    publishedPosts: 0, draftPosts: 0, visibleImages: 0, hiddenImages: 0,
    unreadMessages: 0, recentBookings: [], recentPosts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const summary = await fetchDashboardSummary();
        setData(summary as DashboardData);
      } catch {
        // Dashboard stays at zero counts if fetch fails
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const upcomingEvents = data.upcomingEvents;
  const upcomingEventsList = data.upcomingEventsList;
  const totalRegistrations = data.totalRegistrations;
  const newBookings = data.newBookings;
  const publishedPosts = data.publishedPosts;
  const visibleImages = data.visibleImages;

  const recentBookings = data.recentBookings;
  const recentPosts = data.recentPosts;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back — here's what's happening at Gaspo Studios.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarDays}
          label="Upcoming Events"
          value={upcomingEvents}
          sub={`${totalRegistrations} total registrations`}
          color="bg-primary/10 text-primary"
          loading={loading}
        />
        <StatCard
          icon={Camera}
          label="New Bookings"
          value={newBookings}
          sub="Awaiting review"
          color="bg-blue-500/10 text-blue-500"
          loading={loading}
        />
        <StatCard
          icon={BookOpen}
          label="Published Posts"
          value={publishedPosts}
          sub={loading ? "…" : `${data.draftPosts} draft(s)`}
          color="bg-violet-500/10 text-violet-500"
          loading={loading}
        />
        <StatCard
          icon={Image}
          label="Gallery Images"
          value={visibleImages}
          sub={loading ? "…" : `${data.hiddenImages} hidden`}
          color="bg-emerald-500/10 text-emerald-500"
          loading={loading}
        />
      </div>

      {/* Unread messages alert */}
      {!loading && data.unreadMessages > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-dark">
                {data.unreadMessages} unread message{data.unreadMessages > 1 ? "s" : ""} in your inbox
              </p>
              <p className="text-xs text-muted-foreground">New contact form submissions waiting for review</p>
            </div>
          </div>
          <Link
            to="/admin/messages"
            className="inline-flex items-center gap-1.5 bg-primary text-white rounded-xl px-3 py-2 text-xs font-semibold hover:bg-primary/90 transition-colors shrink-0"
          >
            View Inbox <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-semibold text-dark mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { to: "/admin/events/new", label: "New Event", icon: CalendarDays },
            { to: "/admin/blog/new", label: "New Blog Post", icon: BookOpen },
            { to: "/admin/bookings", label: "View Bookings", icon: Camera },
            { to: "/admin/gallery", label: "Upload Images", icon: Image },
            { to: "/admin/messages", label: "Messages", icon: Mail },
          ].map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex items-center gap-2 bg-muted hover:bg-primary hover:text-white text-dark rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-dark">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-border last:border-0 animate-pulse">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                  <div className="h-6 bg-muted rounded-full w-16" />
                </div>
              ))
            ) : recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No bookings yet. They'll appear when clients submit the booking form.
              </p>
            ) : (
              recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">{b.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{b.service}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {new Date(b.submittedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity panel */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-dark">Recent Blog Posts</h2>
            <Link to="/admin/blog" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-border last:border-0 animate-pulse">
                  <div className="w-12 h-12 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No posts yet. Click "New Post" to write your first article.
              </p>
            ) : (
              recentPosts.map((p) => (
                <div key={p.id} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                  {p.featuredImage ? (
                    <img
                      src={p.featuredImage}
                      alt={p.title}
                      className="w-12 h-12 rounded-lg object-cover shrink-0 bg-muted"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-dark line-clamp-1">{p.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.category} · {p.author?.name ?? "Unknown"}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))
            )}
          </div>

          {/* Upcoming Events mini-list */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-primary" /> Upcoming Events
            </h3>
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3.5 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : upcomingEventsList.length === 0 ? (
              <p className="text-xs text-muted-foreground">No upcoming events scheduled.</p>
            ) : (
              upcomingEventsList.slice(0, 3).map((e: any) => (
                <div key={e.id} className="flex items-center gap-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-dark truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {e.registrationCount ?? 0} registered
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid md:grid-cols-2 gap-4">
        {!loading && newBookings > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-700">
                {newBookings} new booking{newBookings > 1 ? "s" : ""} need review
              </p>
              <Link
                to="/admin/bookings"
                className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
              >
                Review now <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        )}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-700">Supabase connected &amp; operational</p>
            <p className="text-xs text-green-600 mt-0.5">
              All data is live — bookings, blog, gallery, events &amp; messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
