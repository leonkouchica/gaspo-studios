import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { requireAuth } from "../auth-guard.server.ts";

export const fetchPaymentSettings = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("payment_settings")
    .select("id, gateway, public_key, active, test_mode, updated_at");

  if (error) {
    throw new Error(`Failed to fetch payment settings: ${error.message}`);
  }

  return (data || []).map((setting) => ({
    id: setting.id,
    gateway: setting.gateway,
    publicKey: setting.public_key || "",
    active: setting.active,
    testMode: setting.test_mode,
    updatedAt: setting.updated_at,
  }));
});

export const upsertPaymentSettings = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      gateway: z.enum(["paystack", "flutterwave"]),
      publicKey: z.string(),
      secretKey: z.string().optional(),
      active: z.boolean(),
      testMode: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    // Check if secretKey is provided, if not, do not overwrite existing secret key
    const updatePayload: Record<string, any> = {
      gateway: data.gateway,
      public_key: data.publicKey,
      active: data.active,
      test_mode: data.testMode,
      updated_at: new Date().toISOString(),
    };

    if (data.secretKey) {
      updatePayload.secret_key = data.secretKey;
    }

    const { data: upserted, error } = await supabase
      .from("payment_settings")
      .upsert(updatePayload, { onConflict: "gateway" })
      .select("id, gateway, public_key, active, test_mode, updated_at")
      .single();

    if (error) {
      throw new Error(`Failed to save payment settings: ${error.message}`);
    }

    return {
      id: upserted.id,
      gateway: upserted.gateway,
      publicKey: upserted.public_key,
      active: upserted.active,
      testMode: upserted.test_mode,
      updatedAt: upserted.updated_at,
    };
  });

export const initPaystackTransaction = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      amount: z.number().positive(),
      email: z.string().email(),
      metadata: z.record(z.any()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    // Retrieve Paystack key from DB
    const { data: setting, error } = await supabase
      .from("payment_settings")
      .select("secret_key, active")
      .eq("gateway", "paystack")
      .single();

    const secretKey = setting?.active ? setting.secret_key : null;

    if (!secretKey) {
      // Mock flow if Paystack is not set up / active
      const mockRef = `pstk_mock_${Math.random().toString(36).substring(7)}`;
      return {
        authorizationUrl: `/events/payment-mock?gateway=paystack&reference=${mockRef}&amount=${data.amount}&email=${encodeURIComponent(data.email)}`,
        reference: mockRef,
        isMock: true,
      };
    }

    // Call actual Paystack API
    try {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          amount: Math.round(data.amount * 100), // Kobo / cents
          metadata: data.metadata,
        }),
      });

      const resJson = await response.json();
      if (!resJson.status) {
        throw new Error(resJson.message || "Paystack initialization failed");
      }

      return {
        authorizationUrl: resJson.data.authorization_url,
        reference: resJson.data.reference,
        isMock: false,
      };
    } catch (err: any) {
      throw new Error(`Paystack integration error: ${err.message}`);
    }
  });

export const initFlutterwaveTransaction = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      amount: z.number().positive(),
      email: z.string().email(),
      fullName: z.string(),
      phone: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    // Retrieve Flutterwave key from DB
    const { data: setting, error } = await supabase
      .from("payment_settings")
      .select("secret_key, active")
      .eq("gateway", "flutterwave")
      .single();

    const secretKey = setting?.active ? setting.secret_key : null;

    if (!secretKey) {
      // Mock flow if Flutterwave is not active
      const mockTxId = `flw_mock_${Math.random().toString(36).substring(7)}`;
      return {
        paymentLink: `/events/payment-mock?gateway=flutterwave&tx_ref=${mockTxId}&amount=${data.amount}&email=${encodeURIComponent(data.email)}`,
        txRef: mockTxId,
        isMock: true,
      };
    }

    // Call actual Flutterwave API
    try {
      const txRef = `flw_ref_${Math.random().toString(36).substring(7)}`;
      const response = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: txRef,
          amount: data.amount.toString(),
          currency: "NGN",
          redirect_url: `${import.meta.env.VITE_SITE_URL || "http://localhost:3000"}/events/payment-callback?gateway=flutterwave`,
          customer: {
            email: data.email,
            phonenumber: data.phone || "0000000000",
            name: data.fullName,
          },
          meta: data.metadata,
          customizations: {
            title: "Gaspo Studios",
            description: "Event Registration Payment",
            logo: `${import.meta.env.VITE_SITE_URL || "http://localhost:3000"}/images/logo.png`,
          },
        }),
      });

      const resJson = await response.json();
      if (resJson.status !== "success") {
        throw new Error(resJson.message || "Flutterwave initialization failed");
      }

      return {
        paymentLink: resJson.data.link,
        txRef,
        isMock: false,
      };
    } catch (err: any) {
      throw new Error(`Flutterwave integration error: ${err.message}`);
    }
  });

export const verifyPaystackPayment = createServerFn({ method: "POST" })
  .inputValidator(z.object({ reference: z.string() }))
  .handler(async ({ data }) => {
    // If it's a mock reference
    if (data.reference.startsWith("pstk_mock_")) {
      return { status: "success", reference: data.reference, isMock: true };
    }

    const supabase = getSupabaseAdmin();
    const { data: setting } = await supabase
      .from("payment_settings")
      .select("secret_key")
      .eq("gateway", "paystack")
      .single();

    if (!setting?.secret_key) {
      throw new Error("Paystack gateway not configured");
    }

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${data.reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${setting.secret_key}`,
        },
      });

      const resJson = await response.json();
      if (!resJson.status || resJson.data.status !== "success") {
        throw new Error(resJson.message || "Payment verification failed");
      }

      return {
        status: "success",
        reference: data.reference,
        amount: resJson.data.amount / 100,
        metadata: resJson.data.metadata,
        isMock: false,
      };
    } catch (err: any) {
      throw new Error(`Paystack verification error: ${err.message}`);
    }
  });

export const verifyFlutterwavePayment = createServerFn({ method: "POST" })
  .inputValidator(z.object({ transactionId: z.string() }))
  .handler(async ({ data }) => {
    // If it's a mock transaction
    if (data.transactionId.startsWith("flw_mock_")) {
      return { status: "success", transactionId: data.transactionId, isMock: true };
    }

    const supabase = getSupabaseAdmin();
    const { data: setting } = await supabase
      .from("payment_settings")
      .select("secret_key")
      .eq("gateway", "flutterwave")
      .single();

    if (!setting?.secret_key) {
      throw new Error("Flutterwave gateway not configured");
    }

    try {
      const response = await fetch(
        `https://api.flutterwave.com/v3/transactions/${data.transactionId}/verify`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${setting.secret_key}`,
          },
        },
      );

      const resJson = await response.json();
      if (resJson.status !== "success" || resJson.data.status !== "successful") {
        throw new Error(resJson.message || "Payment verification failed");
      }

      return {
        status: "success",
        transactionId: data.transactionId,
        amount: resJson.data.amount,
        txRef: resJson.data.tx_ref,
        metadata: resJson.data.meta,
        isMock: false,
      };
    } catch (err: any) {
      throw new Error(`Flutterwave verification error: ${err.message}`);
    }
  });
