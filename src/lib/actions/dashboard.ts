import { createServerFn } from "@tanstack/react-start";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { requireAuth } from "../auth-guard.server.ts";

export const fetchDashboardSummary = createServerFn({ method: "GET" }).handler(async () => {
  requireAuth();
  const supabase = getSupabaseAdmin();

  // Use COUNT queries instead of fetching all rows — O(1) instead of O(n)
  const [
    { count: eventsCount },
    { count: registrationsCount },
    { count: bookingsCount },
    { count: newBookingsCount },
    { count: postsCount },
    { count: publishedPostsCount },
    { count: imagesCount },
    { count: visibleImagesCount },
    { count: unreadMessagesCount },
    { data: recentBookings },
    { data: recentPosts },
    { data: upcomingEventsList },
  ] = await Promise.all([
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .in("status", ["upcoming", "published"]),
    supabase.from("event_registrations").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase
      .from("blog_posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase.from("gallery_images").select("*", { count: "exact", head: true }),
    supabase.from("gallery_images").select("*", { count: "exact", head: true }).eq("visible", true),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("read", false),
    supabase
      .from("bookings")
      .select("id,name,service,status,submitted_at")
      .order("submitted_at", { ascending: false })
      .limit(5),
    supabase
      .from("blog_posts")
      .select("id,title,status,created_at")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("events")
      .select("id,title,date,status")
      .in("status", ["upcoming", "published"])
      .order("date", { ascending: true })
      .limit(3),
  ]);

  return {
    upcomingEvents: eventsCount || 0,
    totalRegistrations: registrationsCount || 0,
    newBookings: newBookingsCount || 0,
    totalBookings: bookingsCount || 0,
    publishedPosts: publishedPostsCount || 0,
    draftPosts: (postsCount || 0) - (publishedPostsCount || 0),
    visibleImages: visibleImagesCount || 0,
    hiddenImages: (imagesCount || 0) - (visibleImagesCount || 0),
    unreadMessages: unreadMessagesCount || 0,
    recentBookings: (recentBookings || []).map((b) => ({
      id: b.id,
      name: b.name,
      service: b.service,
      status: b.status,
      submittedAt: b.submitted_at,
    })),
    recentPosts: (recentPosts || []).map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      createdAt: p.created_at,
    })),
    upcomingEventsList: (upcomingEventsList || []).map((e: any) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      status: e.status,
    })),
  };
});
