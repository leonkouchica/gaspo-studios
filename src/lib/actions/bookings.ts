import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { requireAuth } from "../auth-guard.server.ts";

const bookingStatusSchema = z.enum(["new", "reviewed", "confirmed", "completed", "cancelled"]);

export const fetchBookings = createServerFn({ method: "GET" })
  .inputValidator((input: { status?: string; search?: string } | undefined) => input)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("bookings")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (data?.status && data.status !== "all") {
      query = query.eq("status", data.status);
    }

    if (data?.search) {
      query = query.or(`name.ilike.%${data.search}%,email.ilike.%${data.search}%,service.ilike.%${data.search}%`);
    }

    const { data: bookingsData, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }

    // Map DB underscore fields back to camelCase frontend interface
    return (bookingsData || []).map((b) => ({
      id: b.id,
      name: b.name,
      email: b.email,
      phone: b.phone,
      service: b.service,
      package: b.package,
      preferredDate: b.preferred_date,
      preferredTime: b.preferred_time,
      message: b.message || undefined,
      status: b.status,
      submittedAt: b.submitted_at,
      adminNotes: b.admin_notes || undefined,
      totalValue: Number(b.total_value),
    }));
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      status: bookingStatusSchema,
      adminNotes: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();
    const updatePayload: Record<string, any> = { status: data.status };
    if (data.adminNotes !== undefined) {
      updatePayload.admin_notes = data.adminNotes;
    }

    const { data: updatedData, error } = await supabase
      .from("bookings")
      .update(updatePayload)
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update booking: ${error.message}`);
    }

    return {
      id: updatedData.id,
      name: updatedData.name,
      email: updatedData.email,
      phone: updatedData.phone,
      service: updatedData.service,
      package: updatedData.package,
      preferredDate: updatedData.preferred_date,
      preferredTime: updatedData.preferred_time,
      message: updatedData.message || undefined,
      status: updatedData.status,
      submittedAt: updatedData.submitted_at,
      adminNotes: updatedData.admin_notes || undefined,
      totalValue: Number(updatedData.total_value),
    };
  });

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      service: z.string(),
      package: z.string(),
      preferredDate: z.string(),
      preferredTime: z.string(),
      message: z.string().optional(),
      totalValue: z.number().default(0),
    })
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { data: insertedData, error } = await supabase
      .from("bookings")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        service: data.service,
        package: data.package,
        preferred_date: data.preferredDate,
        preferred_time: data.preferredTime,
        message: data.message || null,
        status: "new",
        total_value: data.totalValue,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create booking: ${error.message}`);
    }

    return {
      id: insertedData.id,
      name: insertedData.name,
      email: insertedData.email,
      phone: insertedData.phone,
      service: insertedData.service,
      package: insertedData.package,
      preferredDate: insertedData.preferred_date,
      preferredTime: insertedData.preferred_time,
      message: insertedData.message || undefined,
      status: insertedData.status,
      submittedAt: insertedData.submitted_at,
      adminNotes: insertedData.admin_notes || undefined,
      totalValue: Number(insertedData.total_value),
    };
  });
