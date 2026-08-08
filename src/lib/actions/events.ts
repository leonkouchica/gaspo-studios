import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { convertAndUploadImage } from "./upload.server.ts";
import { requireAuth } from "../auth-guard.server.ts";
import { sendPushNotifications } from "../push-notification.server.ts";
import NewsletterBroadcastEmail from "../../emails/NewsletterBroadcastEmail.tsx";
import * as React from "react";
import { zeptoMailBatchSend } from "../resend.server.ts";
import { render } from "@react-email/components";
import { sendAppEmail } from "../resend.server.ts";
import EventRegistrationEmail from "../../emails/EventRegistrationEmail.tsx";
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

const whyAttendItemSchema = z.object({
  title: z.string(),
  description: z.string(),
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
    (input: { category?: string; status?: string; visibleOnly?: boolean } | undefined) => input,
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    let query = supabase.from("events").select("*").order("date", { ascending: false });

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
      speakerSubtitle: e.seo?.speakerSubtitle,
      whyAttendEnabled: e.seo?.whyAttendEnabled ?? true,
      whyAttendItems: e.seo?.whyAttendItems || [],
      sponsorLogos: e.seo?.sponsorLogos || [],
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }));
  });

export const fetchEvent = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      slug: z.string().optional(),
      id: z.string().optional(),
    }),
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
      speakerSubtitle: e.seo?.speakerSubtitle,
      whyAttendEnabled: e.seo?.whyAttendEnabled ?? true,
      whyAttendItems: e.seo?.whyAttendItems || [],
      sponsorLogos: e.seo?.sponsorLogos || [],
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
    }),
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
      speakerSubtitle: z.string().optional(),
      whyAttendEnabled: z.boolean().default(true),
      whyAttendItems: z.array(whyAttendItemSchema).default([]),
      sponsorLogos: z.array(z.string()).default([]),
    }),
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
        seo: {
          ...(data.seo || {}),
          speakerSubtitle: data.speakerSubtitle,
          whyAttendEnabled: data.whyAttendEnabled,
          whyAttendItems: data.whyAttendItems,
          sponsorLogos: data.sponsorLogos,
        },
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
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
      speakerSubtitle: z.string().optional(),
      whyAttendEnabled: z.boolean().default(true),
      whyAttendItems: z.array(whyAttendItemSchema).default([]),
      sponsorLogos: z.array(z.string()).default([]),
    }),
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
        seo: {
          ...(data.seo || {}),
          speakerSubtitle: data.speakerSubtitle,
          whyAttendEnabled: data.whyAttendEnabled,
          whyAttendItems: data.whyAttendItems,
          sponsorLogos: data.sponsorLogos,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update event: ${error.message}`);
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

    const { error } = await supabase.from("events").delete().eq("id", data.id);

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

export const triggerEventPushNotification = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    const { data: event, error } = await supabase
      .from("events")
      .select("title, summary, slug, date")
      .eq("id", data.id)
      .single();

    if (error || !event) {
      throw new Error(`Failed to fetch event: ${error?.message}`);
    }

    const result = await sendPushNotifications(
      {
        type: "event",
        title: event.title,
        body: event.summary,
        url: `/events/${event.slug}`,
        dateString: event.date,
      },
      { bypassRateLimit: true },
    );

    return result;
  });

export const broadcastEventNewsletter = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("title, summary, banner_image, slug")
      .eq("id", data.id)
      .single();

    if (eventErr || !event) {
      throw new Error(`Failed to fetch event: ${eventErr?.message}`);
    }

    const { data: subscribers, error: subErr } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("status", "subscribed");

    if (subErr) {
      throw new Error(`Failed to fetch subscribers: ${subErr.message}`);
    }

    if (!subscribers || subscribers.length === 0) {
      throw new Error("No active subscribers found.");
    }

    const htmlContent = `
      <h2>${event.title}</h2>
      ${event.banner_image ? `<img src="${event.banner_image.startsWith("/") ? "https://gaspostudios.com" + event.banner_image : event.banner_image}" alt="Featured" style="width:100%;border-radius:8px;margin-bottom:16px;" />` : ""}
      <p style="font-size: 16px; line-height: 1.5; color: #374151;">${event.summary}</p>
      <div style="margin-top: 24px; text-align: center;">
        <a href="https://gaspostudios.com/events/${event.slug}" style="display:inline-block;background-color:#10b981;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">View Event Details</a>
      </div>
    `;

    const emails = subscribers.map((sub: any) => sub.email);
    const BATCH_SIZE = 50;
    const batches = [];

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      batches.push(emails.slice(i, i + BATCH_SIZE));
    }

    let successCount = 0;
    let failCount = 0;

    const emailHtml = await render(
      React.createElement(NewsletterBroadcastEmail, {
        subject: event.title,
        content: htmlContent,
      }),
    );

    for (const batch of batches) {
      const payload = batch.map((email) => ({
        from: "Gaspo Studios <hello@gaspostudios.com>",
        to: email,
        subject: `Upcoming Event: ${event.title}`,
        html: emailHtml,
      }));

      try {
        const { error: batchError } = await zeptoMailBatchSend(payload);
        if (batchError) {
          console.error("Batch send error:", batchError);
          failCount += batch.length;
        } else {
          successCount += batch.length;
        }
      } catch (err) {
        console.error("Batch send exception:", err);
        failCount += batch.length;
      }
    }

    await supabase.from("email_log").insert({
      recipient: `Broadcast to ${emails.length} subscribers`,
      subject: `Upcoming Event: ${event.title}`,
      body: `Success: ${successCount}, Failed: ${failCount}`,
      type: "newsletter_broadcast",
    });

    if (failCount > 0 && successCount === 0) {
      throw new Error("Failed to send broadcast to all subscribers.");
    }

    return { success: true, successCount, failCount };
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
      registrationType: z
        .enum(["participant", "sponsor_guest", "speaker", "staff", "vip"])
        .default("participant"),
      linkedSponsorId: z.string().optional(),
      eventInterest: z.array(z.string()).default([]),
    }),
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
    const { data: currentEvent } = await supabase
      .from("events")
      .select("*")
      .eq("id", data.eventId)
      .single();
    if (currentEvent) {
      await supabase
        .from("events")
        .update({
          registration_count: (currentEvent.registration_count || 0) + 1,
        })
        .eq("id", data.eventId);

      // Send registration email via Resend
      const formattedDate = new Date(currentEvent.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      // Use the stored time field directly instead of parsing from the date-only string
      // (parsing a date-only string gives midnight UTC, which renders as 12:00 AM)
      const rawTime = currentEvent.time as string | undefined;
      const eventTime = rawTime
        ? (() => {
            const [h, m] = rawTime.split(":").map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);
            return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
          })()
        : "TBA";

      await sendAppEmail({
        to: data.email,
        subject: `Registration Confirmed: ${currentEvent.title}`,
        react: React.createElement(EventRegistrationEmail, {
          attendeeId: inserted.id,
          fullName: data.fullName,
          eventName: currentEvent.title,
          eventDate: formattedDate,
          eventTime: eventTime,
          eventType: currentEvent.type,
          venue: currentEvent.venue,
          mapEmbedUrl: currentEvent.map_embed_url,
        }),
      });

      // Update DB to mark confirmation sent
      await supabase
        .from("event_registrations")
        .update({ confirmation_sent: true })
        .eq("id", inserted.id);
      inserted.confirmation_sent = true;
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
    }),
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

export const enableSponsorshipForAllEvents = createServerFn({ method: "POST" }).handler(
  async () => {
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
        toUpdate.map((e) => e.id),
      );

    if (updateError) {
      throw new Error(`Failed to enable sponsorship: ${updateError.message}`);
    }

    return { updatedCount: toUpdate.length };
  },
);

/**
 * Resends the confirmation email to one or all registrants of an event,
 * using the corrected time from event.time and including the attendee ID.
 *
 * Pass `registrationId` to resend to a single attendee.
 * Omit `registrationId` to resend to all registrants of the event.
 */
export const resendConfirmationEmail = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      eventId: z.string(),
      registrationId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    // Fetch the event
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("*")
      .eq("id", data.eventId)
      .single();

    if (eventErr || !event) {
      throw new Error(`Failed to fetch event: ${eventErr?.message}`);
    }

    // Build formatted date / time (same logic as registerForEvent, using event.time directly)
    const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const rawTime = event.time as string | undefined;
    const eventTime = rawTime
      ? (() => {
          const [h, m] = rawTime.split(":").map(Number);
          const d = new Date();
          d.setHours(h, m, 0, 0);
          return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        })()
      : "TBA";

    // Determine which registrations to resend to
    let regsQuery = supabase.from("event_registrations").select("*").eq("event_id", data.eventId);
    if (data.registrationId) {
      regsQuery = regsQuery.eq("id", data.registrationId);
    }

    const { data: registrations, error: regsErr } = await regsQuery;
    if (regsErr) {
      throw new Error(`Failed to fetch registrations: ${regsErr.message}`);
    }
    if (!registrations || registrations.length === 0) {
      throw new Error("No registrations found to resend to.");
    }

    let successCount = 0;
    let failCount = 0;

    for (const reg of registrations) {
      try {
        await sendAppEmail({
          to: reg.email,
          subject: `Registration Confirmed: ${event.title}`,
          react: React.createElement(EventRegistrationEmail, {
            attendeeId: reg.id,
            fullName: reg.full_name,
            eventName: event.title,
            eventDate: formattedDate,
            eventTime: eventTime,
            eventType: event.type,
            venue: event.venue,
            mapEmbedUrl: event.map_embed_url,
          }),
        });

        await supabase
          .from("event_registrations")
          .update({ confirmation_sent: true })
          .eq("id", reg.id);

        successCount++;
      } catch (err) {
        console.error(`Failed to resend to ${reg.email}:`, err);
        failCount++;
      }
    }

    return { successCount, failCount };
  });
