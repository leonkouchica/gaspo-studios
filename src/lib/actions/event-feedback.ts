import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { requireAuth } from "../auth-guard.server.ts";

export const eventFeedbackInputSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  fullName: z.string().trim().min(2, "Full name is required (minimum 2 characters)"),
  email: z.string().trim().email("A valid email address is required"),
  attendanceMode: z.enum(["in_person", "virtual"]).default("in_person"),
  overallRating: z.number().int().min(1).max(5),
  contentRating: z.number().int().min(1).max(5),
  organizationRating: z.number().int().min(1).max(5),
  venueRating: z.number().int().min(1).max(5),
  bestAspect: z.string().optional().default(""),
  improvementSuggestions: z.string().optional().default(""),
  futureTopics: z.string().optional().default(""),
  npsScore: z.number().int().min(0).max(10),
});

export type EventFeedbackInput = z.infer<typeof eventFeedbackInputSchema>;

export interface EventFeedbackItem {
  id: string;
  eventId: string;
  eventTitle?: string;
  fullName: string;
  email: string;
  attendanceMode: "in_person" | "virtual";
  overallRating: number;
  contentRating: number;
  organizationRating: number;
  venueRating: number;
  bestAspect: string;
  improvementSuggestions: string;
  futureTopics: string;
  npsScore: number;
  createdAt: string;
}

export interface EventFeedbackSummary {
  totalResponses: number;
  averageOverall: number;
  averageContent: number;
  averageOrganization: number;
  averageVenue: number;
  npsScore: number;
  promotersPct: number;
  passivesPct: number;
  detractorsPct: number;
  inPersonCount: number;
  virtualCount: number;
}

// ── Public: Submit Event Feedback ────────────────────────────────────────────
export const submitEventFeedback = createServerFn({ method: "POST" })
  .inputValidator(eventFeedbackInputSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    // Verify event exists (support either uuid/id or slug)
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id, title")
      .or(`id.eq.${data.eventId},slug.eq.${data.eventId}`)
      .single();

    if (eventErr || !event) {
      throw new Error("Event not found or invalid event ID.");
    }

    const { data: inserted, error: insertErr } = await supabase
      .from("event_feedback")
      .insert({
        event_id: event.id,
        full_name: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        attendance_mode: data.attendanceMode,
        overall_rating: data.overallRating,
        content_rating: data.contentRating,
        organization_rating: data.organizationRating,
        venue_rating: data.venueRating,
        best_aspect: data.bestAspect?.trim() || null,
        improvement_suggestions: data.improvementSuggestions?.trim() || null,
        future_topics: data.futureTopics?.trim() || null,
        nps_score: data.npsScore,
      })
      .select()
      .single();

    if (insertErr) {
      throw new Error(`Failed to submit feedback: ${insertErr.message}`);
    }

    return {
      success: true,
      id: inserted.id,
      eventTitle: event.title,
    };
  });

// ── Admin: Fetch Event Feedback & Analytics ──────────────────────────────────
export const fetchEventFeedback = createServerFn({ method: "GET" })
  .inputValidator(
    z
      .object({
        eventId: z.string().optional(),
      })
      .optional(),
  )
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("event_feedback")
      .select("*, events(title, slug)")
      .order("created_at", { ascending: false });

    if (data?.eventId && data.eventId !== "all") {
      // If a slug or ID was passed, resolve to event ID first
      const { data: matchedEvent } = await supabase
        .from("events")
        .select("id")
        .or(`id.eq.${data.eventId},slug.eq.${data.eventId}`)
        .single();

      if (matchedEvent) {
        query = query.eq("event_id", matchedEvent.id);
      } else {
        query = query.eq("event_id", data.eventId);
      }
    }

    const { data: rawList, error } = await query;
    if (error) {
      if (
        error.code === "PGRST205" ||
        error.message?.includes("schema cache") ||
        error.message?.includes("does not exist")
      ) {
        console.warn("event_feedback table not initialized yet in Supabase:", error.message);
        const summary: EventFeedbackSummary = {
          totalResponses: 0,
          averageOverall: 0,
          averageContent: 0,
          averageOrganization: 0,
          averageVenue: 0,
          npsScore: 0,
          promotersPct: 0,
          passivesPct: 0,
          detractorsPct: 0,
          inPersonCount: 0,
          virtualCount: 0,
        };
        return { summary, items: [] };
      }
      throw new Error(`Failed to load event feedback: ${error.message}`);
    }

    const items: EventFeedbackItem[] = (rawList || []).map((row: any) => ({
      id: row.id,
      eventId: row.event_id,
      eventTitle: row.events?.title || "Unknown Event",
      fullName: row.full_name || "Anonymous",
      email: row.email || "",
      attendanceMode: row.attendance_mode || "in_person",
      overallRating: row.overall_rating || 0,
      contentRating: row.content_rating || 0,
      organizationRating: row.organization_rating || 0,
      venueRating: row.venue_rating || 0,
      bestAspect: row.best_aspect || "",
      improvementSuggestions: row.improvement_suggestions || "",
      futureTopics: row.future_topics || "",
      npsScore: row.nps_score ?? 0,
      createdAt: row.created_at,
    }));

    const total = items.length;
    if (total === 0) {
      const summary: EventFeedbackSummary = {
        totalResponses: 0,
        averageOverall: 0,
        averageContent: 0,
        averageOrganization: 0,
        averageVenue: 0,
        npsScore: 0,
        promotersPct: 0,
        passivesPct: 0,
        detractorsPct: 0,
        inPersonCount: 0,
        virtualCount: 0,
      };
      return { summary, items: [] };
    }

    const sumOverall = items.reduce((s, it) => s + it.overallRating, 0);
    const sumContent = items.reduce((s, it) => s + it.contentRating, 0);
    const sumOrg = items.reduce((s, it) => s + it.organizationRating, 0);
    const sumVenue = items.reduce((s, it) => s + it.venueRating, 0);

    const promoters = items.filter((it) => it.npsScore >= 9).length;
    const passives = items.filter((it) => it.npsScore === 7 || it.npsScore === 8).length;
    const detractors = items.filter((it) => it.npsScore <= 6).length;

    const promotersPct = Math.round((promoters / total) * 100);
    const passivesPct = Math.round((passives / total) * 100);
    const detractorsPct = Math.round((detractors / total) * 100);
    const npsScore = promotersPct - detractorsPct;

    const inPersonCount = items.filter((it) => it.attendanceMode === "in_person").length;
    const virtualCount = items.filter((it) => it.attendanceMode === "virtual").length;

    const summary: EventFeedbackSummary = {
      totalResponses: total,
      averageOverall: Number((sumOverall / total).toFixed(1)),
      averageContent: Number((sumContent / total).toFixed(1)),
      averageOrganization: Number((sumOrg / total).toFixed(1)),
      averageVenue: Number((sumVenue / total).toFixed(1)),
      npsScore,
      promotersPct,
      passivesPct,
      detractorsPct,
      inPersonCount,
      virtualCount,
    };

    return { summary, items };
  });

// ── Admin: Delete Event Feedback ─────────────────────────────────────────────
export const deleteEventFeedback = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("event_feedback").delete().eq("id", data.id);
    if (error) {
      throw new Error(`Failed to delete feedback: ${error.message}`);
    }
    return { success: true };
  });
