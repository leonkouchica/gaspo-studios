import { describe, it, expect, vi, beforeEach } from "vitest";
import { listStaffUsers, createStaffUser, updateUserRole, deleteStaffUser } from "./auth";

const mockQuery: any = {
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  single: vi.fn(),
  then: vi.fn(),
};

mockQuery.select.mockReturnValue(mockQuery);
mockQuery.eq.mockReturnValue(mockQuery);
mockQuery.order.mockReturnValue(mockQuery);
mockQuery.update.mockReturnValue(mockQuery);
mockQuery.insert.mockReturnValue(mockQuery);
mockQuery.single.mockReturnValue(mockQuery);

const mockAdmin = {
  listUsers: vi.fn(),
  createUser: vi.fn(),
  deleteUser: vi.fn(),
};

const mockSupabase = {
  from: vi.fn().mockReturnValue(mockQuery),
  auth: {
    admin: mockAdmin,
  },
};

vi.mock("../supabase.server.ts", () => ({
  getSupabaseAdmin: () => mockSupabase,
}));

describe("Auth Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listStaffUsers", () => {
    it("should list db user roles mapped with matching emails from auth admin list", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(
          onfulfilled({
            data: [{ id: "role-1", user_id: "user-123", role: "editor", created_at: "2026-05-30" }],
            error: null,
          }),
        );
      });

      mockAdmin.listUsers.mockResolvedValueOnce({
        data: {
          users: [{ id: "user-123", email: "editor@example.com" }],
        },
        error: null,
      });

      const result = await listStaffUsers();

      expect(mockSupabase.from).toHaveBeenCalledWith("user_roles");
      expect(mockAdmin.listUsers).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "role-1",
        userId: "user-123",
        role: "editor",
        email: "editor@example.com",
        createdAt: "2026-05-30",
      });
    });

    it("should fall back to placeholder email if admin user listing fails", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(
          onfulfilled({
            data: [{ id: "role-1", user_id: "user-123", role: "editor", created_at: "2026-05-30" }],
            error: null,
          }),
        );
      });

      mockAdmin.listUsers.mockResolvedValueOnce({
        data: null,
        error: { message: "Access Denied" },
      });

      const result = await listStaffUsers();

      expect(result[0].email).toBe("staff@gaspostudios.com");
    });
  });

  describe("createStaffUser", () => {
    it("should create auth user and insert role mapping", async () => {
      mockAdmin.createUser.mockResolvedValueOnce({
        data: {
          user: { id: "new-user-id", email: "staff@example.com" },
        },
        error: null,
      });

      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(
          onfulfilled({
            data: { id: "role-2", role: "photographer", created_at: "2026-05-31" },
            error: null,
          }),
        );
      });

      const result = await createStaffUser({
        email: "staff@example.com",
        password: "securepassword",
        role: "photographer",
      });

      expect(mockAdmin.createUser).toHaveBeenCalledWith({
        email: "staff@example.com",
        password: "securepassword",
        email_confirm: true,
      });
      expect(mockQuery.insert).toHaveBeenCalledWith({
        user_id: "new-user-id",
        role: "photographer",
      });
      expect(result).toEqual({
        id: "role-2",
        userId: "new-user-id",
        email: "staff@example.com",
        role: "photographer",
        createdAt: "2026-05-31",
      });
    });
  });

  describe("updateUserRole", () => {
    it("should update role level mapped to a userId", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(
          onfulfilled({
            data: { id: "role-1", user_id: "user-123", role: "admin", created_at: "2026-05-30" },
            error: null,
          }),
        );
      });

      const result = await updateUserRole({
        userId: "user-123",
        role: "admin",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("user_roles");
      expect(mockQuery.update).toHaveBeenCalledWith({ role: "admin" });
      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(result.role).toBe("admin");
    });
  });

  describe("deleteStaffUser", () => {
    it("should request cascade deletes on auth user", async () => {
      mockAdmin.deleteUser.mockResolvedValueOnce({
        error: null,
      });

      const result = await deleteStaffUser({ userId: "user-123" });

      expect(mockAdmin.deleteUser).toHaveBeenCalledWith("user-123");
      expect(result.success).toBe(true);
    });
  });
});
