-- supabase/migrations/007_newsletter_subscribers.sql

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT UNIQUE NOT NULL,
    status          TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
    subscribed_at   TIMESTAMPTZ DEFAULT now(),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- RLS policies for newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Admins can manage all subscribers
DROP POLICY IF EXISTS "Admins can manage newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can manage newsletter_subscribers"
    ON public.newsletter_subscribers
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin','editor')
    ));

-- Public can subscribe
DROP POLICY IF EXISTS "Public can insert newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Public can insert newsletter_subscribers"
    ON public.newsletter_subscribers
    FOR INSERT
    TO anon
    WITH CHECK (true);
