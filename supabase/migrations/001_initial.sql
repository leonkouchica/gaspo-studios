-- supabase/migrations/001_initial.sql
-- Gaspo Studios Initial Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'photographer', 'viewer')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service TEXT NOT NULL,
    package TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'confirmed', 'completed', 'cancelled')),
    submitted_at TIMESTAMPTZ DEFAULT now(),
    admin_notes TEXT,
    total_value INT8 NOT NULL DEFAULT 0
);

-- 3. blog_posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}'::text[],
    author_name TEXT NOT NULL,
    author_avatar TEXT NOT NULL,
    author_role TEXT NOT NULL,
    featured_image TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    published_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    views INT4 DEFAULT 0,
    comments INT4 DEFAULT 0,
    seo_title TEXT NOT NULL,
    seo_description TEXT NOT NULL,
    seo_og_image TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. gallery_images
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    src TEXT NOT NULL,
    title TEXT NOT NULL,
    alt TEXT NOT NULL,
    category TEXT NOT NULL,
    visible BOOLEAN DEFAULT true,
    display_order INT4 DEFAULT 0,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- 5. events
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    objectives TEXT[] DEFAULT '{}'::text[],
    outcomes TEXT[] DEFAULT '{}'::text[],
    topics TEXT[] DEFAULT '{}'::text[],
    target_audience TEXT,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('physical', 'virtual', 'hybrid')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'upcoming', 'ongoing', 'completed', 'cancelled', 'archived')),
    date TIMESTAMPTZ NOT NULL,
    time TEXT NOT NULL,
    end_time TEXT,
    venue TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    map_embed_url TEXT,
    banner_image TEXT NOT NULL,
    gallery_images TEXT[] DEFAULT '{}'::text[],
    speakers JSONB DEFAULT '[]'::jsonb,
    agenda JSONB DEFAULT '[]'::jsonb,
    sponsor_packages JSONB DEFAULT '[]'::jsonb,
    sponsorship_enabled BOOLEAN DEFAULT false,
    registration_open BOOLEAN DEFAULT true,
    registration_deadline TIMESTAMPTZ,
    capacity INT4,
    registration_count INT4 DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    seo JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. event_registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company TEXT NOT NULL,
    job_title TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    linkedin TEXT,
    how_heard TEXT NOT NULL,
    ticket_type TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    registered_at TIMESTAMPTZ DEFAULT now(),
    qr_code TEXT,
    checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMPTZ
);

-- 7. contact_messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    read BOOLEAN DEFAULT false
);

-- 8. payment_settings
CREATE TABLE IF NOT EXISTS public.payment_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway TEXT NOT NULL UNIQUE CHECK (gateway IN ('paystack', 'flutterwave')),
    public_key TEXT,
    secret_key TEXT,
    webhook_url TEXT,
    active BOOLEAN DEFAULT false,
    test_mode BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Helper triggers to automatically update public.user_roles on auth.users deletion (already configured via foreign key, but let's make sure updated_at timestamps are handled nicely)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
