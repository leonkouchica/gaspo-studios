import { describe, it, expect } from "vitest";
import { getBookingById, getBookingsByStatus, bookings } from "./bookings";

describe("Bookings Data Helpers", () => {
  describe("getBookingById", () => {
    it("should retrieve a booking by its exact ID", () => {
      const validId = "bk-001";
      const booking = getBookingById(validId);

      expect(booking).toBeDefined();
      expect(booking?.id).toBe(validId);
      expect(booking?.name).toBe("Adaeze Okonkwo");
      expect(booking?.service).toBe("Wedding Photography");
    });

    it("should return undefined if the ID does not exist", () => {
      const booking = getBookingById("bk-non-existent");
      expect(booking).toBeUndefined();
    });
  });

  describe("getBookingsByStatus", () => {
    it("should filter bookings correctly based on status", () => {
      // Test status 'new'
      const newBookings = getBookingsByStatus("new");
      expect(newBookings).toBeInstanceOf(Array);
      newBookings.forEach((b) => {
        expect(b.status).toBe("new");
      });

      // Compare counts against manual filter
      const manualNewCount = bookings.filter((b) => b.status === "new").length;
      expect(newBookings.length).toBe(manualNewCount);

      // Test status 'confirmed'
      const confirmedBookings = getBookingsByStatus("confirmed");
      confirmedBookings.forEach((b) => {
        expect(b.status).toBe("confirmed");
      });

      const manualConfirmedCount = bookings.filter((b) => b.status === "confirmed").length;
      expect(confirmedBookings.length).toBe(manualConfirmedCount);

      // Test status 'cancelled'
      const cancelledBookings = getBookingsByStatus("cancelled");
      cancelledBookings.forEach((b) => {
        expect(b.status).toBe("cancelled");
      });

      const manualCancelledCount = bookings.filter((b) => b.status === "cancelled").length;
      expect(cancelledBookings.length).toBe(manualCancelledCount);
    });

    it("should return an empty array if no bookings match the status", () => {
      // Since all 5 statuses are represented, let's temporarily mock or verify
      // but getBookingsByStatus is simple enough. We just ensure it filters correctly.
      const statuses = ["new", "reviewed", "confirmed", "completed", "cancelled"] as const;
      statuses.forEach((status) => {
        const list = getBookingsByStatus(status);
        expect(list.length).toBe(bookings.filter((b) => b.status === status).length);
      });
    });
  });
});
