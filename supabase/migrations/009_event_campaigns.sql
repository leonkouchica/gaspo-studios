-- ─── Migration 009: Event Campaign Tables ──────────────────────────────────
-- Creates:
--   • event_campaigns       — one record per email campaign (per event)
--   • campaign_recipients   — one record per recipient per campaign send
--
-- NOTE: events.id and event_registrations.id are TEXT in this project,
--       so all PKs and FKs use TEXT accordingly.

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: event_campaigns
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_campaigns (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id         TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Campaign identity
  name             TEXT NOT NULL,
  template_type    TEXT NOT NULL CHECK (template_type IN (
                     'registration_confirmation',
                     'pre_event_appreciation',
                     'post_event_thank_you',
                     'new_registration_notification',
                     'custom'
                   )),
  subject          TEXT NOT NULL,
  custom_body_html TEXT,           -- optional admin-edited HTML override

  -- Delivery
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                     'draft', 'scheduled', 'queued',
                     'sending', 'sent', 'partially_sent', 'failed', 'cancelled'
                   )),
  scheduled_at     TIMESTAMPTZ,    -- null = send immediately
  sent_at          TIMESTAMPTZ,

  -- Metrics (snapshot at send time)
  total_recipients INT DEFAULT 0,
  success_count    INT DEFAULT 0,
  fail_count       INT DEFAULT 0,

  -- Audit
  created_by       TEXT,           -- auth user id (text to avoid auth dependency)
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: campaign_recipients
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  campaign_id      TEXT NOT NULL REFERENCES event_campaigns(id) ON DELETE CASCADE,
  registration_id  TEXT NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,

  -- Snapshots (captured at send time so report stays accurate even if reg is edited)
  email            TEXT NOT NULL,
  full_name        TEXT NOT NULL,

  -- Per-recipient delivery
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                     'pending', 'sent', 'failed', 'bounced'
                   )),
  sent_at          TIMESTAMPTZ,
  error_message    TEXT,           -- populated on failure

  UNIQUE(campaign_id, registration_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_event_campaigns_event_id
  ON event_campaigns(event_id);

CREATE INDEX IF NOT EXISTS idx_event_campaigns_status
  ON event_campaigns(status);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id
  ON campaign_recipients(campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status
  ON campaign_recipients(campaign_id, status);

-- ─────────────────────────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at trigger
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_event_campaigns_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_event_campaigns_updated_at ON event_campaigns;
CREATE TRIGGER trg_event_campaigns_updated_at
  BEFORE UPDATE ON event_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_event_campaigns_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE event_campaigns    ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Admins (service_role bypasses RLS automatically — these policies cover authenticated users)
CREATE POLICY "Admins can manage event_campaigns"
  ON event_campaigns FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage campaign_recipients"
  ON campaign_recipients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
