import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { convertAndUploadImage } from "./upload.server.ts";
import { requireAuth } from "../auth-guard.server.ts";
import { sendPushNotifications } from "../push-notification.server.ts";

const eventStatusSchema = z.enum([
  "draft",
  "published",
  "upcoming",
  "ongoing",
  "completed",
  "cancelled",
  "archived",
]);

const eventTypeSchema = z.enum(["physical", "virtual", "hybrid"]);

const speakerSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  company: z.string(),
  bio: z.string(),
  photo: z.string(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
});

const agendaItemSchema = z.object({
  time: z.string(),
  title: z.string(),
  speaker: z.string().optional(),
  description: z.string().optional(),
});

const sponsorPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  currency: z.string(),
  benefits: z.array(z.string()),
  highlighted: z.boolean().optional(),
});

export const fetchEvents = createServerFn({ method: "GET" })
  .inputValidator(
    (input: { category?: string; status?: string; visibleOnly?: boolean } | undefined) => input
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false });

    if (data?.category && data.category !== "all" && data.category !== "All") {
      query = query.eq("category", data.category);
    }

    if (data?.status && data.status !== "all") {
      query = query.eq("status", data.status);
    } else if (data?.visibleOnly) {
      query = query.in("status", ["published", "upcoming", "ongoing"]);
    }

    const { data: eventsList, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    return (eventsList || []).map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      summary: e.summary,
      description: e.description,
      objectives: e.objectives || [],
      outcomes: e.outcomes || [],
      topics: e.topics || [],
      targetAudience: e.target_audience,
      category: e.category,
      type: e.type,
      status: e.status,
      date: e.date,
      time: e.time,
      endTime: e.end_time || undefined,
      venue: e.venue,
      address: e.address,
      city: e.city,
      country: e.country,
      mapEmbedUrl: e.map_embed_url || undefined,
      bannerImage: e.banner_image,
      galleryImages: e.gallery_images || [],
      speakers: e.speakers || [],
      agenda: e.agenda || [],
      sponsorPackages: e.sponsor_packages || [],
      sponsorshipEnabled: e.sponsorship_enabled,
      registrationOpen: e.registration_open,
      registrationDeadline: e.registration_deadline || undefined,
      capacity: e.capacity || undefined,
      registrationCount: e.registration_count || 0,
      featured: e.featured,
      seo: e.seo || {},
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }));
  });

export const fetchEvent = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      slug: z.string().optional(),
      id: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    let query = supabase.from("events").select("*");

    if (data.id) {
      query = query.eq("id", data.id);
    } else if (data.slug) {
      query = query.eq("slug", data.slug);
    } else {
      throw new Error("Must provide either id or slug to fetch event");
    }

    const { data: e, error } = await query.single();

    if (error) {
      throw new Error(`Failed to fetch event: ${error.message}`);
    }

    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      summary: e.summary,
      description: e.description,
      objectives: e.objectives || [],
      outcomes: e.outcomes || [],
      topics: e.topics || [],
      targetAudience: e.target_audience,
      category: e.category,
      type: e.type,
      status: e.status,
      date: e.date,
      time: e.time,
      endTime: e.end_time || undefined,
      venue: e.venue,
      address: e.address,
      city: e.city,
      country: e.country,
      mapEmbedUrl: e.map_embed_url || undefined,
      bannerImage: e.banner_image,
      galleryImages: e.gallery_images || [],
      speakers: e.speakers || [],
      agenda: e.agenda || [],
      sponsorPackages: e.sponsor_packages || [],
      sponsorshipEnabled: e.sponsorship_enabled,
      registrationOpen: e.registration_open,
      registrationDeadline: e.registration_deadline || undefined,
      capacity: e.capacity || undefined,
      registrationCount: e.registration_count || 0,
      featured: e.featured,
      seo: e.seo || {},
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    };
  });

