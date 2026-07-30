import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchBookings, updateBookingStatus, createBooking } from "./bookings";

const mockBookingsData = [
  {
    id: "bk-123",
    name: "Russell Kouchica",
    email: "russell@example.com",
    phone: "+234 801 111 2222",
    service: "Portrait Session",
    package: "Standard Package",
    preferred_date: "2026-06-15",
    preferred_time: "14:00",
    message: "Looking forward to it",
    status: "new",
    submitted_at: "2026-05-31T12:00:00Z",
    admin_notes: "Awaiting confirmation",
    total_value: "350000",
  },
];

// Create Mock Builder
const mockQuery: any = {
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  or: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  single: vi.fn(),
  then: vi.fn(),
};

// Enable chaining
mockQuery.select.mockReturnValue(mockQuery);
mockQuery.eq.mockReturnValue(mockQuery);
mockQuery.order.mockReturnValue(mockQuery);
mockQuery.or.mockReturnValue(mockQuery);
mockQuery.update.mockReturnValue(mockQuery);
mockQuery.insert.mockReturnValue(mockQuery);
mockQuery.single.mockReturnValue(mockQuery);

const mockSupabase = {
  from: vi.fn().mockReturnValue(mockQuery),
};

vi.mock("../supabase.server.ts", () => ({
  getSupabaseAdmin: () => mockSupabase,
}));

describe("Bookings Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchBookings", () => {
    it("should query bookings table, filter, and map fields correctly to camelCase", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockBookingsData, error: null }));
      });

      const result = await fetchBookings({ status: "new", search: "Russell" });

      expect(mockSupabase.from).toHaveBeenCalledWith("bookings");
      expect(mockQuery.eq).toHaveBeenCalledWith("status", "new");
      expect(mockQuery.or).toHaveBeenCalledWith(
        "name.ilike.%Russell%,email.ilike.%Russell%,service.ilike.%Russell%",
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "bk-123",
        name: "Russell Kouchica",
        email: "russell@example.com",
        phone: "+234 801 111 2222",
        service: "Portrait Session",
        package: "Standard Package",
        preferredDate: "2026-06-15",
        preferredTime: "14:00",
        message: "Looking forward to it",
        status: "new",
        submittedAt: "2026-05-31T12:00:00Z",
        adminNotes: "Awaiting confirmation",
        totalValue: 350000,
      });
    });

    it("should throw error if query fails", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: null, error: { message: "DB Error" } }));
      });

      await expect(fetchBookings()).rejects.toThrow("Failed to fetch bookings: DB Error");
    });
  });

  describe("updateBookingStatus", () => {
    it("should update booking status and notes", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockBookingsData[0], error: null }));
      });

      const result = await updateBookingStatus({
        id: "bk-123",
        status: "confirmed",
        adminNotes: "Confirmed deposit paid",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("bookings");
      expect(mockQuery.update).toHaveBeenCalledWith({
        status: "confirmed",
        admin_notes: "Confirmed deposit paid",
      });
      expect(mockQuery.eq).toHaveBeenCalledWith("id", "bk-123");
      expect(result.id).toBe("bk-123");
    });
  });

  describe("createBooking", () => {
    it("should insert a new booking into Supabase", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockBookingsData[0], error: null }));
      });

      const result = await createBooking({
        name: "Russell Kouchica",
        email: "russell@example.com",
        phone: "+234 801 111 2222",
        service: "Portrait Session",
        package: "Standard Package",
        preferredDate: "2026-06-15",
        preferredTime: "14:00",
        message: "Looking forward to it",
        totalValue: 350000,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("bookings");
      expect(mockQuery.insert).toHaveBeenCalledWith({
        name: "Russell Kouchica",
        email: "russell@example.com",
        phone: "+234 801 111 2222",
        service: "Portrait Session",
        package: "Standard Package",
        preferred_date: "2026-06-15",
        preferred_time: "14:00",
        message: "Looking forward to it",
        status: "new",
        total_value: 350000,
      });
      expect(result.name).toBe("Russell Kouchica");
    });
  });
});
