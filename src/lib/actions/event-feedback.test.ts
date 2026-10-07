import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  submitEventFeedback,
  fetchEventFeedback,
  deleteEventFeedback,
} from "./event-feedback";

const mockQuery: any = {
  select: vi.fn(),
  insert: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  or: vi.fn(),
  order: vi.fn(),
  single: vi.fn(),
  then: vi.fn(),
};

mockQuery.select.mockReturnValue(mockQuery);
mockQuery.insert.mockReturnValue(mockQuery);
mockQuery.delete.mockReturnValue(mockQuery);
mockQuery.eq.mockReturnValue(mockQuery);
mockQuery.or.mockReturnValue(mockQuery);
mockQuery.order.mockReturnValue(mockQuery);
mockQuery.single.mockReturnValue(mockQuery);

const mockSupabase = {
  from: vi.fn().mockReturnValue(mockQuery),
};

vi.mock("../supabase.server.ts", () => ({
  getSupabaseAdmin: () => mockSupabase,
}));

vi.mock("../auth-guard.server.ts", () => ({
  requireAuth: vi.fn().mockReturnValue({ id: "admin-user", role: "admin" }),
}));

describe("Event Feedback Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.then.mockReset();
  });

  describe("submitEventFeedback", () => {
    it("should validate and save feedback for a valid event", async () => {
      // 1st query: find event by id/slug
      mockQuery.then
        .mockImplementationOnce((onfulfilled: any) =>
          Promise.resolve(
            onfulfilled({
              data: { id: "evt-001", title: "African Photo Week" },
              error: null,
            }),
          ),
        )
        // 2nd query: insert feedback
        .mockImplementationOnce((onfulfilled: any) =>
          Promise.resolve(
            onfulfilled({
              data: { id: "fb-123" },
              error: null,
            }),
          ),
        );

      const res = await submitEventFeedback({
        eventId: "evt-001",
        fullName: "Russell",
        email: "russell@example.com",
        attendanceMode: "in_person",
        overallRating: 5,
        contentRating: 4,
        organizationRating: 5,
        venueRating: 4,
        bestAspect: "The lighting and portrait masterclass",
        improvementSuggestions: "More time for hands-on sessions",
        futureTopics: "Drone photography",
        npsScore: 10,
      });

      expect(res.success).toBe(true);
      expect(res.id).toBe("fb-123");
      expect(res.eventTitle).toBe("African Photo Week");
    });

    it("should throw error if event is not found", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve(onfulfilled({ data: null, error: { message: "Not found" } })),
      );

      await expect(
        submitEventFeedback({
          eventId: "non-existent",
          overallRating: 5,
          contentRating: 5,
          organizationRating: 5,
          venueRating: 5,
          npsScore: 9,
        }),
      ).rejects.toThrow("Event not found");
    });
  });

  describe("fetchEventFeedback", () => {
    it("should calculate summary metrics and NPS correctly", async () => {
      const mockRows = [
        {
          id: "fb-1",
          event_id: "evt-001",
          full_name: "Jane Doe",
          email: "jane@test.com",
          attendance_mode: "in_person",
          overall_rating: 5,
          content_rating: 5,
          organization_rating: 4,
          venue_rating: 5,
          best_aspect: "Everything",
          improvement_suggestions: "None",
          future_topics: "AI Editing",
          nps_score: 10, // Promoter
          created_at: "2026-10-01T12:00:00Z",
          events: { title: "African Photo Week", slug: "african-photo-week" },
        },
        {
          id: "fb-2",
          event_id: "evt-001",
          full_name: "John Smith",
          email: "john@test.com",
          attendance_mode: "virtual",
          overall_rating: 4,
          content_rating: 4,
          organization_rating: 4,
          venue_rating: 3,
          best_aspect: "Virtual streaming",
          improvement_suggestions: "Better audio",
          future_topics: "Color grading",
          nps_score: 8, // Passive
          created_at: "2026-10-02T12:00:00Z",
          events: { title: "African Photo Week", slug: "african-photo-week" },
        },
      ];

      mockQuery.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve(onfulfilled({ data: mockRows, error: null })),
      );

      const res = await fetchEventFeedback({ eventId: "all" });

      expect(res.summary.totalResponses).toBe(2);
      expect(res.summary.averageOverall).toBe(4.5);
      expect(res.summary.inPersonCount).toBe(1);
      expect(res.summary.virtualCount).toBe(1);
      expect(res.summary.promotersPct).toBe(50);
      expect(res.summary.passivesPct).toBe(50);
      expect(res.summary.detractorsPct).toBe(0);
      expect(res.summary.npsScore).toBe(50);
      expect(res.items).toHaveLength(2);
    });
  });

  describe("deleteEventFeedback", () => {
    it("should remove feedback item", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve(onfulfilled({ data: null, error: null })),
      );

      const res = await deleteEventFeedback({ id: "fb-1" });
      expect(res.success).toBe(true);
      expect(mockQuery.delete).toHaveBeenCalled();
    });
  });
});
