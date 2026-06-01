import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { requireAuth } from "../auth-guard.server.ts";

export const fetchAnalyticsSummary = createServerFn({ method: "GET" })
  .inputValidator((input: { dateRange?: string } | undefined) => input)
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    // Compute the cutoff date based on dateRange (in days)
    const days = parseInt(data?.dateRange || "30", 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffISO = cutoffDate.toISOString();

    // 1. Basic counts (filtered by date range where applicable)
    const { count: bookingsCount, error: err1 } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("submitted_at", cutoffISO);

    const { count: registrationsCount, error: err2 } = await supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .gte("registered_at", cutoffISO);

    const { count: activeEventsCount, error: err3 } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    const { count: unreadMessagesCount, error: err4 } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("read", false);

    if (err1 || err2 || err3 || err4) {
      throw new Error(`Analytics fetch failed: ${err1?.message || err2?.message || err3?.message || err4?.message}`);
    }

    // 2. Total completed revenue (filtered by date range)
    const { data: revenueData, error: errRev } = await supabase
      .from("bookings")
      .select("total_value")
      .eq("status", "completed")
      .gte("submitted_at", cutoffISO);

    if (errRev) {
      throw new Error(`Analytics revenue fetch failed: ${errRev.message}`);
    }

    const totalRevenue = (revenueData || []).reduce((sum, b) => sum + Number(b.total_value), 0);

    // 3. Service Breakdown (filtered by date range)
    const { data: serviceData, error: errServ } = await supabase
      .from("bookings")
      .select("service")
      .gte("submitted_at", cutoffISO);

    if (errServ) {
      throw new Error(`Analytics service fetch failed: ${errServ.message}`);
    }

    const serviceMap: Record<string, number> = {};
    (serviceData || []).forEach((b) => {
      serviceMap[b.service] = (serviceMap[b.service] || 0) + 1;
    });
    const serviceBreakdown = Object.entries(serviceMap).map(([name, count]) => ({
      name,
      value: count,
    }));

    // 4. Monthly Revenue (Completed) & Monthly Bookings (All)
    // Fetch all bookings for monthly trends regardless of date range
    const { data: allBookings, error: errBkAll } = await supabase
      .from("bookings")
      .select("preferred_date, total_value, status");

    if (errBkAll) {
      throw new Error(`Analytics all bookings fetch failed: ${errBkAll.message}`);
    }

    const monthlyMap: Record<string, { revenue: number; bookings: number }> = {};
    (allBookings || []).forEach((b) => {
      if (!b.preferred_date) return;
      const month = b.preferred_date.substring(0, 7); // "YYYY-MM"
      if (!monthlyMap[month]) {
        monthlyMap[month] = { revenue: 0, bookings: 0 };
      }
      monthlyMap[month].bookings += 1;
      if (b.status === "completed") {
        monthlyMap[month].revenue += Number(b.total_value);
      }
    });

    const monthlyTrends = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, stats]) => ({
        month,
        revenue: stats.revenue,
        bookings: stats.bookings,
      }));

    // 5. Booking status distribution (filtered by date range)
    const { data: statusBookings, error: errStatusBk } = await supabase
      .from("bookings")
      .select("status")
      .gte("submitted_at", cutoffISO);

    const statusMap: Record<string, number> = {
      new: 0,
      reviewed: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    (statusBookings || []).forEach((b) => {
      if (statusMap[b.status] !== undefined) {
        statusMap[b.status] += 1;
      }
    });
    const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    // 6. Recent bookings
    const { data: recentBookingsData, error: errRecBk } = await supabase
      .from("bookings")
      .select("*")
      .order("submitted_at", { ascending: false })
      .limit(5);

    const recentBookings = (recentBookingsData || []).map((b) => ({
      id: b.id,
      name: b.name,
      service: b.service,
      status: b.status,
      totalValue: Number(b.total_value),
      submittedAt: b.submitted_at,
    }));

    return {
      overview: {
        totalRevenue,
        totalBookings: bookingsCount || 0,
        totalRegistrations: registrationsCount || 0,
        activeEvents: activeEventsCount || 0,
        unreadMessages: unreadMessagesCount || 0,
      },
      serviceBreakdown,
      monthlyTrends,
      statusBreakdown,
      recentBookings,
    };
  });
