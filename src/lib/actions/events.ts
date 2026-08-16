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
import PreEventAppreciationEmail from "../../emails/PreEventAppreciationEmail.tsx";
import PostEventThankYouEmail from "../../emails/PostEventThankYouEmail.tsx";
import CampaignBroadcastEmail from "../../emails/CampaignBroadcastEmail.tsx";
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

    // Prevent duplicate registrations: check if this email is already registered for the event
    const { data: existing } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", data.eventId)
      .eq("email", data.email)
      .maybeSingle();

    if (existing) {
      throw new Error(
        "This email address is already registered for this event. Please use a different email or contact us if you need assistance.",
      );
    }

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

// ─────────────────────────────────────────────────────────────────────────────
// EVENT CAMPAIGN ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

const campaignTemplateSchema = z.enum([
  "registration_confirmation",
  "pre_event_appreciation",
  "post_event_thank_you",
  "new_registration_notification",
  "custom",
]);

/**
 * Fetches all campaigns for a given event, ordered newest-first.
 */
export const fetchEventCampaigns = createServerFn({ method: "GET" })
  .inputValidator(z.object({ eventId: z.string() }))
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();
    const { data: campaigns, error } = await supabase
      .from("event_campaigns")
      .select("*")
      .eq("event_id", data.eventId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch campaigns: ${error.message}`);

    return (campaigns || []).map((c) => ({
      id: c.id,
      eventId: c.event_id,
      name: c.name,
      templateType: c.template_type,
      subject: c.subject,
      status: c.status,
      scheduledAt: c.scheduled_at || null,
      sentAt: c.sent_at || null,
      totalRecipients: c.total_recipients ?? 0,
      successCount: c.success_count ?? 0,
      failCount: c.fail_count ?? 0,
      createdAt: c.created_at,
    }));
  });

/**
 * Creates a new campaign in draft status.
 */
export const createEventCampaign = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      eventId: z.string(),
      name: z.string().min(1),
      templateType: campaignTemplateSchema,
      subject: z.string().min(1),
      customBodyHtml: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    // Verify event exists
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id, title")
      .eq("id", data.eventId)
      .single();
    if (eventErr || !event) throw new Error("Event not found.");

    const { data: campaign, error } = await supabase
      .from("event_campaigns")
      .insert({
        event_id: data.eventId,
        name: data.name,
        template_type: data.templateType,
        subject: data.subject,
        custom_body_html: data.customBodyHtml || null,
        status: "draft",
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create campaign: ${error.message}`);

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      createdAt: campaign.created_at,
    };
  });

/**
 * Sends an event campaign to a specific list of selected registrant IDs.
 * Only the registrants whose IDs are in selectedRegistrationIds will receive the email.
 */
