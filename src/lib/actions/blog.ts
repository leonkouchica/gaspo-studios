import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { convertAndUploadImage } from "./upload.server.ts";
import { requireAuth, requireRole } from "../auth-guard.server.ts";
import { sendPushNotifications } from "../push-notification.server.ts";
import NewsletterBroadcastEmail from "../../emails/NewsletterBroadcastEmail.tsx";
import * as React from "react";
import { resend } from "../resend.server.ts";
import { render } from "@react-email/components";

const postStatusSchema = z.enum(["draft", "published", "scheduled"]);

const authorSchema = z.object({
  name: z.string().default("Marco Gaspo"),
  avatar: z.string().default("/images/team_founder.webp"),
  role: z.string().default("Founder & Senior Photographer"),
});

const seoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
});

export const fetchBlogPosts = createServerFn({ method: "GET" })
  .inputValidator(
    (
      input:
        | { category?: string; status?: string; search?: string; page?: number; limit?: number }
        | undefined,
    ) => input,
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const page = data?.page || 1;
    const limit = data?.limit || 20;
    const offset = (page - 1) * limit;

    // Get total count for pagination
    let countQuery = supabase.from("blog_posts").select("*", { count: "exact", head: true });
    if (data?.category && data.category !== "all" && data.category !== "All") {
      countQuery = countQuery.eq("category", data.category);
    }
    if (data?.status && data.status !== "all") {
      countQuery = countQuery.eq("status", data.status);
    }
    if (data?.search) {
      countQuery = countQuery.or(
        `title.ilike.%${data.search}%,excerpt.ilike.%${data.search}%,body.ilike.%${data.search}%`,
      );
    }
    const { count: total } = await countQuery;

    let query = supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (data?.category && data.category !== "all" && data.category !== "All") {
      query = query.eq("category", data.category);
    }
    if (data?.status && data.status !== "all") {
      query = query.eq("status", data.status);
    }
    if (data?.search) {
      query = query.or(
        `title.ilike.%${data.search}%,excerpt.ilike.%${data.search}%,body.ilike.%${data.search}%`,
      );
    }

    const { data: posts, error } = await query;
    if (error) throw new Error(`Failed to fetch blog posts: ${error.message}`);

    const items = (posts || []).map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      body: p.body,
      category: p.category,
      tags: p.tags || [],
      author: {
        name: p.author_name,
        avatar: p.author_avatar,
        role: p.author_role,
      },
      featuredImage: p.featured_image,
      status: p.status,
      publishedAt: p.published_at,
      scheduledFor: p.scheduled_for || undefined,
      views: p.views || 0,
      comments: p.comments || 0,
      seo: {
        title: p.seo_title || p.title,
        description: p.seo_description || p.excerpt,
        ogImage: p.seo_og_image || undefined,
      },
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return { items, total: total || 0, page, totalPages: Math.ceil((total || 0) / limit) };
  });

export const fetchBlogPost = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { data: p, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", data.slug)
      .single();

    if (error) {
      throw new Error(`Failed to fetch blog post: ${error.message}`);
    }

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      body: p.body,
      category: p.category,
      tags: p.tags || [],
      author: {
        name: p.author_name,
        avatar: p.author_avatar,
        role: p.author_role,
      },
      featuredImage: p.featured_image,
      status: p.status,
      publishedAt: p.published_at,
      scheduledFor: p.scheduled_for || undefined,
      views: p.views || 0,
      comments: p.comments || 0,
      seo: {
        title: p.seo_title || p.title,
        description: p.seo_description || p.excerpt,
        ogImage: p.seo_og_image || undefined,
      },
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };
  });

export const fetchBlogPostById = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { data: p, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", data.id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch blog post: ${error.message}`);
    }

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      body: p.body,
      category: p.category,
      tags: p.tags || [],
      author: {
        name: p.author_name,
        avatar: p.author_avatar,
        role: p.author_role,
      },
      featuredImage: p.featured_image,
      status: p.status,
      publishedAt: p.published_at,
      scheduledFor: p.scheduled_for || undefined,
      views: p.views || 0,
      comments: p.comments || 0,
      seo: {
        title: p.seo_title || p.title,
        description: p.seo_description || p.excerpt,
        ogImage: p.seo_og_image || undefined,
      },
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };
  });

