import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchAnalyticsSummary } from "./analytics";

const mockQuery: any = {
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  then: vi.fn(),
};

mockQuery.select.mockReturnValue(mockQuery);
mockQuery.eq.mockReturnValue(mockQuery);
mockQuery.order.mockReturnValue(mockQuery);
mockQuery.limit.mockReturnValue(mockQuery);

const mockSupabase = {
  from: vi.fn().mockReturnValue(mockQuery),
};

vi.mock("../supabase.server.ts", () => ({
  getSupabaseAdmin: () => mockSupabase,
}));

describe("Analytics Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchAnalyticsSummary", () => {
    it("should compile statistics overview, trends, breakdowns, and recent bookings", async () => {
      // Set up consecutive mock responses for all 8 database queries in fetchAnalyticsSummary:
      
      // 1. bookings count
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ count: 12, error: null }));
      });
      // 2. event_registrations count
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ count: 48, error: null }));
      });
      // 3. active events count
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ count: 4, error: null }));
      });
      // 4. unread messages count
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ count: 3, error: null }));
      });
      // 5. completed bookings revenue
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({
          data: [{ total_value: "1500000" }, { total_value: "2000000" }],
          error: null,
        }));
      });
      // 6. service categories breakdown
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({
          data: [{ service: "Portrait" }, { service: "Portrait" }, { service: "Wedding" }],
          error: null,
        }));
      });
      // 7. monthly trends preferred_date / status breakdown
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({
          data: [
            { preferred_date: "2026-05-10", total_value: "1500000", status: "completed" },
            { preferred_date: "2026-05-20", total_value: "2000000", status: "completed" },
            { preferred_date: "2026-06-01", total_value: "500000", status: "new" },
          ],
          error: null,
        }));
      });
      // 8. recent bookings
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({
          data: [
            {
              id: "bk-1",
              name: "Russell Kouchica",
              service: "Wedding",
              status: "completed",
              total_value: "2000000",
              submitted_at: "2026-05-31T10:00:00Z",
            },
          ],
          error: null,
        }));
      });

      const result = await fetchAnalyticsSummary();

      // Assertions
      expect(mockSupabase.from).toHaveBeenCalledWith("bookings");
      expect(mockSupabase.from).toHaveBeenCalledWith("event_registrations");
      expect(mockSupabase.from).toHaveBeenCalledWith("events");
      expect(mockSupabase.from).toHaveBeenCalledWith("contact_messages");

      expect(result.overview).toEqual({
        totalRevenue: 3500000,
        totalBookings: 12,
        totalRegistrations: 48,
        activeEvents: 4,
        unreadMessages: 3,
      });

      expect(result.serviceBreakdown).toEqual([
        { name: "Portrait", value: 2 },
        { name: "Wedding", value: 1 },
      ]);

      expect(result.monthlyTrends).toEqual([
        { month: "2026-05", revenue: 3500000, bookings: 2 },
        { month: "2026-06", revenue: 0, bookings: 1 },
      ]);

      expect(result.statusBreakdown).toEqual([
        { status: "new", count: 1 },
        { status: "reviewed", count: 0 },
        { status: "confirmed", count: 0 },
        { status: "completed", count: 2 },
        { status: "cancelled", count: 0 },
      ]);

      expect(result.recentBookings).toEqual([
        {
          id: "bk-1",
          name: "Russell Kouchica",
          service: "Wedding",
          status: "completed",
          totalValue: 2000000,
          submittedAt: "2026-05-31T10:00:00Z",
        },
      ]);
    });
  });
});
