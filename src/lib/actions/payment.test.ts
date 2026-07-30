import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchPaymentSettings,
  upsertPaymentSettings,
  initPaystackTransaction,
  initFlutterwaveTransaction,
  verifyPaystackPayment,
  verifyFlutterwavePayment,
} from "./payment";

const mockSettings = [
  {
    id: "setting-123",
    gateway: "paystack",
    public_key: "pk_test_123",
    secret_key: "sk_test_456",
    active: true,
    test_mode: true,
    updated_at: "2026-05-31T12:00:00Z",
  },
];

const mockQuery: any = {
  select: vi.fn(),
  eq: vi.fn(),
  upsert: vi.fn(),
  single: vi.fn(),
  then: vi.fn(),
};

mockQuery.select.mockReturnValue(mockQuery);
mockQuery.eq.mockReturnValue(mockQuery);
mockQuery.upsert.mockReturnValue(mockQuery);
mockQuery.single.mockReturnValue(mockQuery);

const mockSupabase = {
  from: vi.fn().mockReturnValue(mockQuery),
};

vi.mock("../supabase.server.ts", () => ({
  getSupabaseAdmin: () => mockSupabase,
}));

// Mock global fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("Payment Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchPaymentSettings", () => {
    it("should retrieve payment settings details", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockSettings, error: null }));
      });

      const result = await fetchPaymentSettings();

      expect(mockSupabase.from).toHaveBeenCalledWith("payment_settings");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "setting-123",
        gateway: "paystack",
        publicKey: "pk_test_123",
        active: true,
        testMode: true,
        updatedAt: "2026-05-31T12:00:00Z",
      });
    });
  });

  describe("upsertPaymentSettings", () => {
    it("should upsert and return settings", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockSettings[0], error: null }));
      });

      const result = await upsertPaymentSettings({
        gateway: "paystack",
        publicKey: "pk_test_123",
        secretKey: "sk_test_456",
        active: true,
        testMode: true,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("payment_settings");
      expect(mockQuery.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          gateway: "paystack",
          public_key: "pk_test_123",
          secret_key: "sk_test_456",
          active: true,
          test_mode: true,
        }),
        { onConflict: "gateway" },
      );
      expect(result.gateway).toBe("paystack");
    });
  });

  describe("initPaystackTransaction", () => {
    it("should trigger simulated mock fallback if gateway is inactive", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(
          onfulfilled({
            data: { secret_key: "sk_test_456", active: false },
            error: null,
          }),
        );
      });

      const result = await initPaystackTransaction({
        amount: 5000,
        email: "test@example.com",
      });

      expect(result.isMock).toBe(true);
      expect(result.authorizationUrl).toContain("/events/payment-mock");
      expect(result.reference).toContain("pstk_mock_");
    });

    it("should execute fetch call to Paystack API if gateway is active", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(
          onfulfilled({
            data: { secret_key: "sk_test_456", active: true },
            error: null,
          }),
        );
      });

      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          status: true,
          data: {
            authorization_url: "https://checkout.paystack.com/123",
            reference: "ref-456",
          },
        }),
      });

      const result = await initPaystackTransaction({
        amount: 5000,
        email: "test@example.com",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.paystack.co/transaction/initialize",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer sk_test_456",
          }),
        }),
      );
      expect(result.isMock).toBe(false);
      expect(result.reference).toBe("ref-456");
    });
  });

  describe("initFlutterwaveTransaction", () => {
    it("should trigger simulated mock fallback if gateway is inactive", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(
          onfulfilled({
            data: { secret_key: "sk_flw_456", active: false },
            error: null,
          }),
        );
      });

      const result = await initFlutterwaveTransaction({
        amount: 3000,
        email: "test@example.com",
        fullName: "Test User",
      });

      expect(result.isMock).toBe(true);
      expect(result.txRef).toContain("flw_mock_");
    });
  });

  describe("verifyPaystackPayment", () => {
    it("should resolve instantly as success if reference starts with mock prefix", async () => {
      const result = await verifyPaystackPayment({ reference: "pstk_mock_12345" });
      expect(result.status).toBe("success");
      expect(result.isMock).toBe(true);
    });

    it("should execute fetch verify call to Paystack if real reference provided", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(
          onfulfilled({
            data: { secret_key: "sk_test_456" },
            error: null,
          }),
        );
      });

      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          status: true,
          data: {
            status: "success",
            amount: 500000, // 5000 NGN in kobo
            metadata: {},
          },
        }),
      });

      const result = await verifyPaystackPayment({ reference: "pstk_real_123" });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.paystack.co/transaction/verify/pstk_real_123",
        expect.objectContaining({
          headers: { Authorization: "Bearer sk_test_456" },
        }),
      );
      expect(result.status).toBe("success");
      expect(result.amount).toBe(5000);
      expect(result.isMock).toBe(false);
    });
  });

  describe("verifyFlutterwavePayment", () => {
    it("should resolve instantly if transactionId starts with mock prefix", async () => {
      const result = await verifyFlutterwavePayment({ transactionId: "flw_mock_123" });
      expect(result.status).toBe("success");
      expect(result.isMock).toBe(true);
    });
  });
});