export const uploadEventImage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      fileBase64: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
    })
  )
  .handler(async ({ data }) => {
    requireAuth();
    const buffer = Buffer.from(data.fileBase64, "base64"); // upload handler
    const file = new File([buffer], data.fileName, { type: data.mimeType });
    const publicUrl = await convertAndUploadImage(file, "events");
    return { url: publicUrl };
  });

export const createEvent = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      slug: z.string(),
      title: z.string().min(1),
      summary: z.string().min(1),
      description: z.string().min(1),
      objectives: z.array(z.string()).default([]),
      outcomes: z.array(z.string()).default([]),
      topics: z.array(z.string()).default([]),
      targetAudience: z.string().optional(),
      category: z.string(),
      type: eventTypeSchema,
      status: eventStatusSchema,
      date: z.string(),
      time: z.string(),
      endTime: z.string().optional(),
      venue: z.string(),
      address: z.string(),
      city: z.string(),
      country: z.string(),
      mapEmbedUrl: z.string().optional(),
      bannerImage: z.string(),
      galleryImages: z.array(z.string()).default([]),
      speakers: z.array(speakerSchema).default([]),
      agenda: z.array(agendaItemSchema).default([]),
      sponsorPackages: z.array(sponsorPackageSchema).default([]),
      sponsorshipEnabled: z.boolean().default(false),
      registrationOpen: z.boolean().default(true),
      registrationDeadline: z.string().optional(),
      capacity: z.number().optional(),
      featured: z.boolean().default(false),
      seo: z.any().optional(),
    })
  )
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();
    const { data: inserted, error } = await supabase
      .from("events")
      .insert({
        slug: data.slug,
        title: data.title,
        summary: data.summary,
        description: data.description,
        objectives: data.objectives,
        outcomes: data.outcomes,
        topics: data.topics,
        target_audience: data.targetAudience || null,
        category: data.category,
        type: data.type,
        status: data.status,
        date: data.date,
        time: data.time,
        end_time: data.endTime || null,
        venue: data.venue,
        address: data.address,
        city: data.city,
        country: data.country,
        map_embed_url: data.mapEmbedUrl || null,
        banner_image: data.bannerImage,
        gallery_images: data.galleryImages,
        speakers: data.speakers,
        agenda: data.agenda,
        sponsor_packages: data.sponsorPackages,
        sponsorship_enabled: data.sponsorshipEnabled,
        registration_open: data.registrationOpen,
        registration_deadline: data.registrationDeadline || null,
        capacity: data.capacity || null,
        registration_count: 0,
        featured: data.featured,
        seo: data.seo || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }

    // Fire-and-forget: send push notification for published/upcoming events
    if (inserted.status === "published" || inserted.status === "upcoming") {
      sendPushNotifications({
        type: "event",
        title: inserted.title,
        body: inserted.summary,
        url: `/events/${inserted.slug}`,
        dateString: inserted.date,
      }).catch((err) => console.error("Push notification failed for event create:", err));
    }

    return inserted;
  });

