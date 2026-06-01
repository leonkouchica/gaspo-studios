-- supabase/migrations/004_event_sponsors.sql
-- Event Sponsors & Enhanced Registrations System

-- 1. Event Sponsors table
CREATE TABLE IF NOT EXISTS public.event_sponsors (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id        TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    company_name    TEXT NOT NULL,
    contact_name    TEXT NOT NULL,
    contact_email   TEXT NOT NULL,
    contact_phone   TEXT NOT NULL,
    package_id      TEXT NOT NULL,
    package_name    TEXT NOT NULL,
    package_price   NUMERIC(12,2) NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'NGN',
    payment_ref     TEXT,
    payment_status  TEXT NOT NULL DEFAULT 'pending'
                    CHECK (payment_status IN ('pending','paid','failed','refunded')),
    paid_at         TIMESTAMPTZ,
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','cancelled','completed')),
    admin_notes     TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 2. Enhance event_registrations
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS registration_type TEXT NOT NULL DEFAULT 'participant'
      CHECK (registration_type IN ('participant','sponsor_guest','speaker','staff','vip')),
  ADD COLUMN IF NOT EXISTS linked_sponsor_id TEXT REFERENCES public.event_sponsors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS event_interest TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS confirmation_sent BOOLEAN DEFAULT false;

-- 3. Email log table
CREATE TABLE IF NOT EXISTS public.email_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient       TEXT NOT NULL,
    subject         TEXT NOT NULL,
    body            TEXT,
    type            TEXT NOT NULL
                    CHECK (type IN ('sponsor_confirmation','participant_confirmation',
                                    'admin_sponsor_alert','admin_payment_alert','check_in')),
    reference_id    TEXT,
    status          TEXT NOT NULL DEFAULT 'sent'
                    CHECK (status IN ('sent','failed','bounced')),
    sent_at         TIMESTAMPTZ DEFAULT now()
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_sponsors_event ON public.event_sponsors(event_id);
CREATE INDEX IF NOT EXISTS idx_event_sponsors_payment_ref ON public.event_sponsors(payment_ref);
CREATE INDEX IF NOT EXISTS idx_event_sponsors_status ON public.event_sponsors(payment_status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_type ON public.event_registrations(registration_type);
CREATE INDEX IF NOT EXISTS idx_event_registrations_sponsor ON public.event_registrations(linked_sponsor_id);
CREATE INDEX IF NOT EXISTS idx_email_log_ref ON public.email_log(reference_id);

-- 5. Updated_at trigger for event_sponsors (safe re-run)
DROP TRIGGER IF EXISTS set_event_sponsors_updated_at ON public.event_sponsors;
CREATE TRIGGER set_event_sponsors_updated_at
    BEFORE UPDATE ON public.event_sponsors
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. RLS policies for event_sponsors
ALTER TABLE public.event_sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage event_sponsors" ON public.event_sponsors;
CREATE POLICY "Admins can manage event_sponsors"
    ON public.event_sponsors
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin','editor')
    ));

-- Allow public insert for sponsor registration
DROP POLICY IF EXISTS "Public can insert event_sponsors" ON public.event_sponsors;
CREATE POLICY "Public can insert event_sponsors"
    ON public.event_sponsors
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- 7. RLS policies for email_log
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view email_log" ON public.email_log;
CREATE POLICY "Admins can view email_log"
    ON public.email_log
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin','editor')
    ));
