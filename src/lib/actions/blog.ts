import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { convertAndUploadImage } from "./upload.server.ts";

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
  .inputValidator((input: { category?: string; status?: string; search?: string; limit?: number } | undefined) => input)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (data?.category && data.category !== "all" && data.category !== "All") {
      query = query.eq("category", data.category);
    }

    if (data?.status && data.status !== "all") {
      query = query.eq("status", data.status);
    }

    if (data?.search) {
      query = query.or(`title.ilike.%${data.search}%,excerpt.ilike.%${data.search}%,body.ilike.%${data.search}%`);
    }

    if (data?.limit) {
      query = query.limit(data.limit);
    }

    const { data: posts, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch blog posts: ${error.message}`);
    }

    return (posts || []).map((p) => ({
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

    // Increment views counter
    const newViews = (p.views || 0) + 1;
    await supabase
      .from("blog_posts")
      .update({ views: newViews })
      .eq("id", p.id);

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
      views: newViews,
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

export const uploadBlogImage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      fileBase64: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
    })
  )
  .handler(async ({ data }) => {
    // Decode base64 back to a Buffer
    const buffer = Buffer.from(data.fileBase64, "base64");
    // Create a File-like object that convertAndUploadImage can consume
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
    })
  )
  .handler(async ({ data }) => {
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
    })
  )
  .handler(async ({ data }) => {
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
    const supabase = getSupabaseAdmin();

    // Get featured image first
    const { data: post } = await supabase
      .from("blog_posts")
      .select("featured_image")
      .eq("id", data.id)
      .single();

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", data.id);

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