export const sendEventCampaign = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      campaignId: z.string(),
      eventId: z.string(),
      selectedRegistrationIds: z.array(z.string()).min(1),
      scheduledAt: z.string().optional(), // ISO string if scheduling
    }),
  )
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    // Fetch campaign
    const { data: campaign, error: campErr } = await supabase
      .from("event_campaigns")
      .select("*")
      .eq("id", data.campaignId)
      .single();
    if (campErr || !campaign) throw new Error("Campaign not found.");
    if (!['draft', 'scheduled'].includes(campaign.status))
      throw new Error(`Cannot send a campaign with status "${campaign.status}".`);

    // Fetch event
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("*")
      .eq("id", data.eventId)
      .single();
    if (eventErr || !event) throw new Error("Event not found.");

    // Fetch only the selected registrations
    const { data: registrations, error: regsErr } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", data.eventId)
      .in("id", data.selectedRegistrationIds);
    if (regsErr) throw new Error(`Failed to fetch registrations: ${regsErr.message}`);
    if (!registrations || registrations.length === 0)
      throw new Error("No valid registrations found for the selected recipients.");

    // Filter out registrations with no valid email
    const eligible = registrations.filter(
      (r) => r.email && r.email.includes("@"),
    );
    if (eligible.length === 0)
      throw new Error("None of the selected recipients have a valid email address.");

    // If scheduled, just update status and return early
    if (data.scheduledAt) {
      await supabase
        .from("event_campaigns")
        .update({ status: "scheduled", scheduled_at: data.scheduledAt })
        .eq("id", data.campaignId);
      return { scheduled: true, scheduledAt: data.scheduledAt };
    }

    // Mark as sending
    await supabase
      .from("event_campaigns")
      .update({ status: "sending", total_recipients: eligible.length })
      .eq("id", data.campaignId);

    // Build event display values
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

    let successCount = 0;
    let failCount = 0;

    for (const reg of eligible) {
      let reactElement: React.ReactElement;
      const firstName = (reg.full_name || "Attendee").split(" ")[0];

      switch (campaign.template_type) {
        case "pre_event_appreciation":
          reactElement = React.createElement(PreEventAppreciationEmail, {
            firstName,
            eventName: event.title,
            eventDate: formattedDate,
            eventTime,
            eventVenue: event.venue,
            eventCity: event.city,
            eventDescription: event.description || "",
            eventActivities: (event.agenda || []).slice(0, 6).map((a: { title: string }) => a.title),
            eventImage: event.banner_image || undefined,
            registrationUrl: `https://www.gaspostudios.com/events/${event.slug}`,
            agendaItems: (event.agenda || []).map((a: { time: string; title: string }) => ({ time: a.time, title: a.title })),
          });
          break;

        case "post_event_thank_you":
          reactElement = React.createElement(PostEventThankYouEmail, {
            firstName,
            eventName: event.title,
            eventDate: formattedDate,
            photo1Url: (event.gallery_images || [])[0] || undefined,
            photo2Url: (event.gallery_images || [])[1] || undefined,
            galleryUrl: `https://www.gaspostudios.com/gallery`,
            nextEventUrl: `https://www.gaspostudios.com/events`,
          });
          break;

        case "registration_confirmation":
          reactElement = React.createElement(EventRegistrationEmail, {
            attendeeId: reg.id,
            fullName: reg.full_name,
            eventName: event.title,
            eventDate: formattedDate,
            eventTime,
            eventType: event.type,
            venue: event.venue,
          });
          break;

        default:
          // new_registration_notification | custom — use generic broadcast
          reactElement = React.createElement(CampaignBroadcastEmail, {
            firstName,
            subject: campaign.subject,
            bodyHtml: campaign.custom_body_html || `<p>Hi ${firstName}, we have an update regarding <strong>${event.title}</strong>.</p>`,
            eventName: event.title,
          });
      }

      // Insert pending recipient row
      const { data: recipientRow } = await supabase
        .from("campaign_recipients")
        .insert({
          campaign_id: data.campaignId,
          registration_id: reg.id,
          email: reg.email,
          full_name: reg.full_name,
          status: "pending",
        })
        .select("id")
        .single();

      try {
        await sendAppEmail({
          to: reg.email,
          subject: campaign.subject,
          react: reactElement,
        });

        if (recipientRow?.id) {
          await supabase
            .from("campaign_recipients")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", recipientRow.id);
        }
        successCount++;
      } catch (err: any) {
        console.error(`Campaign send failed for ${reg.email}:`, err);
        if (recipientRow?.id) {
          await supabase
            .from("campaign_recipients")
            .update({ status: "failed", error_message: err.message || "Unknown error" })
            .eq("id", recipientRow.id);
        }
        failCount++;
      }
    }

    // Determine final status
    const finalStatus =
      failCount === 0
        ? "sent"
        : successCount === 0
          ? "failed"
          : "partially_sent";

    await supabase
      .from("event_campaigns")
      .update({
        status: finalStatus,
        sent_at: new Date().toISOString(),
        success_count: successCount,
        fail_count: failCount,
      })
      .eq("id", data.campaignId);

    return { successCount, failCount, status: finalStatus };
  });

/**
 * Sends a test email to the admin's own address only (not logged to campaign_recipients).
 */
