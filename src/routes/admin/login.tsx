import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { Lock, Mail, Eye, EyeOff, Camera, ArrowRight } from "lucide-react";
import { Logo } from "../../components/Logo";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

/** Set the Supabase session cookie so the server-side auth middleware can read it. */
function setSessionCookie(session: {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}) {
  const projectRef = "fhhxbjwcgfslvbznrvab";
  const cookieName = `sb-${projectRef}-auth-token`;
  const cookieValue = btoa(JSON.stringify(session));
  // Set cookie for all paths, expires based on session expiry (default 1 hour)
  const maxAge = session.expires_at
    ? Math.max(0, session.expires_at - Math.floor(Date.now() / 1000))
    : 3600;
  document.cookie = `${cookieName}=${encodeURIComponent(cookieValue)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect to admin if already logged in — also sync the cookie for server functions
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionCookie(session);
        navigate({ to: "/admin" });
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Invalid login credentials.");
      } else if (data.session) {
        setSessionCookie(data.session);
        toast.success("Welcome back! Logging in...");
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-5000" />

      {/* Glassmorphic Login Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center [&_*]:text-white [&_span.text-primary]:text-primary mb-2">
            <Logo light />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-slate-400 text-sm">
            Sign in to manage bookings, events, and portfolio content.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:bg-white/10 outline-none transition-all"
                placeholder="admin@gaspostudios.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:bg-white/10 outline-none transition-all"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl py-3 text-sm shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Gaspo Studios. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
