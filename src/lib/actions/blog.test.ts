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
  side_image: "https://example.com/gallery/side.webp",
  side_image_caption: "Side photo caption",
  gallery_images: ["https://example.com/gallery/b1.webp"],
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
  range: vi.fn(),
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
mockQuery.range.mockReturnValue(mockQuery);
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

vi.mock("../auth-guard.server.ts", () => ({
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
}));

describe("Blog Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.select.mockReturnValue(mockQuery);
    mockQuery.eq.mockReturnValue(mockQuery);
    mockQuery.order.mockReturnValue(mockQuery);
    mockQuery.or.mockReturnValue(mockQuery);
    mockQuery.limit.mockReturnValue(mockQuery);
    mockQuery.range.mockReturnValue(mockQuery);
    mockQuery.update.mockReturnValue(mockQuery);
    mockQuery.insert.mockReturnValue(mockQuery);
    mockQuery.delete.mockReturnValue(mockQuery);
    mockQuery.single.mockReturnValue(mockQuery);
  });

  describe("fetchBlogPosts", () => {
    it("should fetch, filter, and map posts correctly", async () => {
      // First call is count query (head: true)
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: null, count: 1, error: null }));
      });
      // Second call is data query
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: [mockPost], error: null }));
      });

      const result = await fetchBlogPosts({
        category: "Weddings",
        status: "published",
        limit: 10,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("blog_posts");
      expect(mockQuery.eq).toHaveBeenCalledWith("category", "Weddings");
      expect(mockQuery.eq).toHaveBeenCalledWith("status", "published");
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe("post-123");
      expect(result.items[0].author.name).toBe("Marco Gaspo");
      expect(result.items[0].sideImage).toBe("https://example.com/gallery/side.webp");
      expect(result.items[0].galleryImages).toEqual(["https://example.com/gallery/b1.webp"]);
    });
  });

  describe("fetchBlogPost", () => {
    it("should fetch post by slug and parse media", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockPost, error: null }));
      });

      const result = await fetchBlogPost({ slug: "test-slug" });

      expect(mockQuery.eq).toHaveBeenCalledWith("slug", "test-slug");
      expect(result.id).toBe("post-123");
      expect(result.author.name).toBe("Marco Gaspo");
      expect(result.sideImage).toBe("https://example.com/gallery/side.webp");
    });
  });

  describe("createBlogPost", () => {
    it("should insert standard blog post data with author and media", async () => {
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
        author: {
          name: "Marco Gaspo",
          role: "Founder",
          avatar: "/images/team_founder.webp",
        },
        featuredImage: "https://example.com/gallery/img.webp",
        sideImage: "https://example.com/gallery/side.webp",
        galleryImages: ["https://example.com/gallery/b1.webp"],
        status: "published",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("blog_posts");
      expect(mockQuery.insert).toHaveBeenCalled();
      expect(result.id).toBe("post-123");
    });
  });

  describe("updateBlogPost", () => {
    it("should update blog post in DB with author and media", async () => {
      // 1. SELECT query to get current post status
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(
          onfulfilled({ data: { status: "draft", published_at: null }, error: null }),
        );
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
        author: {
          name: "Aisha Bello",
          role: "Lead Editor",
          avatar: "/images/portrait_woman.webp",
        },
        featuredImage: "https://example.com/gallery/img.webp",
        sideImage: "https://example.com/gallery/side.webp",
        galleryImages: ["https://example.com/gallery/b1.webp"],
        status: "published",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("blog_posts");
      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Updated Title",
          author_name: "Aisha Bello",
        }),
      );
      expect(result.id).toBe("post-123");
    });
  });

  describe("deleteBlogPost", () => {
    it("should delete from DB and storage", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(
          onfulfilled({
            data: {
              featured_image:
                "https://example.com/storage/v1/object/public/gaspo-media/blog/123.webp",
            },
            error: null,
          }),
        );
      });

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
