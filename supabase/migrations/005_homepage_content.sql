-- supabase/migrations/005_homepage_content.sql
-- Homepage CMS — stores editable homepage content as JSON

CREATE TABLE IF NOT EXISTS public.homepage_content (
    id          TEXT PRIMARY KEY DEFAULT 'main',
    content     JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at  TIMESTAMPTZ DEFAULT now(),
    updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Trigger for updated_at
CREATE TRIGGER set_homepage_content_updated_at
    BEFORE UPDATE ON public.homepage_content
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage homepage_content"
    ON public.homepage_content
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin','editor')
    ));

-- Allow public read
CREATE POLICY "Public can read homepage_content"
    ON public.homepage_content
    FOR SELECT
    TO anon
    USING (true);

-- Seed with current homepage content from src/data/homepage.ts
INSERT INTO public.homepage_content (id, content) VALUES ('main', $${
  "heroSlides": [
    {
      "id": "slide-1",
      "label": "Weddings & Portraits",
      "headline": "Where Every Frame Tells Your Story",
      "sub": "Premium photography for life's most meaningful milestones",
      "body": "From the intimate exchange of rings to the quiet pride of a graduation cap — we believe every chapter of your story deserves to be captured with artistry, intention, and heart.",
      "img": "/images/wedding_couple.webp",
      "cta1": { "label": "Book a Session", "to": "/book" },
      "cta2": { "label": "Explore Gallery", "to": "/gallery" }
    },
    {
      "id": "slide-2",
      "label": "Commercial Photography",
      "headline": "Brand Visuals That Command Attention",
      "sub": "Corporate headshots, product shoots, and event coverage",
      "body": "From boardroom portraits to large-scale corporate events, we deliver crisp, professional imagery that elevates your brand identity and builds trust with your audience.",
      "img": "/images/commercial_brand.webp",
      "cta1": { "label": "Corporate Enquiries", "to": "/contact" },
      "cta2": { "label": "View Portfolio", "to": "/gallery" }
    }
  ],
  "about": {
    "eyebrow": "About Gaspo Studios",
    "headline": "Artistry Meets Precision",
    "body": "At Gaspo Studios, we don't just take photographs — we craft visual legacies. Founded on the belief that every moment matters, our team blends technical expertise with an artist's eye to deliver imagery that resonates, inspires, and endures. Whether it's the soft glow of a wedding portrait, the decisive energy of a corporate event, or the thoughtful composition of a brand campaign, we bring the same dedication and attention to detail to every frame. Our studio is equipped with cutting-edge gear and post-production tools, but our greatest asset remains the trust our clients place in us.",
    "image": "/images/team_founder.webp",
    "experienceBadge": "10+ Years of Experience",
    "stats": [
      { "id": "stat-1", "value": "200+", "label": "Weddings" },
      { "id": "stat-2", "value": "150+", "label": "Corporate Events" },
      { "id": "stat-3", "value": "500+", "label": "Portrait Sessions" },
      { "id": "stat-4", "value": "50+", "label": "Brand Campaigns" }
    ],
    "featureCards": [
      { "id": "card-1", "icon": "Camera", "title": "Professional Gear", "desc": "Full-frame bodies, prime & zoom lenses, studio & portable lighting" },
      { "id": "card-2", "icon": "Palette", "title": "Expert Post-Production", "desc": "Professional colour grading, retouching, and creative editing in our in-house suite" },
      { "id": "card-3", "icon": "Clock", "title": "Timely Delivery", "desc": "Edited galleries delivered within 7-10 business days — faster for corporate clients" }
    ]
  },
  "services": {
    "eyebrow": "Our Services",
    "headline": "Integrated Photography Solutions",
    "subtext": "From intimate portraits to large-scale commercial campaigns — one studio, every story told perfectly.",
    "cards": [
      { "id": "svc-1", "icon": "Camera", "title": "Wedding Photography", "img": "/images/wedding_couple.webp", "desc": "Full-day coverage, pre-wedding shoots, cinematic albums, and highlight reels. Every laugh, every tear, every glance — documented forever." },
      { "id": "svc-2", "icon": "Building2", "title": "Corporate & Events", "img": "/images/corporate_headshot.webp", "desc": "Conferences, product launches, award ceremonies, and executive headshots. Professional imagery that reflects your brand's standard." },
      { "id": "svc-3", "icon": "User", "title": "Portrait Sessions", "img": "/images/portrait_creative.webp", "desc": "Individual, couple, family, and graduation portraits in-studio or on location. We'll help you feel at ease in front of the lens." },
      { "id": "svc-4", "icon": "ShoppingBag", "title": "Commercial & Brand", "img": "/images/commercial_brand.webp", "desc": "Product photography, look-books, food & beverage styling, and social media content. Visual assets that drive engagement and sales." }
    ]
  },
  "gallery": {
    "eyebrow": "Our Work",
    "headline": "Moments We've Framed",
    "body": "A curated selection from weddings, corporate events, portrait sessions, and commercial campaigns across Nigeria.",
    "mainImage": "/images/wedding_couple.webp",
    "thumbnails": [
      "/images/wedding_couple.webp",
      "/images/corporate_headshot.webp",
      "/images/portrait_creative.webp",
      "/images/commercial_brand.webp"
    ]
  },
  "bookingCta": {
    "headline": "Ready to Create Something Beautiful?",
    "body": "Whether it's your wedding day, a corporate event, or a brand campaign — let's capture it with precision and artistry. Our team is ready to bring your vision to life.",
    "buttonLabel": "Book a Shoot",
    "buttonTo": "/book",
    "backgroundImage": "/images/wedding_couple.webp"
  },
  "faqItems": [
    { "id": "faq-1", "q": "How do I book a session?", "a": "Click the Book a Shoot button, fill in your details and preferred date, and we'll get back to you within 24 hours to confirm availability and discuss your requirements." },
    { "id": "faq-2", "q": "What areas do you cover?", "a": "We're based in Lagos but cover events nationwide. Travel outside Lagos may incur additional logistics fees which we'll discuss upfront." },
    { "id": "faq-3", "q": "How long until I receive my photos?", "a": "Standard delivery is 7-10 business days for most sessions. Weddings and large events: 14-21 days. Corporate and rush delivery options are available." },
    { "id": "faq-4", "q": "Do you offer videography?", "a": "Yes! We offer hybrid photo + video packages for weddings and corporate events. Enquire about availability when booking." },
    { "id": "faq-5", "q": "What if I need to reschedule?", "a": "Life happens. We offer one free reschedule with at least 7 days notice. Subsequent changes may incur a small administrative fee." }
  ]
}$$::jsonb)
ON CONFLICT (id) DO NOTHING;
