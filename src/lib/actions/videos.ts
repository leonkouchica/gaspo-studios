import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { requireRole } from "../auth-guard.server.ts";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface YouTubeVideo {
  id: string;
  videoId: string;
  url: string;
  title: string;
  category: string;
  placements: string[];
  featured: boolean;
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelSettings {
  channelUrl: string;
  showSubscribeBanner: boolean;
  bannerText: string;
}

export type VideoCategory = "General" | "Weddings" | "Events" | "Corporate" | "BTS";
export type VideoPlacement = "homepage" | "gallery" | "about";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Extracts a YouTube video ID from any common YouTube URL format.
 * Supports: watch?v=, youtu.be/, /shorts/, /embed/, /v/
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // raw ID
  ];
  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Returns a YouTube thumbnail URL for a given video ID.
 */
export function getYouTubeThumbnail(
  videoId: string,
  quality: "maxresdefault" | "hqdefault" | "mqdefault" = "hqdefault",
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

function mapRow(row: Record<string, unknown>): YouTubeVideo {
  return {
    id: row.id as string,
    videoId: row.video_id as string,
    url: row.url as string,
    title: row.title as string,
    category: row.category as string,
    placements: (row.placements as string[]) ?? [],
    featured: row.featured as boolean,
    visible: row.visible as boolean,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ─── PUBLIC READS ─────────────────────────────────────────────────────────────

/** Fetch visible videos, optionally filtered by placement and/or category. */
export const fetchYouTubeVideos = createServerFn({ method: "GET" })
  .inputValidator(
    (
      input:
        | { placement?: VideoPlacement; category?: string; featuredOnly?: boolean }
        | undefined,
    ) => input,
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("youtube_videos")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (data?.placement) {
      query = query.contains("placements", [data.placement]);
    }

    if (data?.category && data.category !== "All") {
      query = query.eq("category", data.category);
    }

    if (data?.featuredOnly) {
      query = query.eq("featured", true);
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(`Failed to fetch YouTube videos: ${error.message}`);

    return (rows ?? []).map(mapRow);
  });

/** Fetch channel settings from homepage_content JSONB. */
export const fetchChannelSettings = createServerFn({ method: "GET" })
  .inputValidator((_: undefined) => _)
  .handler(async () => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("homepage_content")
      .select("content")
      .eq("id", "main")
      .single();

    if (error) {
      // No row yet — return defaults
      return {
        channelUrl: "",
        showSubscribeBanner: false,
        bannerText: "Watch more behind the scenes on our YouTube channel",
      } as ChannelSettings;
    }

    const channel = (data?.content as Record<string, unknown>)
      ?.youtube_channel as ChannelSettings | undefined;
    return {
      channelUrl: channel?.channelUrl ?? "",
      showSubscribeBanner: channel?.showSubscribeBanner ?? false,
      bannerText:
        channel?.bannerText ?? "Watch more behind the scenes on our YouTube channel",
    } as ChannelSettings;
  });

// ─── ADMIN MUTATIONS ──────────────────────────────────────────────────────────

/** Upsert a YouTube video (create or update). */
export const upsertYouTubeVideo = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().uuid().optional(),
      url: z.string().url("Please enter a valid YouTube URL"),
      videoId: z.string().min(11, "Could not extract a valid video ID"),
      title: z.string().min(1, "Title is required").max(200),
      category: z.enum(["General", "Weddings", "Events", "Corporate", "BTS"]),
      placements: z
        .array(z.enum(["homepage", "gallery", "about"]))
        .min(1, "Select at least one placement"),
      featured: z.boolean().default(false),
      visible: z.boolean().default(true),
      sortOrder: z.number().int().default(0),
    }),
  )
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();

    const payload = {
      video_id: data.videoId,
      url: data.url,
      title: data.title,
      category: data.category,
      placements: data.placements,
      featured: data.featured,
      visible: data.visible,
      sort_order: data.sortOrder,
    };

    if (data.id) {
      const { data: updated, error } = await supabase
        .from("youtube_videos")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update video: ${error.message}`);
      return mapRow(updated as Record<string, unknown>);
    } else {
      const { data: inserted, error } = await supabase
        .from("youtube_videos")
        .insert(payload)
        .select()
        .single();

      if (error) throw new Error(`Failed to create video: ${error.message}`);
      return mapRow(inserted as Record<string, unknown>);
    }
  });

/** Toggle a video's visibility. */
export const toggleVideoVisibility = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid(), visible: z.boolean() }))
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();
    const { data: updated, error } = await supabase
      .from("youtube_videos")
      .update({ visible: data.visible })
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to toggle visibility: ${error.message}`);
    return mapRow(updated as Record<string, unknown>);
  });

/** Toggle a video's featured status. */
export const toggleVideoFeatured = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid(), featured: z.boolean() }))
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();
    const { data: updated, error } = await supabase
      .from("youtube_videos")
      .update({ featured: data.featured })
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to toggle featured: ${error.message}`);
    return mapRow(updated as Record<string, unknown>);
  });

/** Delete a YouTube video record. */
export const deleteYouTubeVideo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("youtube_videos")
      .delete()
      .eq("id", data.id);

    if (error) throw new Error(`Failed to delete video: ${error.message}`);
    return { success: true };
  });

/** Update the YouTube channel settings inside homepage_content JSONB. */
export const updateChannelSettings = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      channelUrl: z.string(),
      showSubscribeBanner: z.boolean(),
      bannerText: z.string().max(200),
    }),
  )
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();

    // Merge into existing JSONB content
    const { data: existing } = await supabase
      .from("homepage_content")
      .select("content")
      .eq("id", "main")
      .single();

    const currentContent = (existing?.content as Record<string, unknown>) ?? {};
    const updated = {
      ...currentContent,
      youtube_channel: {
        channelUrl: data.channelUrl,
        showSubscribeBanner: data.showSubscribeBanner,
        bannerText: data.bannerText,
      },
    };

    const { error } = await supabase
      .from("homepage_content")
      .upsert({ id: "main", content: updated });

    if (error) throw new Error(`Failed to update channel settings: ${error.message}`);
    return { success: true };
  });

/** Fetch all videos for the admin panel (includes hidden). */
export const fetchAllYouTubeVideosAdmin = createServerFn({ method: "GET" })
  .inputValidator((_: undefined) => _)
  .handler(async () => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();
    const { data: rows, error } = await supabase
      .from("youtube_videos")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch videos: ${error.message}`);
    return (rows ?? []).map(mapRow);
  });
