/**
 * Campaign processor — server-only module.
 *
 * Contains `executeCampaignSend` and `processScheduledCampaigns`.
 * The `.server.ts` suffix ensures Vite never bundles this into the client.
 * These functions are called from:
 *   - sendEventCampaign (createServerFn in events.ts) for immediate sends
 *   - The Vercel Cron endpoint for processing scheduled campaigns
 */
import * as React from "react";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { sendAppEmail } from "../resend.server.ts";
import EventRegistrationEmail from "../../emails/EventRegistrationEmail.tsx";
import PreEventAppreciationEmail from "../../emails/PreEventAppreciationEmail.tsx";
import PostEventThankYouEmail from "../../emails/PostEventThankYouEmail.tsx";
import CampaignBroadcastEmail from "../../emails/CampaignBroadcastEmail.tsx";

/**
 * Executes the actual email send for a campaign.
 * Reads pending recipients from `campaign_recipients`, sends emails,
 * and updates statuses. Used by both immediate sends and the cron processor.
 */
export async function executeCampaignSend(
  campaignId: string,
  eventId: string,
): Promise<{ successCount: number; failCount: number; status: string }> {
  const supabase = getSupabaseAdmin();

  // Fetch campaign
  const { data: campaign, error: campErr } = await supabase
    .from("event_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();
  if (campErr || !campaign) throw new Error("Campaign not found.");

  // Fetch event
  const { data: event, error: eventErr } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();
  if (eventErr || !event) throw new Error("Event not found.");

  // Fetch pending recipients from campaign_recipients
  const { data: pendingRecipients, error: recipErr } = await supabase
    .from("campaign_recipients")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("status", "pending");
  if (recipErr) throw new Error(`Failed to fetch recipients: ${recipErr.message}`);
  if (!pendingRecipients || pendingRecipients.length === 0)
    throw new Error("No pending recipients found for this campaign.");

  // Mark as sending
  await supabase
    .from("event_campaigns")
    .update({ status: "sending", total_recipients: pendingRecipients.length })
    .eq("id", campaignId);

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

  for (const recipient of pendingRecipients) {
    let reactElement: React.ReactElement;
    const firstName = (recipient.full_name || "Attendee").split(" ")[0];

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
          attendeeId: recipient.registration_id,
          fullName: recipient.full_name,
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

    try {
      await sendAppEmail({
        to: recipient.email,
        subject: campaign.subject,
        react: reactElement,
      });

      await supabase
        .from("campaign_recipients")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", recipient.id);

      successCount++;
    } catch (err: any) {
      console.error(`Campaign send failed for ${recipient.email}:`, err);
      await supabase
        .from("campaign_recipients")
        .update({ status: "failed", error_message: err.message || "Unknown error" })
        .eq("id", recipient.id);
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
    .eq("id", campaignId);

  return { successCount, failCount, status: finalStatus };
}

/**
 * Processes all due scheduled campaigns. Called by the Vercel Cron endpoint.
 * Queries for campaigns where status='scheduled' AND scheduled_at <= NOW(),
 * then executes each one.
 */
export async function processScheduledCampaigns(): Promise<{
  processed: number;
  results: Array<{ campaignId: string; eventId: string; status: string; error?: string }>;
}> {
  const supabase = getSupabaseAdmin();

  // Find all campaigns that are due
  const { data: dueCampaigns, error } = await supabase
    .from("event_campaigns")
    .select("id, event_id, name")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString());

  if (error) throw new Error(`Failed to query scheduled campaigns: ${error.message}`);
  if (!dueCampaigns || dueCampaigns.length === 0) {
    return { processed: 0, results: [] };
  }

  const results: Array<{ campaignId: string; eventId: string; status: string; error?: string }> = [];

  for (const campaign of dueCampaigns) {
    try {
      console.log(`[Cron] Processing scheduled campaign: "${campaign.name}" (${campaign.id})`);
      const result = await executeCampaignSend(campaign.id, campaign.event_id);
      results.push({
        campaignId: campaign.id,
        eventId: campaign.event_id,
        status: result.status,
      });
      console.log(`[Cron] Campaign "${campaign.name}" completed: ${result.successCount} sent, ${result.failCount} failed`);
    } catch (err: any) {
      console.error(`[Cron] Campaign "${campaign.name}" (${campaign.id}) failed:`, err);
      // Mark the campaign as failed so it doesn't retry indefinitely
      await supabase
        .from("event_campaigns")
        .update({ status: "failed" })
        .eq("id", campaign.id);
      results.push({
        campaignId: campaign.id,
        eventId: campaign.event_id,
        status: "failed",
        error: err.message || "Unknown error",
      });
    }
  }

  return { processed: dueCampaigns.length, results };
}
