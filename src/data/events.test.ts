import { describe, it, expect } from "vitest";
import { getEventBySlug, getFeaturedEvent, getUpcomingEvents, events } from "./events";

describe("Events Data Helpers", () => {
  describe("getEventBySlug", () => {
    it("should retrieve an event by its exact slug", () => {
      const validSlug = "future-of-ai-networking-2026";
      const event = getEventBySlug(validSlug);

      expect(event).toBeDefined();
      expect(event?.id).toBe("evt-001");
      expect(event?.slug).toBe(validSlug);
      expect(event?.title).toBe("Future of AI & Networking");
    });

    it("should return undefined if the slug does not exist", () => {
      const event = getEventBySlug("non-existent-event-slug");
      expect(event).toBeUndefined();
    });
  });

  describe("getFeaturedEvent", () => {
    it("should retrieve a featured event whose status is not completed", () => {
      const featured = getFeaturedEvent();

      expect(featured).toBeDefined();
      expect(featured?.featured).toBe(true);
      expect(featured?.status).not.toBe("completed");

      // Compare to manual find
      const manualFeatured = events.find((e) => e.featured && e.status !== "completed");
      expect(featured?.id).toBe(manualFeatured?.id);
    });
  });

  describe("getUpcomingEvents", () => {
    it("should retrieve only events that have a status of 'upcoming' or 'published'", () => {
      const upcoming = getUpcomingEvents();

      expect(upcoming.length).toBeGreaterThan(0);
      upcoming.forEach((event) => {
        expect(["upcoming", "published"]).toContain(event.status);
      });

      const manualUpcomingCount = events.filter((e) =>
        ["upcoming", "published"].includes(e.status),
      ).length;
      expect(upcoming.length).toBe(manualUpcomingCount);
    });
  });
});