// Separate POST endpoint for view counting — keeps GET idempotent
export const recordBlogPostView = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      slug: z.string(),
      // Optional deduplication token from the client to prevent double-counting
      dedupeToken: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    // Get current post for the ID
    const { data: post, error: fetchErr } = await supabase
      .from("blog_posts")
      .select("id, views")
      .eq("slug", data.slug)
      .single();

    if (fetchErr || !post) {
      // Don't throw — silently ignore view tracking for non-existent posts
      return { views: 0 };
    }

    // Increment views counter
    const newViews = (post.views || 0) + 1;
    await supabase.from("blog_posts").update({ views: newViews }).eq("id", post.id);

    return { views: newViews };
  });

// Reusable base64 decoder — web-standard, no Node.js Buffer dependency
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const uploadBlogImage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      fileBase64: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    // Decode base64 using web-standard APIs
    const buffer = base64ToBytes(data.fileBase64);
    const file = new File([buffer], data.fileName, { type: data.mimeType });
    const publicUrl = await convertAndUploadImage(file, "blog");
    return { url: publicUrl };
  });

export const createBlogPost = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      slug: z.string(),
      title: z.string().min(1),
      excerpt: z.string().min(1),
      body: z.string().min(1),
      category: z.string().min(1),
      tags: z.array(z.string()).default([]),
      author: authorSchema.optional(),
      featuredImage: z.string(),
      status: postStatusSchema,
      scheduledFor: z.string().optional(),
      seo: seoSchema.optional(),
    }),
  )
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();
    const author = data.author || {
      name: "Marco Gaspo",
      avatar: "/images/team_founder.webp",
      role: "Founder & Senior Photographer",
    };
    const seo = data.seo || {};

    const { data: inserted, error } = await supabase
      .from("blog_posts")
      .insert({
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        body: data.body,
        category: data.category,
        tags: data.tags,
        author_name: author.name,
        author_avatar: author.avatar,
        author_role: author.role,
        featured_image: data.featuredImage,
        status: data.status,
        published_at: data.status === "published" ? new Date().toISOString() : null,
        scheduled_for: data.scheduledFor || null,
        views: 0,
        comments: 0,
        seo_title: seo.title || data.title,
        seo_description: seo.description || data.excerpt,
        seo_og_image: seo.ogImage || data.featuredImage,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create blog post: ${error.message}`);
    }

    return inserted;
  });

export const updateBlogPost = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      slug: z.string(),
      title: z.string().min(1),
      excerpt: z.string().min(1),
      body: z.string().min(1),
      category: z.string().min(1),
      tags: z.array(z.string()).default([]),
      author: authorSchema.optional(),
      featuredImage: z.string(),
      status: postStatusSchema,
      scheduledFor: z.string().optional(),
      seo: seoSchema.optional(),
    }),
  )
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();
    const author = data.author || {
      name: "Marco Gaspo",
      avatar: "/images/team_founder.webp",
      role: "Founder & Senior Photographer",
    };
    const seo = data.seo || {};

    // Get current status to see if it's transitioning to published
    const { data: currentPost } = await supabase
      .from("blog_posts")
      .select("status, published_at")
      .eq("id", data.id)
      .single();

    let publishedAt = currentPost?.published_at || null;
    if (data.status === "published" && currentPost?.status !== "published") {
      publishedAt = new Date().toISOString();
    } else if (data.status === "draft") {
      publishedAt = null;
    }

    const { data: updated, error } = await supabase
      .from("blog_posts")
      .update({
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        body: data.body,
        category: data.category,
        tags: data.tags,
        author_name: author.name,
        author_avatar: author.avatar,
        author_role: author.role,
        featured_image: data.featuredImage,
        status: data.status,
        published_at: publishedAt,
        scheduled_for: data.scheduledFor || null,
        seo_title: seo.title || data.title,
        seo_description: seo.description || data.excerpt,
        seo_og_image: seo.ogImage || data.featuredImage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update blog post: ${error.message}`);
    }

    return updated;
  });

export const deleteBlogPost = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();

    // Get featured image first
    const { data: post } = await supabase
      .from("blog_posts")
      .select("featured_image")
      .eq("id", data.id)
      .single();

    const { error } = await supabase.from("blog_posts").delete().eq("id", data.id);

    if (error) {
      throw new Error(`Failed to delete blog post: ${error.message}`);
    }

    // Delete featured image from storage if it belongs to gaspo-media bucket
    try {
      const srcUrl = post?.featured_image;
      if (srcUrl && srcUrl.includes("gaspo-media/")) {
        const filePath = srcUrl.substring(srcUrl.indexOf("gaspo-media/") + "gaspo-media/".length);
        await supabase.storage.from("gaspo-media").remove([filePath]);
      }
    } catch (storageErr) {
      console.error("Warning: failed to delete blog image from storage:", storageErr);
    }

    return { success: true };
  });