export const updateEvent = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      slug: z.string(),
      title: z.string().min(1),
      summary: z.string().min(1),
      description: z.string().min(1),
      objectives: z.array(z.string()).default([]),
      outcomes: z.array(z.string()).default([]),
      topics: z.array(z.string()).default([]),
      targetAudience: z.string().optional(),
      category: z.string(),
      type: eventTypeSchema,
      status: eventStatusSchema,
      date: z.string(),
      time: z.string(),
      endTime: z.string().optional(),
      venue: z.string(),
      address: z.string(),
      city: z.string(),
      country: z.string(),
      mapEmbedUrl: z.string().optional(),
      bannerImage: z.string(),
      galleryImages: z.array(z.string()).default([]),
      speakers: z.array(speakerSchema).default([]),
      agenda: z.array(agendaItemSchema).default([]),
      sponsorPackages: z.array(sponsorPackageSchema).default([]),
      sponsorshipEnabled: z.boolean().default(false),
      registrationOpen: z.boolean().default(true),
      registrationDeadline: z.string().optional(),
      capacity: z.number().optional(),
      featured: z.boolean().default(false),
      seo: z.any().optional(),
    })
  )
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    // Get current status to detect transition to published/upcoming
    const { data: currentEvent } = await supabase
      .from("events")
      .select("status")
      .eq("id", data.id)
      .single();

    const { data: updated, error } = await supabase
      .from("events")
      .update({
        slug: data.slug,
        title: data.title,
        summary: data.summary,
        description: data.description,
        objectives: data.objectives,
        outcomes: data.outcomes,
        topics: data.topics,
        target_audience: data.targetAudience || null,
        category: data.category,
        type: data.type,
        status: data.status,
        date: data.date,
        time: data.time,
        end_time: data.endTime || null,
        venue: data.venue,
        address: data.address,
        city: data.city,
        country: data.country,
        map_embed_url: data.mapEmbedUrl || null,
        banner_image: data.bannerImage,
        gallery_images: data.galleryImages,
        speakers: data.speakers,
        agenda: data.agenda,
        sponsor_packages: data.sponsorPackages,
        sponsorship_enabled: data.sponsorshipEnabled,
        registration_open: data.registrationOpen,
        registration_deadline: data.registrationDeadline || null,
        capacity: data.capacity || null,
        featured: data.featured,
        seo: data.seo || {},
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }

    // Fire-and-forget: send push if transitioning to published/upcoming
    const isNewlyPublic = (data.status === "published" || data.status === "upcoming") &&
      currentEvent?.status !== "published" &&
      currentEvent?.status !== "upcoming";
    if (isNewlyPublic) {
      sendPushNotifications({
        type: "event",
        title: updated.title,
        body: updated.summary,
        url: `/events/${updated.slug}`,
        dateString: updated.date,
      }).catch((err) => console.error("Push notification failed for event update:", err));
    }

    return updated;
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    // Get banner image first
    const { data: event } = await supabase
      .from("events")
      .select("banner_image")
      .eq("id", data.id)
      .single();

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", data.id);

    if (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }

    // Delete banner image from storage
    try {
      const srcUrl = event?.banner_image;
      if (srcUrl && srcUrl.includes("gaspo-media/")) {
        const filePath = srcUrl.substring(srcUrl.indexOf("gaspo-media/") + "gaspo-media/".length);
        await supabase.storage.from("gaspo-media").remove([filePath]);
      }
    } catch (storageErr) {
      console.error("Warning: failed to delete event banner from storage:", storageErr);
    }

    return { success: true };
  });

