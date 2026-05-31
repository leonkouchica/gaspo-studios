-- supabase/migrations/002_rls_policies.sql
-- Row-Level Security Policies for Gaspo Studios

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = $1 AND user_roles.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if a user has a specific role or admin
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = $1 AND (user_roles.role = ANY(required_roles) OR user_roles.role = 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 1. user_roles Policies
-- Service role has full access automatically.
-- Admins can do everything.
CREATE POLICY "Admins have full access on user_roles" ON public.user_roles
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Users can read their own role.
CREATE POLICY "Users can read their own role" ON public.user_roles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);


-- 2. bookings Policies
-- Public can INSERT bookings (from the Book a Shoot page).
CREATE POLICY "Public can submit bookings" ON public.bookings
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Admins and staff with viewer/editor roles can read bookings.
CREATE POLICY "Staff can view bookings" ON public.bookings
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['admin', 'editor', 'viewer']));

-- Admins and editors can update/delete bookings.
CREATE POLICY "Staff can modify bookings" ON public.bookings
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['admin', 'editor']))
    WITH CHECK (public.has_role(auth.uid(), ARRAY['admin', 'editor']));


-- 3. blog_posts Policies
-- Public can SELECT published posts.
CREATE POLICY "Public can view published blog posts" ON public.blog_posts
    FOR SELECT TO anon, authenticated
    USING (status = 'published');

-- Staff can view all posts.
CREATE POLICY "Staff can view all blog posts" ON public.blog_posts
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['admin', 'editor', 'photographer', 'viewer']));

-- Admins and editors can insert/update/delete posts.
CREATE POLICY "Staff can manage blog posts" ON public.blog_posts
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['admin', 'editor']))
    WITH CHECK (public.has_role(auth.uid(), ARRAY['admin', 'editor']));


-- 4. gallery_images Policies
-- Public can SELECT visible images.
CREATE POLICY "Public can view visible gallery images" ON public.gallery_images
    FOR SELECT TO anon, authenticated
    USING (visible = true);

-- Staff can view all images.
CREATE POLICY "Staff can view all gallery images" ON public.gallery_images
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['admin', 'editor', 'photographer', 'viewer']));

-- Admins, editors, and photographers can upload/modify gallery images.
CREATE POLICY "Staff can manage gallery images" ON public.gallery_images
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['admin', 'editor', 'photographer']))
    WITH CHECK (public.has_role(auth.uid(), ARRAY['admin', 'editor', 'photographer']));


-- 5. events Policies
-- Public can SELECT published events.
CREATE POLICY "Public can view published events" ON public.events
    FOR SELECT TO anon, authenticated
    USING (status IN ('published', 'upcoming', 'ongoing', 'completed'));

-- Staff can view all events.
CREATE POLICY "Staff can view all events" ON public.events
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['admin', 'editor', 'viewer']));

-- Admins and editors can manage events.
CREATE POLICY "Staff can manage events" ON public.events
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['admin', 'editor']))
    WITH CHECK (public.has_role(auth.uid(), ARRAY['admin', 'editor']));


-- 6. event_registrations Policies
-- Public can register for events.
CREATE POLICY "Public can register for events" ON public.event_registrations
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Staff can view registrations.
CREATE POLICY "Staff can view event registrations" ON public.event_registrations
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['admin', 'editor', 'viewer']));

-- Admins and editors can update registrations.
CREATE POLICY "Staff can manage registrations" ON public.event_registrations
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['admin', 'editor']))
    WITH CHECK (public.has_role(auth.uid(), ARRAY['admin', 'editor']));


-- 7. contact_messages Policies
-- Public can submit contact messages.
CREATE POLICY "Public can submit contact messages" ON public.contact_messages
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Staff can view contact messages.
CREATE POLICY "Staff can view contact messages" ON public.contact_messages
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['admin', 'viewer']));

-- Staff (admins) can edit/delete messages.
CREATE POLICY "Admins can manage contact messages" ON public.contact_messages
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));


-- 8. payment_settings Policies
-- Private by default. Only accessible by admins.
CREATE POLICY "Admins have full access on payment_settings" ON public.payment_settings
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