export const sendTestCampaignEmail = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      toEmail: z.string().email(),
      eventId: z.string(),
      templateType: campaignTemplateSchema,
      subject: z.string(),
      customBodyHtml: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("*")
      .eq("id", data.eventId)
      .single();
    if (eventErr || !event) throw new Error("Event not found.");

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

    let reactElement: React.ReactElement;
    switch (data.templateType) {
      case "pre_event_appreciation":
        reactElement = React.createElement(PreEventAppreciationEmail, {
          firstName: "Test",
          eventName: event.title,
          eventDate: formattedDate,
          eventTime,
          eventVenue: event.venue,
          eventCity: event.city,
          eventDescription: event.description || "",
          eventActivities: (event.agenda || []).slice(0, 6).map((a: { title: string }) => a.title),
          eventImage: event.banner_image || undefined,
          registrationUrl: `https://www.gaspostudios.com/events/${event.slug}`,
          agendaItems: (event.agenda || []).map((a: { time: string; title: string }) => ({ time: a.time, title: a.title })),
        });
        break;
      case "post_event_thank_you":
        reactElement = React.createElement(PostEventThankYouEmail, {
          firstName: "Test",
          eventName: event.title,
          eventDate: formattedDate,
          photo1Url: (event.gallery_images || [])[0] || undefined,
          photo2Url: (event.gallery_images || [])[1] || undefined,
        });
        break;
      case "registration_confirmation":
        reactElement = React.createElement(EventRegistrationEmail, {
          attendeeId: "TEST-ID",
          fullName: "Test Attendee",
          eventName: event.title,
          eventDate: formattedDate,
          eventTime,
          eventType: event.type,
          venue: event.venue,
        });
        break;
      default:
        reactElement = React.createElement(CampaignBroadcastEmail, {
          firstName: "Test",
          subject: data.subject,
          bodyHtml: data.customBodyHtml || `<p>This is a test of the campaign email for <strong>${event.title}</strong>.</p>`,
          eventName: event.title,
        });
    }

    const result = await sendAppEmail({
      to: data.toEmail,
      subject: `[TEST] ${data.subject}`,
      react: reactElement,
    });

    if (!result.success) {
      throw new Error(`Failed to send test email: ${result.error?.message || "Unknown error"}`);
    }

    return { success: true };
  });

/**
 * Returns a campaign's full delivery report including per-recipient rows.
 */
export const fetchCampaignReport = createServerFn({ method: "GET" })
  .inputValidator(z.object({ campaignId: z.string() }))
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    const { data: campaign, error: campErr } = await supabase
      .from("event_campaigns")
      .select("*")
      .eq("id", data.campaignId)
      .single();
    if (campErr || !campaign) throw new Error("Campaign not found.");

    const { data: recipients, error: recsErr } = await supabase
      .from("campaign_recipients")
      .select("*")
      .eq("campaign_id", data.campaignId)
      .order("sent_at", { ascending: true });
    if (recsErr) throw new Error(`Failed to fetch recipients: ${recsErr.message}`);

    return {
      id: campaign.id,
      name: campaign.name,
      templateType: campaign.template_type,
      subject: campaign.subject,
      status: campaign.status,
      sentAt: campaign.sent_at,
      totalRecipients: campaign.total_recipients ?? 0,
      successCount: campaign.success_count ?? 0,
      failCount: campaign.fail_count ?? 0,
      recipients: (recipients || []).map((r) => ({
        id: r.id,
        registrationId: r.registration_id,
        email: r.email,
        fullName: r.full_name,
        status: r.status,
        sentAt: r.sent_at || null,
        errorMessage: r.error_message || null,
      })),
    };
  });

/**
 * Cancels a draft or scheduled campaign (soft-delete: sets status to cancelled).
 */
export const deleteEventCampaign = createServerFn({ method: "POST" })
  .inputValidator(z.object({ campaignId: z.string() }))
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    const { data: campaign, error: fetchErr } = await supabase
      .from("event_campaigns")
      .select("status")
      .eq("id", data.campaignId)
      .single();
    if (fetchErr || !campaign) throw new Error("Campaign not found.");
    if (["sending", "sent"].includes(campaign.status))
      throw new Error("Cannot cancel a campaign that has already been sent.");

    const { error } = await supabase
      .from("event_campaigns")
      .update({ status: "cancelled" })
      .eq("id", data.campaignId);
    if (error) throw new Error(`Failed to cancel campaign: ${error.message}`);

    return { success: true };
  });
