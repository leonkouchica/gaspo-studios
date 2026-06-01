-- supabase/migrations/003_enable_sponsorship_existing.sql
-- Enables sponsorship for all existing events that don't have it enabled yet.
-- Run this migration to make the Sponsor section visible on all event pages.

UPDATE public.events
SET sponsorship_enabled = true
WHERE sponsorship_enabled = false OR sponsorship_enabled IS NULL;
