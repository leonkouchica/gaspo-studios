-- supabase/migrations/006_push_subscriptions.sql
-- Push notification subscriptions with content channel preferences
-- Rate limiting columns included per implementation plan

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint        TEXT NOT NULL UNIQUE,
    p256dh_key      TEXT NOT NULL,
    auth_key        TEXT NOT NULL,
    channels        JSONB NOT NULL DEFAULT '{"blogs": false, "events": false}'::jsonb,
    user_agent      TEXT,
    device_type     TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    last_used_at    TIMESTAMPTZ DEFAULT now(),
    daily_push_count INT4 DEFAULT 0,
    daily_push_date  DATE,
    last_push_at     TIMESTAMPTZ
);

-- Index for channel-based queries (the most frequent query pattern)
CREATE INDEX IF NOT EXISTS idx_push_sub_channels_blogs
    ON public.push_subscriptions ((channels->>'blogs'))
    WHERE channels->>'blogs' = 'true';

CREATE INDEX IF NOT EXISTS idx_push_sub_channels_events
    ON public.push_subscriptions ((channels->>'events'))
    WHERE channels->>'events' = 'true';

-- Index on user_id for user-specific lookups
CREATE INDEX IF NOT EXISTS idx_push_sub_user_id ON public.push_subscriptions(user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER set_push_subscriptions_updated_at
    BEFORE UPDATE ON public.push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ── Push dispatch audit log ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.push_dispatch_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type    TEXT NOT NULL CHECK (content_type IN ('blog', 'event', 'manual')),
    content_id      TEXT,
    title           TEXT NOT NULL,
    url             TEXT NOT NULL,
    triggered_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    trigger_method  TEXT NOT NULL CHECK (trigger_method IN ('auto', 'manual', 'cron')),
    bypassed_rate_limit BOOLEAN DEFAULT false,
    subscribers_targeted INT4 DEFAULT 0,
    sent_count      INT4 DEFAULT 0,
    failed_count    INT4 DEFAULT 0,
    skipped_rate_limited INT4 DEFAULT 0,
    cleaned_count   INT4 DEFAULT 0,
    error_log       JSONB DEFAULT '[]'::jsonb,
    dispatched_at   TIMESTAMPTZ DEFAULT now()
);

-- ── RLS Policies ────────────────────────────────────────────────────────────

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_dispatch_log ENABLE ROW LEVEL SECURITY;

-- Public can insert (subscribe)
CREATE POLICY "Public can subscribe to push"
    ON public.push_subscriptions
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Users can update/delete their own subscriptions
CREATE POLICY "Users can manage own push subscriptions"
    ON public.push_subscriptions
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all subscriptions (for debugging/dispatch)
CREATE POLICY "Admins can view all push subscriptions"
    ON public.push_subscriptions
    FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

-- Admins can view dispatch log
CREATE POLICY "Admins can view dispatch log"
    ON public.push_dispatch_log
    FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

-- Server can insert dispatch log (service_role bypasses RLS)
CREATE POLICY "Server can insert dispatch log"
    ON public.push_dispatch_log
    FOR INSERT TO authenticated
    WITH CHECK (true);
