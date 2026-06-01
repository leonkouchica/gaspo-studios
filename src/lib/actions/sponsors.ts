import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { requireAuth, requireRole } from "../auth-guard.server.ts";

// ── Sponsor Payment ──────────────────────────────────────────────────────────

export const initSponsorPayment = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      eventId: z.string(),
      companyName: z.string().min(1),
      contactName: z.string().min(1),
      contactEmail: z.string().email(),
      contactPhone: z.string().min(1),
      packageId: z.string(),
      packageName: z.string(),
      packagePrice: z.number().positive(),
    })
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    // Insert sponsor record as pending
    const { data: sponsor, error: insertError } = await supabase
      .from("event_sponsors")
      .insert({
        event_id: data.eventId,
        company_name: data.companyName,
        contact_name: data.contactName,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        package_id: data.packageId,
        package_name: data.packageName,
        package_price: data.packagePrice,
        currency: "NGN",
        payment_status: "pending",
        status: "active",
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create sponsor record: ${insertError.message}`);
    }

    // Initiate Paystack transaction
    const { data: setting } = await supabase
      .from("payment_settings")
      .select("secret_key, active, test_mode")
      .eq("gateway", "paystack")
      .single();

    const secretKey = setting?.active ? setting.secret_key : null;

    if (!secretKey) {
      // Mock flow for development
      const mockRef = `pstk_sp_${Math.random().toString(36).substring(7)}`;
      await supabase
        .from("event_sponsors")
        .update({ payment_ref: mockRef })
        .eq("id", sponsor.id);

      return {
        authorizationUrl: `/events/confirmation?type=sponsor&ref=${mockRef}&mock=true`,
        reference: mockRef,
        sponsorId: sponsor.id,
        isMock: true,
      };
    }

    // Real Paystack API call
    const amountInKobo = Math.round(data.packagePrice * 100);
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.contactEmail,
        amount: amountInKobo,
        currency: "NGN",
        metadata: {
          sponsor_id: sponsor.id,
          event_id: data.eventId,
          package: data.packageName,
          company: data.companyName,
          type: "event_sponsorship",
        },
        callback_url: `${getBaseUrl()}/events/confirmation?type=sponsor`,
      }),
    });

    const resJson = await response.json();
    if (!resJson.status) {
      throw new Error(resJson.message || "Paystack initialization failed");
    }

    // Store the Paystack reference
    await supabase
      .from("event_sponsors")
      .update({ payment_ref: resJson.data.reference })
      .eq("id", sponsor.id);

    return {
      authorizationUrl: resJson.data.authorization_url,
      reference: resJson.data.reference,
      sponsorId: sponsor.id,
      isMock: false,
    };
  });

// ── Verify Sponsor Payment ──────────────────────────────────────────────────

export const verifySponsorPayment = createServerFn({ method: "POST" })
  .inputValidator(z.object({ reference: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    // Find the sponsor record
    const { data: sponsor } = await supabase
      .from("event_sponsors")
      .select("*")
      .eq("payment_ref", data.reference)
      .single();

    if (!sponsor) {
      return { verified: false, message: "Sponsor record not found." };
    }

    if (sponsor.payment_status === "paid") {
      return { verified: true, sponsorId: sponsor.id, alreadyPaid: true };
    }

    // Check Paystack
    const { data: setting } = await supabase
      .from("payment_settings")
      .select("secret_key, active")
      .eq("gateway", "paystack")
      .single();

    const secretKey = setting?.active ? setting.secret_key : null;

    if (!secretKey) {
      // Mock verification for development
      await supabase
        .from("event_sponsors")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", sponsor.id);

      return { verified: true, sponsorId: sponsor.id, isMock: true };
    }

    // Real Paystack verification
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${data.reference}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
      }
    );

    const resJson = await response.json();
    if (!resJson.status || resJson.data.status !== "success") {
      // Payment not successful yet
      return { verified: false, message: resJson.data?.gateway_response || "Payment not confirmed." };
    }

    // Mark as paid
    await supabase
      .from("event_sponsors")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", sponsor.id);

    // Get event details for email
    const { data: event } = await supabase
      .from("events")
      .select("title, date, venue")
      .eq("id", sponsor.event_id)
      .single();

    // Send confirmation emails (log to email_log)
    await sendSponsorEmails(supabase, sponsor, event);

    return {
      verified: true,
      sponsorId: sponsor.id,
      eventTitle: event?.title,
    };
  });

// ── Admin: Fetch Sponsors ────────────────────────────────────────────────────

export const fetchEventSponsors = createServerFn({ method: "GET" })
  .inputValidator(
    (input: { eventId?: string; paymentStatus?: string } | undefined) => input
  )
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("event_sponsors")
      .select("*, events!inner(title, date, slug)")
      .order("created_at", { ascending: false });

    if (data?.eventId) {
      query = query.eq("event_id", data.eventId);
    }
    if (data?.paymentStatus && data.paymentStatus !== "all") {
      query = query.eq("payment_status", data.paymentStatus);
    }

    const { data: sponsors, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch sponsors: ${error.message}`);
    }

    return (sponsors || []).map((s: any) => ({
      id: s.id,
      eventId: s.event_id,
      eventTitle: s.events?.title || "Unknown Event",
      eventSlug: s.events?.slug,
      companyName: s.company_name,
      contactName: s.contact_name,
      contactEmail: s.contact_email,
      contactPhone: s.contact_phone,
      packageId: s.package_id,
      packageName: s.package_name,
      packagePrice: s.package_price,
      currency: s.currency,
      paymentRef: s.payment_ref,
      paymentStatus: s.payment_status,
      paidAt: s.paid_at,
      status: s.status,
      adminNotes: s.admin_notes,
      createdAt: s.created_at,
    }));
  });

