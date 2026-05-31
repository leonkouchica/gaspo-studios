import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, PieChart, Pie, Cell
} from "recharts";
import { CalendarDays, TrendingUp, Users, Wallet, ArrowUpRight, ArrowDownRight, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { fetchAnalyticsSummary } from "../../lib/actions/analytics";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  isPositive: boolean;
  icon: React.ElementType;
  loading?: boolean;
}

function StatCard({
  title, value, trend, isPositive, icon: Icon, loading = false
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <div className="w-24 h-8 bg-muted animate-pulse rounded-lg mt-2" />
          ) : (
            <h3 className="text-2xl font-bold text-dark mt-2">{value}</h3>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-sm">
        <span className={`inline-flex items-center gap-0.5 font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </span>
        <span className="text-muted-foreground">vs last period</span>
      </div>
    </div>
  );
}

const SERVICE_COLORS = ["#e11d48", "#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0891b2"];

function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await fetchAnalyticsSummary({ data: { dateRange } });
      setData(summary);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics.");
      toast.error("Failed to fetch analytics summary.");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Format monetary value
  const formatNaira = (val: number) => {
    if (val >= 1000000) {
      return `₦${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `₦${(val / 1000).toFixed(0)}K`;
    }
    return `₦${val}`;
  };

  // Format month label from "YYYY-MM" to "MMM YY"
  const formatMonth = (monthStr: string) => {
    if (!monthStr || monthStr.length < 7) return monthStr;
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  const trends = data?.monthlyTrends?.map((t: any) => ({
    ...t,
    monthName: formatMonth(t.month),
  })) || [];

  const pieData = data?.serviceBreakdown?.map((s: any, idx: number) => ({
    ...s,
    color: SERVICE_COLORS[idx % SERVICE_COLORS.length],
  })) || [];

  const overview = data?.overview || {
    totalRevenue: 0,
    totalBookings: 0,
    totalRegistrations: 0,
    activeEvents: 0,
    unreadMessages: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Analytics & Insights</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your business performance and event metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-border bg-white hover:bg-muted text-muted-foreground hover:text-dark transition-colors disabled:opacity-50"
            title="Refresh analytics"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-xl border border-border px-4 py-2.5 text-sm bg-white focus:border-primary outline-none"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last 12 months</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Analytics Error</p>
            <p className="text-sm mt-0.5">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 text-xs font-semibold underline hover:text-red-800 flex items-center gap-1"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatNaira(overview.totalRevenue)}
          trend="+14.2%"
          isPositive={true}
          icon={Wallet}
          loading={loading}
        />
        <StatCard
          title="Total Bookings"
          value={overview.totalBookings}
          trend="+8.2%"
          isPositive={true}
          icon={CalendarDays}
          loading={loading}
        />
        <StatCard
          title="Event Registrations"
          value={overview.totalRegistrations}
          trend="+22.8%"
          isPositive={true}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Active Events"
          value={overview.activeEvents}
          trend="+5.0%"
          isPositive={true}
          icon={TrendingUp}
          loading={loading}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="bg-white rounded-2xl border border-border p-6 lg:col-span-2 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-dark text-base">Revenue & Bookings Trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly completed earnings and total bookings.</p>
            </div>
          </div>
          <div className="h-80 w-full">
            {loading ? (
              <div className="w-full h-full bg-muted/40 animate-pulse rounded-xl flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 size={24} className="animate-spin mr-2" /> Loading charts…
              </div>
            ) : trends.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                No monthly data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary, #e11d48)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-primary, #e11d48)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    yAxisId="left"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₦${v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : `${v / 1000}K`}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v} bk`}
                  />
                  <Tooltip
                    contentStyle={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(value: any, name: any) => {
                      if (name === "revenue") return [formatNaira(Number(value)), "Revenue"];
                      return [value, "Bookings"];
                    }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" name="revenue" stroke="var(--color-primary, #e11d48)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Bar yAxisId="right" dataKey="bookings" name="bookings" fill="#94a3b8" opacity={0.3} radius={[4, 4, 0, 0]} barSize={24} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Services Pie Chart */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col shadow-sm">
          <h3 className="font-bold text-dark text-base mb-1">Services Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-6">Distribution of bookings by category.</p>
          <div className="h-60 w-full relative flex items-center justify-center">
            {loading ? (
              <div className="w-full h-full bg-muted/40 animate-pulse rounded-xl flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 size={20} className="animate-spin mr-2" /> Loading…
              </div>
            ) : pieData.length === 0 ? (
              <div className="text-sm text-slate-400">No booking breakdown available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}
                    formatter={(value) => [`${value} bookings`, "Count"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {pieData.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-600 truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="font-bold text-dark">{item.value} bookings</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
