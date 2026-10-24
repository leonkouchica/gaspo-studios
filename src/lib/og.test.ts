import { describe, it, expect } from "vitest";
import { getBlogOgImageUrl, getEventOgImageUrl, getOgImageUrl } from "./og";

describe("OG URL Helpers", () => {
  const defaultPng =
    "https://fhhxbjwcgfslvbznrvab.supabase.co/storage/v1/object/public/gaspo-media/og/gaspo-studios-og.png";

  describe("getBlogOgImageUrl", () => {
    it("should return clean static-like JPEG URL for blog slug", () => {
      expect(getBlogOgImageUrl("my-first-post")).toBe(
        "https://www.gaspostudios.com/api/og/blog/my-first-post.jpg",
      );
    });

    it("should return default image if no slug provided", () => {
      expect(getBlogOgImageUrl("")).toBe(defaultPng);
    });
  });

  describe("getEventOgImageUrl", () => {
    it("should return clean static-like JPEG URL for event slug", () => {
      expect(getEventOgImageUrl("annual-workshop-2026")).toBe(
        "https://www.gaspostudios.com/api/og/events/annual-workshop-2026.jpg",
      );
    });

    it("should return default image if no slug provided", () => {
      expect(getEventOgImageUrl("")).toBe(defaultPng);
    });
  });

  describe("getOgImageUrl", () => {
    it("should return the default OG image if no URL is passed", () => {
      expect(getOgImageUrl(undefined)).toBe(defaultPng);
      expect(getOgImageUrl(null)).toBe(defaultPng);
      expect(getOgImageUrl("")).toBe(defaultPng);
    });

    it("should resolve relative URLs to absolute URLs", () => {
      const relative = "/images/photographer_hero.webp";
      const expected = `https://www.gaspostudios.com/api/og/image.jpg?url=${encodeURIComponent("https://www.gaspostudios.com/images/photographer_hero.webp")}`;
      expect(getOgImageUrl(relative)).toBe(expected);
    });

    it("should wrap raw Supabase URLs with the dynamic OG endpoint", () => {
      const rawWebp =
        "https://fhhxbjwcgfslvbznrvab.supabase.co/storage/v1/object/public/gaspo-media/blog/test.webp";
      const expected = `https://www.gaspostudios.com/api/og/image.jpg?url=${encodeURIComponent(rawWebp)}`;
      expect(getOgImageUrl(rawWebp)).toBe(expected);
    });
  });
});
