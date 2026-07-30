import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  fetchEventRegistrations,
  checkInAttendee,
} from "./events";

const mockEvent = {
  id: "evt-001",
  slug: "ai-meetup-2026",
  title: "AI Meetup",
  summary: "A small meetup",
  description: "Detailed description",
  category: "Tech",
  type: "physical",
  status: "published",
  date: "2026-06-01T09:00:00Z",
  venue: "Gaspo Studio",
  address: "Ikoyi",
  city: "Lagos",
  country: "Nigeria",
  banner_image: "https://example.com/events/banner.webp",
  capacity: 100,
  registration_count: 5,
  is_paid: false,
  price: "0",
  currency: "NGN",
  registration_deadline: "2026-05-30T00:00:00Z",
  speakers: [],
  agenda: [],
  sponsor_packages: [],
  seo: {},
  created_at: "2026-05-20T12:00:00Z",
  updated_at: "2026-05-20T12:00:00Z",
};

const mockRegistration = {
  id: "reg-001",
  event_id: "evt-001",
  full_name: "Russell Kouchica",
  email: "russell@example.com",
  phone: "123",
  company: "GASPOTECH",
  job_title: "CEO",
  country: "Nigeria",
  city: "Lagos",
  ticket_type: "free",
  payment_status: "completed",
  registered_at: "2026-05-30T10:00:00Z",
  checked_in: false,
  checked_in_at: null,
};

const mockQuery: any = {
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  delete: vi.fn(),
  single: vi.fn(),
  then: vi.fn(),
};

mockQuery.select.mockReturnValue(mockQuery);
mockQuery.eq.mockReturnValue(mockQuery);
mockQuery.order.mockReturnValue(mockQuery);
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

vi.mock("./upload.server.ts", () => ({
  convertAndUploadImage: vi.fn().mockResolvedValue("https://example.com/events/test.webp"),
}));

describe("Events Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.then.mockReset();
  });

  describe("fetchEvents", () => {
    it("should retrieve events list", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: [mockEvent], error: null }));
      });

      const result = await fetchEvents({ category: "Tech", status: "published" });

      expect(mockSupabase.from).toHaveBeenCalledWith("events");
      expect(mockQuery.eq).toHaveBeenCalledWith("category", "Tech");
      expect(mockQuery.eq).toHaveBeenCalledWith("status", "published");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("evt-001");
      expect(result[0].bannerImage).toBe("https://example.com/events/banner.webp");
    });
  });

  describe("createEvent", () => {
    it("should insert standard new event details", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockEvent, error: null }));
      });

      const result = await createEvent({
        slug: "ai-meetup-2026",
        title: "AI Meetup",
        summary: "A small meetup",
        description: "Detailed description",
        category: "Tech",
        type: "physical",
        status: "published",
        date: "2026-06-01",
        time: "09:00",
        venue: "Gaspo Studio",
        address: "Ikoyi",
        city: "Lagos",
        country: "Nigeria",
        bannerImage: "https://example.com/events/banner.webp",
        capacity: 100,
        isPaid: false,
        price: 0,
        currency: "NGN",
        registrationDeadline: "2026-05-30T00:00:00Z",
        speakers: [],
        agenda: [],
        sponsorPackages: [],
        seo: { title: "AI Meetup", description: "AI Meetup description" },
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("events");
      expect(mockQuery.insert).toHaveBeenCalled();
      expect(result.id).toBe("evt-001");
    });
  });

  describe("updateEvent", () => {
    it("should update event records in DB", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockEvent, error: null }));
      });

      const result = await updateEvent({
        id: "evt-001",
        slug: "ai-meetup-2026",
        title: "AI Meetup Updated",
        summary: "A small meetup",
        description: "Detailed description",
        category: "Tech",
        type: "physical",
        status: "published",
        date: "2026-06-01",
        time: "09:00",
        venue: "Gaspo Studio",
        address: "Ikoyi",
        city: "Lagos",
        country: "Nigeria",
        bannerImage: "https://example.com/events/banner.webp",
        capacity: 120,
        isPaid: false,
        price: 0,
        currency: "NGN",
        registrationDeadline: "2026-05-30T00:00:00Z",
        speakers: [],
        agenda: [],
        sponsorPackages: [],
        seo: { title: "AI Meetup Updated", description: "AI Meetup description" },
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("events");
      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "AI Meetup Updated",
          capacity: 120,
        }),
      );
      expect(mockQuery.eq).toHaveBeenCalledWith("id", "evt-001");
      expect(result.id).toBe("evt-001");
    });
  });

  describe("deleteEvent", () => {
    it("should remove event row and banner image from storage", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(
          onfulfilled({
            data: {
              banner_image:
                "https://example.com/storage/v1/object/public/gaspo-media/events/banner.webp",
            },
            error: null,
          }),
        );
      });

      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ error: null }));
      });

      const result = await deleteEvent({ id: "evt-001" });

      expect(mockQuery.eq).toHaveBeenCalledWith("id", "evt-001");
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockStorage.from).toHaveBeenCalledWith("gaspo-media");
      expect(mockRemove).toHaveBeenCalledWith(["events/banner.webp"]);
      expect(result.success).toBe(true);
    });
  });

  describe("fetchEventRegistrations", () => {
    it("should query event registrations correctly", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: [mockRegistration], error: null }));
      });

      const result = await fetchEventRegistrations({ eventId: "evt-001" });

      expect(mockSupabase.from).toHaveBeenCalledWith("event_registrations");
      expect(mockQuery.eq).toHaveBeenCalledWith("event_id", "evt-001");
      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe("Russell Kouchica");
    });
  });

  describe("checkInAttendee", () => {
    it("should update checked_in status and log times", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(
          onfulfilled({
            data: { ...mockRegistration, checked_in: true, checked_in_at: "2026-05-31T15:00:00Z" },
            error: null,
          }),
        );
      });

      const result = await checkInAttendee({ registrationId: "reg-001", checkedIn: true });

      expect(mockSupabase.from).toHaveBeenCalledWith("event_registrations");
      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          checked_in: true,
        }),
      );
      expect(mockQuery.eq).toHaveBeenCalledWith("id", "reg-001");
      expect(result.checkedIn).toBe(true);
    });
  });
});
