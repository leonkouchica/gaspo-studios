import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchContactMessages,
  submitContactMessage,
  markMessageRead,
  deleteContactMessage,
} from "./contact";

const mockMessages = [
  {
    id: "msg-001",
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456",
    subject: "Inquiry",
    message: "Test message here",
    submitted_at: "2026-05-31T12:00:00Z",
    read: false,
  },
];

const mockQuery: any = {
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  or: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  delete: vi.fn(),
  single: vi.fn(),
  then: vi.fn(),
};

mockQuery.select.mockReturnValue(mockQuery);
mockQuery.eq.mockReturnValue(mockQuery);
mockQuery.order.mockReturnValue(mockQuery);
mockQuery.or.mockReturnValue(mockQuery);
mockQuery.update.mockReturnValue(mockQuery);
mockQuery.insert.mockReturnValue(mockQuery);
mockQuery.delete.mockReturnValue(mockQuery);
mockQuery.single.mockReturnValue(mockQuery);

const mockSupabase = {
  from: vi.fn().mockReturnValue(mockQuery),
};

vi.mock("../supabase.server.ts", () => ({
  getSupabaseAdmin: () => mockSupabase,
}));

describe("Contact Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchContactMessages", () => {
    it("should fetch, filter, search, and map contact messages", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockMessages, error: null }));
      });

      const result = await fetchContactMessages({ filter: "unread", search: "John" });

      expect(mockSupabase.from).toHaveBeenCalledWith("contact_messages");
      expect(mockQuery.eq).toHaveBeenCalledWith("read", false);
      expect(mockQuery.or).toHaveBeenCalledWith(
        "name.ilike.%John%,email.ilike.%John%,subject.ilike.%John%",
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "msg-001",
        name: "John Doe",
        email: "john@example.com",
        phone: "123-456",
        subject: "Inquiry",
        message: "Test message here",
        submittedAt: "2026-05-31T12:00:00Z",
        read: false,
      });
    });
  });

  describe("submitContactMessage", () => {
    it("should insert a contact message correctly", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockMessages[0], error: null }));
      });

      const result = await submitContactMessage({
        name: "John Doe",
        email: "john@example.com",
        phone: "123-456",
        subject: "Inquiry",
        message: "Test message here",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("contact_messages");
      expect(mockQuery.insert).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        phone: "123-456",
        subject: "Inquiry",
        message: "Test message here",
        read: false,
      });
      expect(result.name).toBe("John Doe");
    });
  });

  describe("markMessageRead", () => {
    it("should toggle message read status", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(
          onfulfilled({ data: { ...mockMessages[0], read: true }, error: null }),
        );
      });

      const result = await markMessageRead({ id: "msg-001", read: true });

      expect(mockSupabase.from).toHaveBeenCalledWith("contact_messages");
      expect(mockQuery.update).toHaveBeenCalledWith({ read: true });
      expect(mockQuery.eq).toHaveBeenCalledWith("id", "msg-001");
      expect(result.read).toBe(true);
    });
  });

  describe("deleteContactMessage", () => {
    it("should delete a contact message by ID", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ error: null }));
      });

      const result = await deleteContactMessage({ id: "msg-001" });

      expect(mockSupabase.from).toHaveBeenCalledWith("contact_messages");
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith("id", "msg-001");
      expect(result.success).toBe(true);
    });
  });
});
