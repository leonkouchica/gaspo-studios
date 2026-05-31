import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, PieChart, Pie, Cell
} from "recharts";
import { CalendarDays, TrendingUp, Users, Wallet, ArrowUpRight, ArrowDownRight, Download } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

// Mock Data
const revenueData = [
  { name: "Jan", revenue: 4500000, bookings: 12 },
  { name: "Feb", revenue: 5200000, bookings: 15 },
  { name: "Mar", revenue: 4800000, bookings: 14 },
  { name: "Apr", revenue: 6100000, bookings: 18 },
  { name: "May", revenue: 5900000, bookings: 16 },
  { name: "Jun", revenue: 7500000, bookings: 22 },
];

const eventRegistrationData = [
  { name: "Mon", physical: 45, virtual: 120 },
  { name: "Tue", physical: 52, virtual: 135 },
  { name: "Wed", physical: 38, virtual: 98 },
  { name: "Thu", physical: 65, virtual: 150 },
  { name: "Fri", physical: 85, virtual: 210 },
  { name: "Sat", physical: 120, virtual: 80 },
  { name: "Sun", physical: 90, virtual: 60 },
];

const serviceBreakdown = [
  { name: "Weddings", value: 45, color: "#e11d48" },
  { name: "Corporate", value: 30, color: "#2563eb" },
  { name: "Portraits", value: 15, color: "#16a34a" },
  { name: "Commercial", value: 10, color: "#d97706" },
];

function StatCard({
  title, value, trend, isPositive, icon: Icon
}: {
  title: string; value: string; trend: string; isPositive: boolean; icon: React.ElementType
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold text-dark mt-2">{value}</h3>
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
        <span className="text-muted-foreground">vs last month</span>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Analytics & Insights</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your business performance and event metrics.</p>
        </div>
        <div className="flex items-center gap-3">
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
          <button className="inline-flex items-center gap-2 bg-white border border-border hover:bg-muted text-dark rounded-xl px-4 py-2.5 text-sm font-medium transition-colors">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="₦34.0M" trend="+12.5%" isPositive={true} icon={Wallet} />
        <StatCard title="New Bookings" value="92" trend="+8.2%" isPositive={true} icon={CalendarDays} />
        <StatCard title="Event Registrations" value="1,420" trend="+24.8%" isPositive={true} icon={Users} />
        <StatCard title="Website Conversion" value="3.2%" trend="-0.4%" isPositive={false} icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-dark">Revenue Overview</h3>
            <p className="text-xs text-muted-foreground mt-1">Monthly revenue from bookings and event sponsorships.</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  tickFormatter={(val) => `₦${(val / 1000000).toFixed(1)}M`} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₦${value.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col">
          <div className="mb-2">
            <h3 className="font-semibold text-dark">Service Breakdown</h3>
            <p className="text-xs text-muted-foreground mt-1">Revenue by photography service.</p>
          </div>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-dark">100%</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-3 mt-4">
            {serviceBreakdown.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-sm text-dark font-medium">{s.name} <span className="text-muted-foreground ml-1">{s.value}%</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-border p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-dark">Event Registrations (This Week)</h3>
            <p className="text-xs text-muted-foreground mt-1">Comparison of physical vs virtual attendees.</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventRegistrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="physical" name="In-Person" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="virtual" name="Virtual" fill="#1f2937" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
