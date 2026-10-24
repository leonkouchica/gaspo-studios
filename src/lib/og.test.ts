import { describe, it, expect } from "vitest";
import { getOgImageUrl } from "./og";

describe("getOgImageUrl", () => {
  const defaultPng =
    "https://fhhxbjwcgfslvbznrvab.supabase.co/storage/v1/object/public/gaspo-media/og/gaspo-studios-og.png";

  it("should return the default OG image if no URL is passed", () => {
    expect(getOgImageUrl(undefined)).toBe(defaultPng);
    expect(getOgImageUrl(null)).toBe(defaultPng);
    expect(getOgImageUrl("")).toBe(defaultPng);
  });

  it("should keep already formatted /api/og URLs as-is", () => {
    const existing = "https://www.gaspostudios.com/api/og/image.jpg?url=something";
    expect(getOgImageUrl(existing)).toBe(existing);
  });

  it("should keep existing .png URLs as-is", () => {
    const pngUrl = "https://example.com/image.png";
    expect(getOgImageUrl(pngUrl)).toBe(pngUrl);
  });

  it("should wrap WebP or raw Supabase URLs with the dynamic OG endpoint", () => {
    const rawWebp =
      "https://fhhxbjwcgfslvbznrvab.supabase.co/storage/v1/object/public/gaspo-media/blog/test.webp";
    const expected = `https://www.gaspostudios.com/api/og/image.jpg?url=${encodeURIComponent(rawWebp)}`;
    expect(getOgImageUrl(rawWebp)).toBe(expected);
  });
});