// ── Admin: Update Sponsor Status ─────────────────────────────────────────────

export const updateSponsorStatus = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      sponsorId: z.string(),
      status: z.enum(["active", "cancelled", "completed"]),
      adminNotes: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();

    const updatePayload: Record<string, any> = {
      status: data.status,
    };
    if (data.adminNotes !== undefined) {
      updatePayload.admin_notes = data.adminNotes;
    }

    const { data: updated, error } = await supabase
      .from("event_sponsors")
      .update(updatePayload)
      .eq("id", data.sponsorId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update sponsor: ${error.message}`);
    }

    return {
      id: updated.id,
      status: updated.status,
      adminNotes: updated.admin_notes,
    };
  });

// ── Internal Helpers ─────────────────────────────────────────────────────────

function getBaseUrl(): string {
  // In production this would come from env
  if (typeof process !== "undefined" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:8081";
}

async function sendSponsorEmails(
  supabase: any,
  sponsor: any,
  event: any
) {
  const eventTitle = event?.title || "Event";
  const eventDate = event?.date ? new Date(event.date).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  }) : "TBD";
  const eventVenue = event?.venue || "TBD";

  // Sponsor confirmation email (log)
  const sponsorSubject = `Payment Confirmed — ${sponsor.package_name} Sponsorship for ${eventTitle}`;
  const sponsorBody = `
Dear ${sponsor.contact_name},

Thank you for sponsoring "${eventTitle}" as a ${sponsor.package_name} Sponsor.

Transaction Reference: ${sponsor.payment_ref}
Amount Paid: ₦${Number(sponsor.package_price).toLocaleString()}
Event Date: ${eventDate}
Venue: ${eventVenue}

Your sponsorship package includes the benefits outlined on the event page.
We'll be in touch with event details closer to the date.

Contact us at gaspotechgraphic@gmail.com for any questions.

— Gaspo Studios Team
  `.trim();

  await supabase.from("email_log").insert({
    recipient: sponsor.contact_email,
    subject: sponsorSubject,
    body: sponsorBody,
    type: "sponsor_confirmation",
    reference_id: sponsor.id,
  });

  // Admin alert email (log)
  const adminSubject = `New Sponsor Payment — ${sponsor.company_name} • ₦${Number(sponsor.package_price).toLocaleString()}`;
  const adminBody = `
New sponsor payment received:

Event: ${eventTitle}
Sponsor: ${sponsor.company_name}
Contact: ${sponsor.contact_name} (${sponsor.contact_email})
Package: ${sponsor.package_name}
Amount: ₦${Number(sponsor.package_price).toLocaleString()}
Reference: ${sponsor.payment_ref}
Date: ${new Date().toLocaleString()}

View in admin: ${getBaseUrl()}/admin/events
  `.trim();

  await supabase.from("email_log").insert({
    recipient: "gaspotechgraphic@gmail.com",
    subject: adminSubject,
    body: adminBody,
    type: "admin_payment_alert",
    reference_id: sponsor.id,
  });
}
