// src/lib/push-notification.server.ts
// Server-side push notification dispatcher.
// Queries Supabase for subscribers, sends via web-push, handles cleanup.

import webpush from "web-push";
import { getSupabaseAdmin } from "./supabase.server.ts";
import { serverEnv } from "./env.server.ts";

// ── Types ────────────────────────────────────────────────────────────────────

export interface NotificationTarget {
  type: "blog" | "event";
  title: string;
  body: string;
  url: string;
  dateString?: string;
}

export interface DispatchResult {
  sent: number;
  failed: number;
  skippedRateLimited: number;
  cleaned: number;
  errors: string[];
}

// ── VAPID Configuration ──────────────────────────────────────────────────────

function getVapidKeys() {
  const publicKey = serverEnv.VITE_VAPID_PUBLIC_KEY;
  const privateKey = serverEnv.VAPID_PRIVATE_KEY;
  const subject = serverEnv.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    return null;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return { publicKey, privateKey, subject };
}

// ── Core Dispatcher ──────────────────────────────────────────────────────────

export async function sendPushNotifications(
  target: NotificationTarget,
  options?: { bypassRateLimit?: boolean }
): Promise<DispatchResult> {
  const vapid = getVapidKeys();
  if (!vapid) {
    console.warn("Push notifications skipped: VAPID keys not configured.");
    return { sent: 0, failed: 0, skippedRateLimited: 0, cleaned: 0, errors: ["VAPID keys not configured"] };
  }

  const supabase = getSupabaseAdmin();
  const channelField = target.type === "blog" ? "blogs" : "events";
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD in UTC
  const bypass = options?.bypassRateLimit ?? false;

  // 1. Query subscribers for this channel, applying rate limits unless bypassed
  let query = supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh_key, auth_key, daily_push_count, daily_push_date");

  // Filter by channel preference
  query = query.filter(`channels->>'${channelField}'`, "eq", "true");

  if (!bypass) {
    // Exclude subscribers who hit global daily cap (3)
    query = query.or(
      `daily_push_date.neq.${today},daily_push_count.lt.3`
    );
  }

  const { data: subscribers, error: queryErr } = await query;

  if (queryErr) {
    console.error("Failed to query push subscribers:", queryErr);
    return { sent: 0, failed: 0, skippedRateLimited: 0, cleaned: 0, errors: [queryErr.message] };
  }

  if (!subscribers || subscribers.length === 0) {
    return { sent: 0, failed: 0, skippedRateLimited: 0, cleaned: 0, errors: [] };
  }

  // 2. Build the push payload
  const payload = JSON.stringify({
    title: target.title,
    body: target.body,
    url: target.url,
    contentType: target.type,
    eventDate: target.dateString,
  });

  // 3. Dispatch to all subscribers
  let sent = 0;
  let failed = 0;
  let skippedRateLimited = 0;
  let cleaned = 0;
  const errors: string[] = [];

  const pushPromises = subscribers.map(async (sub) => {
    // Per-subscriber rate limit check (1 per channel per day)
    if (!bypass && sub.daily_push_date === today && sub.daily_push_count >= 3) {
      skippedRateLimited++;
      return;
    }

    const subscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh_key,
        auth: sub.auth_key,
      },
    };

    try {
      await webpush.sendNotification(subscription, payload);

      // Update rate limit counters
      const newCount = sub.daily_push_date === today ? (sub.daily_push_count || 0) + 1 : 1;
      await supabase
        .from("push_subscriptions")
        .update({
          daily_push_count: newCount,
          daily_push_date: today,
          last_push_at: new Date().toISOString(),
          last_used_at: new Date().toISOString(),
        })
        .eq("id", sub.id);

      sent++;
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Clean up expired/uninstalled subscriptions
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("id", sub.id);
        cleaned++;
      } else {
        failed++;
        errors.push(`Sub ${sub.id}: ${err.message || "Unknown error"}`);
      }
    }
  });

  await Promise.all(pushPromises);

  // 4. Log the dispatch
  await supabase.from("push_dispatch_log").insert({
    content_type: target.type,
    title: target.title,
    url: target.url,
    trigger_method: "auto",
    bypassed_rate_limit: bypass,
    subscribers_targeted: subscribers.length,
    sent_count: sent,
    failed_count: failed,
    skipped_rate_limited: skippedRateLimited,
    cleaned_count: cleaned,
    error_log: errors,
  });

  console.log(
    `[Push] Dispatched "${target.type}" notification: ${sent} sent, ${failed} failed, ${skippedRateLimited} rate-limited, ${cleaned} cleaned`
  );

  return { sent, failed, skippedRateLimited, cleaned, errors };
}

// ── Manual Admin Dispatch ────────────────────────────────────────────────────

export async function sendManualPushNotification(
  target: NotificationTarget & { triggeredBy?: string; bypassRateLimit?: boolean }
): Promise<DispatchResult> {
  const result = await sendPushNotifications(target, {
    bypassRateLimit: target.bypassRateLimit ?? false,
  });

  // Override the trigger method in the log for manual sends
  const supabase = getSupabaseAdmin();
  await supabase.from("push_dispatch_log").insert({
    content_type: target.type === "blog" ? "blog" : target.type === "event" ? "event" : "manual",
    title: target.title,
    url: target.url,
    triggered_by: target.triggeredBy || null,
    trigger_method: "manual",
    bypassed_rate_limit: target.bypassRateLimit ?? false,
    subscribers_targeted: 0,
    sent_count: result.sent,
    failed_count: result.failed,
    skipped_rate_limited: result.skippedRateLimited,
    cleaned_count: result.cleaned,
    error_log: result.errors,
  });

  return result;
}

// ── Subscriber Count ─────────────────────────────────────────────────────────

export async function getSubscriberCounts(): Promise<{
  total: number;
  blogs: number;
  events: number;
}> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("channels");

  if (error || !data) {
    return { total: 0, blogs: 0, events: 0 };
  }

  const total = data.length;
  const blogs = data.filter((s) => s.channels?.blogs === true).length;
  const events = data.filter((s) => s.channels?.events === true).length;

  return { total, blogs, events };
}
