import { describe, it, expect } from "vitest";
import { getVisibleImages, getImagesByCategory, galleryImages } from "./gallery";

describe("Gallery Data Helpers", () => {
  describe("getVisibleImages", () => {
    it("should retrieve only visible gallery images sorted by their order asc", () => {
      const visible = getVisibleImages();

      expect(visible.length).toBeGreaterThan(0);
      visible.forEach((img) => {
        expect(img.visible).toBe(true);
      });

      // Verify sorting order
      for (let i = 0; i < visible.length - 1; i++) {
        expect(visible[i].order).toBeLessThanOrEqual(visible[i + 1].order);
      }

      // Verify hidden images are excluded
      const hiddenImages = galleryImages.filter((img) => !img.visible);
      hiddenImages.forEach((img) => {
        expect(visible.some((v) => v.id === img.id)).toBe(false);
      });
    });
  });

  describe("getImagesByCategory", () => {
    it("should retrieve only visible images of the specified category sorted by order asc", () => {
      const category = "Weddings";
      const images = getImagesByCategory(category);

      expect(images.length).toBeGreaterThan(0);
      images.forEach((img) => {
        expect(img.category).toBe(category);
        expect(img.visible).toBe(true);
      });

      // Verify sorting order
      for (let i = 0; i < images.length - 1; i++) {
        expect(images[i].order).toBeLessThanOrEqual(images[i + 1].order);
      }

      // Verify that images from other categories are excluded
      const otherImages = galleryImages.filter((img) => img.category !== category);
      otherImages.forEach((img) => {
        expect(images.some((v) => v.id === img.id)).toBe(false);
      });
    });

    it("should return an empty array if category has no visible images", () => {
      // "Behind the Scenes" category in our seed data has visible: false for all images
      const images = getImagesByCategory("Behind the Scenes");
      expect(images).toBeInstanceOf(Array);
      expect(images.length).toBe(0);
    });
  });
});
