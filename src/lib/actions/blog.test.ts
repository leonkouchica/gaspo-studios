import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchBlogPosts,
  fetchBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "./blog";

const mockPost = {
  id: "post-123",
  slug: "test-slug",
  title: "Test Title",
  excerpt: "Test Excerpt",
  body: "Test Body",
  category: "Weddings",
  tags: ["tag1"],
  author_name: "Marco Gaspo",
  author_avatar: "/images/team_founder.webp",
  author_role: "Founder",
  featured_image: "https://example.com/gallery/img.webp",
  status: "published",
  published_at: "2026-05-31T12:00:00Z",
  views: 10,
  comments: 2,
  seo_title: "Test Title",
  seo_description: "Test Excerpt",
  seo_og_image: "https://example.com/gallery/img.webp",
  created_at: "2026-05-30T10:00:00Z",
  updated_at: "2026-05-30T10:00:00Z",
};

const mockQuery: any = {
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  or: vi.fn(),
  limit: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  delete: vi.fn(),
  single: vi.fn(),
  then: vi.fn(),
};

mockQuery.select.mockReturnValue(mockQuery);
mockQuery.eq.mockReturnValue(mockQuery);
mockQuery.order.mockReturnValue(mockQuery);
mockQuery.or.mockReturnValue(mockQuery);
mockQuery.limit.mockReturnValue(mockQuery);
mockQuery.update.mockReturnValue(mockQuery);
mockQuery.insert.mockReturnValue(mockQuery);
mockQuery.delete.mockReturnValue(mockQuery);
mockQuery.single.mockReturnValue(mockQuery);

const mockRemove = vi.fn().mockResolvedValue({ data: {}, error: null });
const mockStorage = {
  from: vi.fn().mockReturnValue({
    remove: mockRemove,
  }),
};

const mockSupabase = {
  from: vi.fn().mockReturnValue(mockQuery),
  storage: mockStorage,
};

vi.mock("../supabase.server.ts", () => ({
  getSupabaseAdmin: () => mockSupabase,
}));

describe("Blog Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchBlogPosts", () => {
    it("should fetch, filter, and map posts correctly", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: [mockPost], error: null }));
      });

      const result = await fetchBlogPosts({ category: "Weddings", status: "published", limit: 10 });

      expect(mockSupabase.from).toHaveBeenCalledWith("blog_posts");
      expect(mockQuery.eq).toHaveBeenCalledWith("category", "Weddings");
      expect(mockQuery.eq).toHaveBeenCalledWith("status", "published");
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("post-123");
      expect(result[0].author.name).toBe("Marco Gaspo");
    });
  });

  describe("fetchBlogPost", () => {
    it("should fetch and increment views on read", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockPost, error: null }));
      });

      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: null, error: null }));
      });

      const result = await fetchBlogPost({ slug: "test-slug" });

      expect(mockQuery.eq).toHaveBeenCalledWith("slug", "test-slug");
      expect(mockQuery.update).toHaveBeenCalledWith({ views: 11 });
      expect(mockQuery.eq).toHaveBeenCalledWith("id", "post-123");
      expect(result.views).toBe(11);
    });
  });

  describe("createBlogPost", () => {
    it("should insert standard blog post data", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockPost, error: null }));
      });

      const result = await createBlogPost({
        slug: "test-slug",
        title: "Test Title",
        excerpt: "Test Excerpt",
        body: "Test Body",
        category: "Weddings",
        tags: ["tag1"],
        featuredImage: "https://example.com/gallery/img.webp",
        status: "published",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("blog_posts");
      expect(mockQuery.insert).toHaveBeenCalled();
      expect(result.id).toBe("post-123");
    });
  });

  describe("updateBlogPost", () => {
    it("should update blog post in DB", async () => {
      // 1. SELECT query to get current post status
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({
          data: { status: "draft", published_at: null },
          error: null,
        }));
      });

      // 2. UPDATE query
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockPost, error: null }));
      });

      const result = await updateBlogPost({
        id: "post-123",
        slug: "test-slug",
        title: "Updated Title",
        excerpt: "Test Excerpt",
        body: "Test Body",
        category: "Weddings",
        tags: ["tag1"],
        featuredImage: "https://example.com/gallery/img.webp",
        status: "published",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("blog_posts");
      expect(mockQuery.update).toHaveBeenCalledWith(expect.objectContaining({
        title: "Updated Title",
      }));
      expect(result.id).toBe("post-123");
    });
  });

  describe("deleteBlogPost", () => {
    it("should delete from DB and storage", async () => {
      // 1. SELECT featured_image
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({
          data: { featured_image: "https://example.com/storage/v1/object/public/gaspo-media/blog/123.webp" },
          error: null,
        }));
      });

      // 2. DELETE row
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ error: null }));
      });

      const result = await deleteBlogPost({ id: "post-123" });

      expect(mockQuery.eq).toHaveBeenCalledWith("id", "post-123");
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockStorage.from).toHaveBeenCalledWith("gaspo-media");
      expect(mockRemove).toHaveBeenCalledWith(["blog/123.webp"]);
      expect(result.success).toBe(true);
    });
  });
});
