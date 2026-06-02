// src/lib/actions/push.ts
// TanStack Start server functions for push notification management.
// These are callable from the client via TanStack RPC.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import {
  sendManualPushNotification,
  getSubscriberCounts,
} from "../push-notification.server.ts";
import { requireRole } from "../auth-guard.server.ts";

// ── Subscribe ────────────────────────────────────────────────────────────────

export const subscribeToPush = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      endpoint: z.string(),
      p256dhKey: z.string(),
      authKey: z.string(),
      channels: z.object({
        blogs: z.boolean(),
        events: z.boolean(),
      }),
      userAgent: z.string().optional(),
      deviceType: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    // Upsert by endpoint (UNIQUE constraint) to handle re-subscriptions
    const { data: existing, error: fetchErr } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("endpoint", data.endpoint)
      .maybeSingle();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      throw new Error(`Failed to check existing subscription: ${fetchErr.message}`);
    }

    if (existing) {
      const { error } = await supabase
        .from("push_subscriptions")
        .update({
          p256dh_key: data.p256dhKey,
          auth_key: data.authKey,
          channels: data.channels,
          user_agent: data.userAgent || null,
          device_type: data.deviceType || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) throw new Error(`Failed to update subscription: ${error.message}`);
      return { id: existing.id, action: "updated" };
    }

    const { data: inserted, error } = await supabase
      .from("push_subscriptions")
      .insert({
        endpoint: data.endpoint,
        p256dh_key: data.p256dhKey,
        auth_key: data.authKey,
        channels: data.channels,
        user_agent: data.userAgent || null,
        device_type: data.deviceType || null,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { action: "already_subscribed" };
      }
      throw new Error(`Failed to subscribe: ${error.message}`);
    }

    return { id: inserted.id, action: "created" };
  });

// ── Unsubscribe ──────────────────────────────────────────────────────────────

export const unsubscribeFromPush = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      endpoint: z.string(),
    })
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", data.endpoint);

    if (error) throw new Error(`Failed to unsubscribe: ${error.message}`);
    return { success: true };
  });

// ── Update Preferences ───────────────────────────────────────────────────────

export const updatePushPreferences = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      endpoint: z.string(),
      channels: z.object({
        blogs: z.boolean(),
        events: z.boolean(),
      }),
    })
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("push_subscriptions")
      .update({
        channels: data.channels,
        updated_at: new Date().toISOString(),
      })
      .eq("endpoint", data.endpoint);

    if (error) throw new Error(`Failed to update preferences: ${error.message}`);
    return { success: true };
  });

// ── Admin: Manual Send ───────────────────────────────────────────────────────

export const adminSendNotification = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      type: z.enum(["blog", "event", "manual"]),
      title: z.string().min(1),
      body: z.string().min(1),
      url: z.string().min(1),
      dateString: z.string().optional(),
      bypassRateLimit: z.boolean().default(false),
    })
  )
  .handler(async ({ data }) => {
    requireRole(["admin"]);

    const result = await sendManualPushNotification({
      type: data.type === "manual" ? "blog" : data.type,
      title: data.title,
      body: data.body,
      url: data.url,
      dateString: data.dateString,
      bypassRateLimit: data.bypassRateLimit,
    });

    return result;
  });

// ── Admin: Subscriber Stats ──────────────────────────────────────────────────

export const fetchSubscriberStats = createServerFn({ method: "GET" })
  .handler(async () => {
    requireRole(["admin"]);
    return getSubscriberCounts();
  });

// ── Admin: Recent Dispatch Log ───────────────────────────────────────────────

export const fetchDispatchLog = createServerFn({ method: "GET" })
  .inputValidator(
    (input: { limit?: number } | undefined) => input
  )
  .handler(async ({ data }) => {
    requireRole(["admin"]);
    const supabase = getSupabaseAdmin();
    const limit = data?.limit || 10;

    const { data: logs, error } = await supabase
      .from("push_dispatch_log")
      .select("*")
      .order("dispatched_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch dispatch log: ${error.message}`);
    return logs || [];
  });
