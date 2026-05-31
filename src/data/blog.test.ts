import { describe, it, expect } from "vitest";
import {
  getPostBySlug,
  getPublishedPosts,
  getFeaturedPost,
  blogPosts,
} from "./blog";

describe("Blog Data Helpers", () => {
  describe("getPostBySlug", () => {
    it("should retrieve a blog post by its exact slug", () => {
      const validSlug = "ten-lessons-from-a-decade-of-wedding-photography";
      const post = getPostBySlug(validSlug);
      
      expect(post).toBeDefined();
      expect(post?.id).toBe("post-001");
      expect(post?.slug).toBe(validSlug);
      expect(post?.title).toBe("Ten Lessons From a Decade of Wedding Photography");
    });

    it("should return undefined if the slug does not exist", () => {
      const post = getPostBySlug("non-existent-blog-slug-xyz");
      expect(post).toBeUndefined();
    });
  });

  describe("getPublishedPosts", () => {
    it("should retrieve only posts that have a status of 'published'", () => {
      const published = getPublishedPosts();
      
      expect(published.length).toBeGreaterThan(0);
      published.forEach((post) => {
        expect(post.status).toBe("published");
      });
      
      // Verify that drafted or scheduled posts are not in the list
      const draftPost = blogPosts.find((p) => p.status === "draft");
      if (draftPost) {
        expect(published.some((p) => p.id === draftPost.id)).toBe(false);
      }
      
      const scheduledPost = blogPosts.find((p) => p.status === "scheduled");
      if (scheduledPost) {
        expect(published.some((p) => p.id === scheduledPost.id)).toBe(false);
      }
    });
  });

  describe("getFeaturedPost", () => {
    it("should retrieve the first published post as the featured post", () => {
      const featured = getFeaturedPost();
      const firstPublished = blogPosts.find((p) => p.status === "published");
      
      expect(featured).toBeDefined();
      expect(featured?.id).toBe(firstPublished?.id);
      expect(featured?.status).toBe("published");
    });
  });
});
