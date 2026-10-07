-- supabase/migrations/011_event_feedback.sql
-- Event Feedback & Survey System for Gaspo Studios

CREATE TABLE IF NOT EXISTS public.event_feedback (
    id                      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id                TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    full_name               TEXT,
    email                   TEXT,
    attendance_mode         TEXT NOT NULL DEFAULT 'in_person'
                            CHECK (attendance_mode IN ('in_person', 'virtual')),
    overall_rating          INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    content_rating          INT NOT NULL CHECK (content_rating BETWEEN 1 AND 5),
    organization_rating     INT NOT NULL CHECK (organization_rating BETWEEN 1 AND 5),
    venue_rating            INT NOT NULL CHECK (venue_rating BETWEEN 1 AND 5),
    best_aspect             TEXT,
    improvement_suggestions TEXT,
    future_topics           TEXT,
    nps_score               INT NOT NULL CHECK (nps_score BETWEEN 0 AND 10),
    created_at              TIMESTAMPTZ DEFAULT now()
);

-- Indexes for querying by event
CREATE INDEX IF NOT EXISTS idx_event_feedback_event_id ON public.event_feedback(event_id);
CREATE INDEX IF NOT EXISTS idx_event_feedback_created_at ON public.event_feedback(created_at DESC);

-- Enable RLS
ALTER TABLE public.event_feedback ENABLE ROW LEVEL SECURITY;

-- Policies:
-- 1. Anyone (public attendees) can submit feedback
DROP POLICY IF EXISTS "Allow public insert to event_feedback" ON public.event_feedback;
CREATE POLICY "Allow public insert to event_feedback"
    ON public.event_feedback FOR INSERT
    WITH CHECK (true);

-- 2. Authenticated users (admins) can view and manage feedback
DROP POLICY IF EXISTS "Allow authenticated read to event_feedback" ON public.event_feedback;
CREATE POLICY "Allow authenticated read to event_feedback"
    ON public.event_feedback FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete to event_feedback" ON public.event_feedback;
CREATE POLICY "Allow authenticated delete to event_feedback"
    ON public.event_feedback FOR DELETE
    TO authenticated
    USING (true);
