import {
  createFileRoute,
  Outlet,
  Link,
  useNavigate,
  useLocation,
  redirect,
} from "@tanstack/react-router";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Image,
  Home,
  Camera,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  Settings,
  User,
  ExternalLink,
  BarChart2,
  Building2,
  Mail,
  Mailbox,
  Youtube,
} from "lucide-react";
import { Logo } from "../components/Logo";
import { supabase } from "../lib/supabase";
import { fetchUnreadMessageCount } from "../lib/actions/contact";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin/login") {
      return;
    }
    // Skip session check during SSR — Supabase sessions live in localStorage,
    // which isn't available on the server. The client-side AdminLayout
    // useEffect will redirect to /admin/login if no session is found.
    if (typeof document === "undefined") {
      return;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: "/admin/login",
      });
    }
  },
  component: AdminLayout,
});

interface AdminContextType {
  role: string | null;
  email: string | null;
  session: any;
}

export const AdminContext = createContext<AdminContextType>({
  role: null,
  email: null,
  session: null,
});

export const useAdmin = () => useContext(AdminContext);

const nav = [
  {
    group: "Overview",
    items: [
      { to: "/admin" as const, icon: LayoutDashboard, label: "Dashboard", exact: true },
      { to: "/admin/analytics" as const, icon: BarChart2, label: "Analytics" },
      { to: "/admin/messages" as const, icon: Mail, label: "Messages" },
    ],
  },
  {
    group: "Content",
    items: [
      { to: "/admin/homepage" as const, icon: Home, label: "Homepage" },
      { to: "/admin/blog" as const, icon: BookOpen, label: "Blog Posts" },
      { to: "/admin/gallery" as const, icon: Image, label: "Gallery" },
      { to: "/admin/videos" as const, icon: Youtube, label: "YouTube Videos" },
      { to: "/admin/newsletter" as const, icon: Mailbox, label: "Newsletters" },
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
    items: [{ to: "/admin/bookings" as const, icon: Camera, label: "Book a Shoot" }],
  },
];

function NavLink({
  to,
  icon: Icon,
  label,
  collapsed,
  exact,
  badgeCount,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  exact?: boolean;
  badgeCount?: number;
}) {
  const location = useLocation();
  const active = exact ? location.pathname === to : location.pathname.startsWith(to);

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
      {!collapsed && badgeCount !== undefined && badgeCount > 0 && (
        <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
          {badgeCount}
        </span>
      )}
      {collapsed && badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-dark shrink-0" />
      )}
      {collapsed && (
        <span className="absolute left-full ml-3 px-2.5 py-1 bg-dark text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-border-dark">
          {label}
        </span>
      )}
    </Link>
  );
}

function AdminLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Sync session to a cookie so server functions can verify auth
        const projectRef = "fhhxbjwcgfslvbznrvab";
        const cookieValue = btoa(
          JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
          }),
        );
        const maxAge = session.expires_at
          ? Math.max(0, session.expires_at - Math.floor(Date.now() / 1000))
          : 3600;
        document.cookie = `sb-${projectRef}-auth-token=${encodeURIComponent(cookieValue)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
      if (session?.user) {
        fetchUserRole(session.user.id);
        fetchUnreadCount();
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        // Sync session to a cookie so server functions can verify auth
        const projectRef = "fhhxbjwcgfslvbznrvab";
        const cookieValue = btoa(
          JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
          }),
        );
        const maxAge = session.expires_at
          ? Math.max(0, session.expires_at - Math.floor(Date.now() / 1000))
          : 3600;
        document.cookie = `sb-${projectRef}-auth-token=${encodeURIComponent(cookieValue)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
      if (session?.user) {
        fetchUserRole(session.user.id);
        fetchUnreadCount();
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserRole(userId: string) {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();
      setRole(data?.role || "viewer");
    } catch {
      setRole("viewer");
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnreadCount() {
    try {
      const result = await fetchUnreadMessageCount();
      setUnreadCount((result as any).count || 0);
    } catch {
      setUnreadCount(0);
    }
  }

  useEffect(() => {
    if (!loading && !session && location.pathname !== "/admin/login") {
      navigate({ to: "/admin/login" });
    }
  }, [loading, session, location.pathname, navigate]);

  // Inactivity auto-logout: 30 minutes of no mouse/keyboard/touch activity
  useEffect(() => {
    // Don't track inactivity on the login page
    if (location.pathname === "/admin/login") return;
    if (!session) return;

    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        supabase.auth.signOut();
        toast.error("Session expired due to inactivity. Please log in again.");
        navigate({ to: "/admin/login" });
      }, INACTIVITY_LIMIT);
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    resetTimer(); // Start the timer

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [session, location.pathname, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Successfully logged out.");
    navigate({ to: "/admin/login" });
  };

  if (loading && location.pathname !== "/admin/login") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium tracking-wide animate-pulse">
          Loading Admin Workspace...
        </p>
      </div>
    );
  }

  if (location.pathname === "/admin/login") {
    return <Outlet />;
  }

  const filteredNav = nav
    .map((group) => {
      const items = group.items.filter((item) => {
        if (role === "photographer") {
          return item.label === "Gallery";
        }
        if (role === "editor") {
          return [
            "Dashboard",
            "Analytics",
            "Homepage",
            "Blog Posts",
            "Gallery",
            "Events",
            "Newsletters",
          ].includes(item.label);
        }
        if (role === "viewer") {
          return [
            "Dashboard",
            "Analytics",
            "Events",
            "Sponsor Portal",
            "Book a Shoot",
            "Messages",
          ].includes(item.label);
        }
        return true;
      });
      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);

  const userDisplayName = session?.user?.email?.split("@")[0] || "Staff";
  const userRoleDisplay = role ? role.toUpperCase() : "STAFF";

  return (
    <AdminContext.Provider value={{ role, email: session?.user?.email || null, session }}>
      <div className="min-h-screen bg-[oklch(0.97_0_0)] flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-dark border-r border-border-dark transition-all duration-300 ${
            collapsed ? "w-[72px]" : "w-64"
          } hidden lg:flex`}
        >
          <div
            className={`flex items-center h-16 border-b border-border-dark px-4 ${collapsed ? "justify-center" : "justify-between"}`}
          >
            {!collapsed && (
              <div className="[&_*]:text-white [&_span.text-primary]:text-primary">
                <Logo light />
              </div>
            )}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {filteredNav.map(({ group, items }) => (
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
                      badgeCount={item.label === "Messages" ? unreadCount : undefined}
                      exact={"exact" in item ? item.exact : false}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-border-dark px-3 py-4 space-y-1">
            {role === "admin" && (
              <NavLink
                to="/admin/settings"
                icon={Settings}
                label="Settings"
                collapsed={collapsed}
              />
            )}
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
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all group relative cursor-pointer"
            >
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

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative z-10 w-64 bg-dark flex flex-col h-full border-r border-border-dark">
              <div className="flex items-center justify-between h-16 border-b border-border-dark px-4">
                <div className="[&_*]:text-white [&_span.text-primary]:text-primary">
                  <Logo light />
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                {filteredNav.map(({ group, items }) => (
                  <div key={group}>
                    <p className="text-xs font-semibold text-white/30 uppercase tracking-widest px-3 mb-2">
                      {group}
                    </p>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          icon={item.icon}
                          label={item.label}
                          collapsed={false}
                          badgeCount={item.label === "Messages" ? unreadCount : undefined}
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

        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-64"}`}
        >
          <header className="sticky top-0 z-30 h-16 bg-white border-b border-border flex items-center px-4 md:px-6 gap-4 shadow-sm">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-muted text-dark flex items-center justify-center hover:bg-muted/80"
            >
              <Menu size={18} />
            </button>
            <div className="flex-1 max-w-sm hidden md:flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
              <Search size={15} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search…"
                className="bg-transparent text-sm text-dark placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
            <div className="flex-1" />
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
                  <p className="text-xs font-semibold text-dark leading-tight capitalize">
                    {userDisplayName}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">{userRoleDisplay}</p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
