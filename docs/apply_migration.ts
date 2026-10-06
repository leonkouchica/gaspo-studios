const projectRef = "fhhxbjwcgfslvbznrvab";
const token = "sbp_fc7155ac333bc386ec9513ace0bfe7144c867b77";

async function run() {
  const sql = `
    ALTER TABLE public.blog_posts
    ADD COLUMN IF NOT EXISTS side_image TEXT,
    ADD COLUMN IF NOT EXISTS side_image_caption TEXT,
    ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}'::text[];

    COMMENT ON COLUMN public.blog_posts.side_image IS 'Optional image displayed on the left side of the blog content';
    COMMENT ON COLUMN public.blog_posts.side_image_caption IS 'Optional caption for the left-aligned side image';
    COMMENT ON COLUMN public.blog_posts.gallery_images IS 'Optional array of image URLs displayed at the bottom of the post';
  `;

  console.log("Applying migration to Supabase project:", projectRef);
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const data = await res.json();
  console.log("Result:", JSON.stringify(data, null, 2));

  // Verify the columns
  const verifyRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'blog_posts' ORDER BY ordinal_position;",
    }),
  });
  const verifyData = await verifyRes.json();
  console.log("Updated Columns in blog_posts:", JSON.stringify(verifyData, null, 2));
}

run().catch(console.error);
