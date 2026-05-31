import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, CalendarDays, BookOpen, Image, Home,
  Camera, ChevronLeft, ChevronRight, Menu, X, Bell, Search,
  LogOut, Settings, User, ExternalLink, BarChart2, Building2
} from "lucide-react";
import { Logo } from "../components/Logo";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const nav = [
  {
    group: "Overview",
    items: [
      { to: "/admin" as const, icon: LayoutDashboard, label: "Dashboard", exact: true },
      { to: "/admin/analytics" as const, icon: BarChart2, label: "Analytics" },
    ],
  },
  {
    group: "Content",
    items: [
      { to: "/admin/homepage" as const, icon: Home, label: "Homepage" },
      { to: "/admin/blog" as const, icon: BookOpen, label: "Blog Posts" },
      { to: "/admin/gallery" as const, icon: Image, label: "Gallery" },
    ],
  },
  {
    group: "Events",
    items: [
      { to: "/admin/events" as const, icon: CalendarDays, label: "Events" },
      { to: "/admin/sponsor-portal" as const, icon: Building2, label: "Sponsor Portal" },
    ],
  },
  {
    group: "Bookings",
    items: [
      { to: "/admin/bookings" as const, icon: Camera, label: "Book a Shoot" },
    ],
  },
];

function NavLink({
  to,
  icon: Icon,
  label,
  collapsed,
  exact,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  exact?: boolean;
}) {
  const location = useLocation();
  const active = exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
        active
          ? "bg-primary text-white shadow-md shadow-primary/30"
          : "text-white/60 hover:text-white hover:bg-white/10"
      }`}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
      {collapsed && (
        <span className="absolute left-full ml-3 px-2.5 py-1 bg-dark text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-border-dark">
          {label}
        </span>
      )}
    </Link>
  );
}

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[oklch(0.97_0_0)] flex">
      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-dark border-r border-border-dark transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        } hidden lg:flex`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-border-dark px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="[&_*]:text-white [&_span.text-primary]:text-primary">
              <Logo light />
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={`w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 ${collapsed ? "" : ""}`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {nav.map(({ group, items }) => (
            <div key={group}>
              {!collapsed && (
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest px-3 mb-2">
                  {group}
                </p>
              )}
              <div className="space-y-1">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    collapsed={collapsed}
                    exact={"exact" in item ? item.exact : false}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-border-dark px-3 py-4 space-y-1">
          <NavLink to="/admin/settings" icon={Settings} label="Settings" collapsed={collapsed} />
          <Link
            to="/"
            target="_blank"
            title={collapsed ? "View Site" : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all group relative"
          >
            <ExternalLink size={18} className="shrink-0" />
            {!collapsed && <span>View Site</span>}
            {collapsed && (
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-dark text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-border-dark">
                View Site
              </span>
            )}
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all group relative">
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Log Out</span>}
            {collapsed && (
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-dark text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-border-dark">
                Log Out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-64 bg-dark flex flex-col h-full border-r border-border-dark">
            <div className="flex items-center justify-between h-16 border-b border-border-dark px-4">
              <div className="[&_*]:text-white [&_span.text-primary]:text-primary">
                <Logo light />
              </div>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
              {nav.map(({ group, items }) => (
                <div key={group}>
                  <p className="text-xs font-semibold text-white/30 uppercase tracking-widest px-3 mb-2">{group}</p>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        icon={item.icon}
                        label={item.label}
                        collapsed={false}
                        exact={"exact" in item ? item.exact : false}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-64"}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-border flex items-center px-4 md:px-6 gap-4 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl bg-muted text-dark flex items-center justify-center hover:bg-muted/80"
          >
            <Menu size={18} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm hidden md:flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search…"
              className="bg-transparent text-sm text-dark placeholder:text-muted-foreground outline-none w-full"
            />
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button className="w-9 h-9 rounded-xl bg-muted text-muted-foreground hover:text-dark flex items-center justify-center transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>
            <div className="flex items-center gap-2.5 pl-2 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                <User size={14} />
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-dark leading-tight">Admin</p>
                <p className="text-xs text-muted-foreground leading-tight">Gaspo Studios</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
