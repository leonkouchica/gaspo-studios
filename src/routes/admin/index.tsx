import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays, Camera, Image, BookOpen, TrendingUp,
  Users, ArrowRight, Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { events } from "../../data/events";
import { bookings } from "../../data/bookings";
import { blogPosts } from "../../data/blog";
import { galleryImages } from "../../data/gallery";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-dark">{value}</p>
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
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColors[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  );
}

function AdminDashboard() {
  const upcomingEvents = events.filter((e) => ["upcoming", "published"].includes(e.status));
  const totalRegistrations = events.reduce((s, e) => s + e.registrationCount, 0);
  const newBookings = bookings.filter((b) => b.status === "new").length;
  const publishedPosts = blogPosts.filter((p) => p.status === "published").length;
  const visibleImages = galleryImages.filter((i) => i.visible).length;

  const recentBookings = bookings.slice(0, 5);
  const recentPosts = blogPosts.slice(0, 3);

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
          value={upcomingEvents.length}
          sub={`${totalRegistrations} total registrations`}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Camera}
          label="New Bookings"
          value={newBookings}
          sub="Awaiting review"
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          icon={BookOpen}
          label="Published Posts"
          value={publishedPosts}
          sub={`${blogPosts.length - publishedPosts} draft(s)`}
          color="bg-violet-500/10 text-violet-500"
        />
        <StatCard
          icon={Image}
          label="Gallery Images"
          value={visibleImages}
          sub={`${galleryImages.length - visibleImages} hidden`}
          color="bg-emerald-500/10 text-emerald-500"
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-semibold text-dark mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { to: "/admin/events/new", label: "New Event", icon: CalendarDays },
            { to: "/admin/blog/new", label: "New Blog Post", icon: BookOpen },
            { to: "/admin/bookings", label: "View Bookings", icon: Camera },
            { to: "/admin/gallery", label: "Upload Images", icon: Image },
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
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-dark truncate">{b.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.service}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {new Date(b.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-dark">Recent Blog Posts</h2>
            <Link to="/admin/blog" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentPosts.map((p) => (
              <div key={p.id} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                <img src={p.featuredImage} alt={p.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-dark line-clamp-1">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.category} · {p.author.name}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>

          {/* Upcoming Events mini-list */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-primary" /> Upcoming Events
            </h3>
            {upcomingEvents.slice(0, 3).map((e) => (
              <div key={e.id} className="flex items-center gap-3 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-dark truncate">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}{e.registrationCount} registered
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid md:grid-cols-2 gap-4">
        {newBookings > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-700">{newBookings} new booking{newBookings > 1 ? "s" : ""} need review</p>
              <Link to="/admin/bookings" className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1">
                Review now <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        )}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-700">System is running normally</p>
            <p className="text-xs text-green-600 mt-0.5">All services operational · Preview mode active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