export const fetchEventRegistrations = createServerFn({ method: "GET" })
  .inputValidator(z.object({ eventId: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { data: registrations, error } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", data.eventId)
      .order("registered_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }

    return (registrations || []).map((r) => ({
      id: r.id,
      eventId: r.event_id,
      fullName: r.full_name,
      email: r.email,
      phone: r.phone,
      company: r.company,
      jobTitle: r.job_title,
      country: r.country,
      city: r.city,
      linkedin: r.linkedin || undefined,
      howHeard: r.how_heard,
      ticketType: r.ticket_type || undefined,
      paymentStatus: r.payment_status,
      registrationType: r.registration_type || "participant",
      linkedSponsorId: r.linked_sponsor_id || undefined,
      eventInterest: r.event_interest || [],
      confirmationSent: r.confirmation_sent || false,
      registeredAt: r.registered_at,
      qrCode: r.qr_code || undefined,
      checkedIn: r.checked_in,
      checkedInAt: r.checked_in_at || undefined,
    }));
  });

export const registerForEvent = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      eventId: z.string(),
      fullName: z.string().min(2),
      email: z.string().email(),
      phone: z.string(),
      company: z.string(),
      jobTitle: z.string(),
      country: z.string(),
      city: z.string(),
      linkedin: z.string().optional(),
      howHeard: z.string(),
      ticketType: z.string().optional(),
      paymentStatus: z.string().default("pending"),
      registrationType: z.enum(["participant","sponsor_guest","speaker","staff","vip"]).default("participant"),
      linkedSponsorId: z.string().optional(),
      eventInterest: z.array(z.string()).default([]),
    })
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    // Begin registration insert
    const { data: inserted, error } = await supabase
      .from("event_registrations")
      .insert({
        event_id: data.eventId,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        job_title: data.jobTitle,
        country: data.country,
        city: data.city,
        linkedin: data.linkedin || null,
        how_heard: data.howHeard,
        ticket_type: data.ticketType || null,
        payment_status: data.paymentStatus,
        registration_type: data.registrationType,
        linked_sponsor_id: data.linkedSponsorId || null,
        event_interest: data.eventInterest,
        confirmation_sent: false,
        registered_at: new Date().toISOString(),
        qr_code: `qr_${Math.random().toString(36).substring(2, 10)}`,
        checked_in: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to register for event: ${error.message}`);
    }

    // Increment registration count in events table
    await supabase.rpc("increment_registration_count", { event_id_param: data.eventId });
    // Fallback simple update if RPC isn't set up
    const { data: currentEvent } = await supabase.from("events").select("registration_count").eq("id", data.eventId).single();
    if (currentEvent) {
      await supabase.from("events").update({
        registration_count: (currentEvent.registration_count || 0) + 1
      }).eq("id", data.eventId);
    }

    return {
      id: inserted.id,
      eventId: inserted.event_id,
      fullName: inserted.full_name,
      email: inserted.email,
      phone: inserted.phone,
      company: inserted.company,
      jobTitle: inserted.job_title,
      country: inserted.country,
      city: inserted.city,
      linkedin: inserted.linkedin || undefined,
      howHeard: inserted.how_heard,
      ticketType: inserted.ticket_type || undefined,
      paymentStatus: inserted.payment_status,
      registrationType: inserted.registration_type,
      linkedSponsorId: inserted.linked_sponsor_id || undefined,
      eventInterest: inserted.event_interest || [],
      confirmationSent: inserted.confirmation_sent,
      registeredAt: inserted.registered_at,
      qrCode: inserted.qr_code || undefined,
      checkedIn: inserted.checked_in,
      checkedInAt: inserted.checked_in_at || undefined,
    };
  });

export const checkInAttendee = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      registrationId: z.string(),
      checkedIn: z.boolean(),
    })
  )
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();
    const { data: updated, error } = await supabase
      .from("event_registrations")
      .update({
        checked_in: data.checkedIn,
        checked_in_at: data.checkedIn ? new Date().toISOString() : null,
      })
      .eq("id", data.registrationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to check in attendee: ${error.message}`);
    }

    return {
      id: updated.id,
      eventId: updated.event_id,
      fullName: updated.full_name,
      email: updated.email,
      phone: updated.phone,
      company: updated.company,
      jobTitle: updated.job_title,
      country: updated.country,
      city: updated.city,
      linkedin: updated.linkedin || undefined,
      howHeard: updated.how_heard,
      ticketType: updated.ticket_type || undefined,
      paymentStatus: updated.payment_status,
      registeredAt: updated.registered_at,
      qrCode: updated.qr_code || undefined,
      checkedIn: updated.checked_in,
      checkedInAt: updated.checked_in_at || undefined,
    };
  });

export const enableSponsorshipForAllEvents = createServerFn({ method: "POST" })
  .handler(async () => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    const { data: events, error: fetchError } = await supabase
      .from("events")
      .select("id, sponsorship_enabled");

    if (fetchError) {
      throw new Error(`Failed to fetch events: ${fetchError.message}`);
    }

    const toUpdate = (events || []).filter((e) => !e.sponsorship_enabled);

    if (toUpdate.length === 0) {
      return { updatedCount: 0, message: "All events already have sponsorship enabled." };
    }

    const { error: updateError } = await supabase
      .from("events")
      .update({ sponsorship_enabled: true })
      .in(
        "id",
        toUpdate.map((e) => e.id)
      );

    if (updateError) {
      throw new Error(`Failed to enable sponsorship: ${updateError.message}`);
    }

    return { updatedCount: toUpdate.length };
  });
