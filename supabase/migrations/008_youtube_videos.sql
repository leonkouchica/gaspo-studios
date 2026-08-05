-- supabase/migrations/008_youtube_videos.sql
-- YouTube Video CMS — stores embeddable YouTube videos and channel settings

-- ─── YOUTUBE VIDEOS TABLE ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.youtube_videos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id    TEXT NOT NULL,                        -- Extracted YouTube video ID
    url         TEXT NOT NULL,                        -- Original URL pasted by admin
    title       TEXT NOT NULL DEFAULT '',
    category    TEXT NOT NULL DEFAULT 'General',      -- Weddings | Events | Corporate | BTS | General
    placements  TEXT[] NOT NULL DEFAULT '{}',         -- e.g. ['homepage', 'gallery', 'about']
    featured    BOOLEAN NOT NULL DEFAULT false,
    visible     BOOLEAN NOT NULL DEFAULT true,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Trigger for updated_at
CREATE TRIGGER set_youtube_videos_updated_at
    BEFORE UPDATE ON public.youtube_videos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

-- Admins and editors can manage videos
CREATE POLICY "Admins can manage youtube_videos"
    ON public.youtube_videos
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin', 'editor')
    ));

-- Public can read visible videos
CREATE POLICY "Public can read visible youtube_videos"
    ON public.youtube_videos
    FOR SELECT
    TO anon
    USING (visible = true);

-- ─── YOUTUBE CHANNEL SETTINGS ────────────────────────────────────────────────
-- Stored as a single row in site_settings (key/value pattern)
-- We use the existing homepage_content table for channel config
-- to avoid a separate table for a simple setting.
--
-- Channel config is stored under the 'youtube_channel' key in the
-- homepage_content JSONB. No separate migration needed for that.

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_youtube_videos_visible
    ON public.youtube_videos (visible);

CREATE INDEX IF NOT EXISTS idx_youtube_videos_placements
    ON public.youtube_videos USING GIN (placements);

CREATE INDEX IF NOT EXISTS idx_youtube_videos_sort_order
    ON public.youtube_videos (sort_order ASC);
