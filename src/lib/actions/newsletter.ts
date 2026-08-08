import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { sendAppEmail } from "../resend.server.ts";
import NewsletterWelcomeEmail from "../../emails/NewsletterWelcomeEmail.tsx";
import NewsletterBroadcastEmail from "../../emails/NewsletterBroadcastEmail.tsx";
import { requireAuth, requireRole } from "../auth-guard.server.ts";
import * as React from "react";
import { zeptoMailBatchSend } from "../resend.server.ts";
import { render } from "@react-email/components";

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
    }),
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    // 1. Save to Database
    // Note: Assuming a 'newsletter_subscribers' table exists.
    // If it doesn't, we still send the email for the prototype.
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: data.email,
      subscribed_at: new Date().toISOString(),
      status: "subscribed",
    });

    // Ignore error if table doesn't exist yet, we still want to test the email
    if (
      error &&
      !error.message.includes("does not exist") &&
      !error.message.includes("Could not find the table")
    ) {
      throw new Error(`Failed to subscribe: ${error.message}`);
    }

    // 2. Send Welcome Email via Resend
    const result = await sendAppEmail({
      to: data.email,
      subject: "Welcome to Gaspo Studios!",
      react: React.createElement(NewsletterWelcomeEmail),
    });

    if (!result.success) {
      console.error("Resend Error:", result.error);
      throw new Error(
        `Failed to send welcome email: ${result.error?.message || "Unknown Resend error"}`,
      );
    }

    return { success: true };
  });

export const fetchSubscribers = createServerFn({ method: "GET" }).handler(async () => {
  requireAuth();
  const supabase = getSupabaseAdmin();

  const { data: subscribers, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });

  if (
    error &&
    !error.message.includes("does not exist") &&
    !error.message.includes("Could not find the table")
  ) {
    throw new Error(`Failed to fetch subscribers: ${error.message}`);
  }

  return (subscribers || []).map((sub: any) => ({
    id: sub.id,
    email: sub.email,
    status: sub.status,
    subscribedAt: sub.subscribed_at,
  }));
});

export const deleteSubscriber = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", data.id);

    if (error) {
      throw new Error(`Failed to delete subscriber: ${error.message}`);
    }
    return { success: true };
  });

export const broadcastNewsletter = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      subject: z.string().min(1),
      content: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();

    // Fetch all active subscribers
    const { data: subscribers, error } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("status", "subscribed");

    if (error) {
      throw new Error(`Failed to fetch subscribers for broadcast: ${error.message}`);
    }

    if (!subscribers || subscribers.length === 0) {
      throw new Error("No active subscribers found.");
    }

    // Chunk into batches of 50 to stay within Resend batch limits
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
        subject: data.subject,
        content: data.content,
      }),
    );

    // Process batches
    for (const batch of batches) {
      const payload = batch.map((email) => ({
        from: "Gaspo Studios <hello@gaspostudios.com>",
        to: email,
        subject: data.subject,
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

    // Log the broadcast in email_log
    await supabase.from("email_log").insert({
      recipient: `Broadcast to ${emails.length} subscribers`,
      subject: data.subject,
      body: `Success: ${successCount}, Failed: ${failCount}`,
      type: "newsletter_broadcast",
    });

    if (failCount > 0 && successCount === 0) {
      throw new Error("Failed to send broadcast to all subscribers.");
    }

    return { success: true, successCount, failCount };
  });

export const importSubscribers = createServerFn({ method: "POST" })
  .inputValidator(z.object({ emails: z.array(z.string().email()) }))
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();

    const { emails } = data;
    if (!emails || emails.length === 0) {
      return { success: true, count: 0 };
    }

    const payload = emails.map((email) => ({
      email,
      status: "subscribed",
    }));

    // Upsert emails into the database
    // onConflict: "email" ensures that if they already exist, we update their status to "subscribed"
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(payload, { onConflict: "email" });

    if (error) {
      throw new Error(`Failed to import subscribers: ${error.message}`);
    }

    return { success: true, count: emails.length };
  });