// ── Blog scheduling: auto-publish posts whose scheduled_for time has passed ──
export const publishScheduledPosts = createServerFn({ method: "POST" }).handler(async () => {
  requireAuth();
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: scheduled, error: fetchErr } = await supabase
    .from("blog_posts")
    .select("id, title")
    .eq("status", "scheduled")
    .lte("scheduled_for", now);

  if (fetchErr) throw new Error(`Failed to fetch scheduled posts: ${fetchErr.message}`);

  if (!scheduled || scheduled.length === 0) {
    return { published: 0, message: "No scheduled posts are ready to publish." };
  }

  const ids = scheduled.map((p) => p.id);
  const { error: updateErr } = await supabase
    .from("blog_posts")
    .update({ status: "published", published_at: now })
    .in("id", ids);

  if (updateErr) throw new Error(`Failed to publish posts: ${updateErr.message}`);

  return { published: ids.length, posts: scheduled.map((p) => p.title) };
});

export const triggerBlogPushNotification = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();

    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("title, excerpt, slug")
      .eq("id", data.id)
      .single();

    if (error || !post) {
      throw new Error(`Failed to fetch post: ${error?.message}`);
    }

    const result = await sendPushNotifications(
      {
        type: "blog",
        title: post.title,
        body: post.excerpt,
        url: `/blog/${post.slug}`,
      },
      { bypassRateLimit: true },
    );

    return result;
  });

export const broadcastBlogNewsletter = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requireRole(["admin", "editor"]);
    const supabase = getSupabaseAdmin();

    const { data: post, error: postErr } = await supabase
      .from("blog_posts")
      .select("title, excerpt, featured_image, slug")
      .eq("id", data.id)
      .single();

    if (postErr || !post) {
      throw new Error(`Failed to fetch post: ${postErr?.message}`);
    }

    const { data: subscribers, error: subErr } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("status", "subscribed");

    if (subErr) {
      throw new Error(`Failed to fetch subscribers: ${subErr.message}`);
    }

    if (!subscribers || subscribers.length === 0) {
      throw new Error("No active subscribers found.");
    }

    const htmlContent = `
      <h2>${post.title}</h2>
      ${post.featured_image ? `<img src="${post.featured_image.startsWith("/") ? "https://gaspostudios.com" + post.featured_image : post.featured_image}" alt="Featured" style="width:100%;border-radius:8px;margin-bottom:16px;" />` : ""}
      <p style="font-size: 16px; line-height: 1.5; color: #374151;">${post.excerpt}</p>
      <div style="margin-top: 24px; text-align: center;">
        <a href="https://gaspostudios.com/blog/${post.slug}" style="display:inline-block;background-color:#10b981;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Read the Full Post</a>
      </div>
    `;

    const emails = subscribers.map((sub: any) => sub.email);
    const BATCH_SIZE = 50;
    const batches = [];

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      batches.push(emails.slice(i, i + BATCH_SIZE));
    }

    let successCount = 0;
    let failCount = 0;

    const emailHtml = await render(
      React.createElement(NewsletterBroadcastEmail, {
        subject: post.title,
        content: htmlContent,
      }),
    );

    for (const batch of batches) {
      const payload = batch.map((email) => ({
        from: "Gaspo Studios <hello@gaspostudios.com>",
        to: email,
        subject: `New Blog Post: ${post.title}`,
        html: emailHtml,
      }));

      try {
        const { error: batchError } = await resend.batch.send(payload);
        if (batchError) {
          console.error("Batch send error:", batchError);
          failCount += batch.length;
        } else {
          successCount += batch.length;
        }
      } catch (err) {
        console.error("Batch send exception:", err);
        failCount += batch.length;
      }
    }

    await supabase.from("email_log").insert({
      recipient: `Broadcast to ${emails.length} subscribers`,
      subject: `New Blog Post: ${post.title}`,
      body: `Success: ${successCount}, Failed: ${failCount}`,
      type: "newsletter_broadcast",
    });

    if (failCount > 0 && successCount === 0) {
      throw new Error("Failed to send broadcast to all subscribers.");
    }

    return { success: true, successCount, failCount };
  });
