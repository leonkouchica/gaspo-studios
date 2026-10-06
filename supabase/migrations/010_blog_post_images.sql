-- supabase/migrations/010_blog_post_images.sql
-- Add side_image, side_image_caption, and gallery_images to blog_posts

ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS side_image TEXT,
ADD COLUMN IF NOT EXISTS side_image_caption TEXT,
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}'::text[];

COMMENT ON COLUMN public.blog_posts.side_image IS 'Optional image displayed on the left side of the blog content';
COMMENT ON COLUMN public.blog_posts.side_image_caption IS 'Optional caption for the left-aligned side image';
COMMENT ON COLUMN public.blog_posts.gallery_images IS 'Optional array of image URLs displayed at the bottom of the post';
