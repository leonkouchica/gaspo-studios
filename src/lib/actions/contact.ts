import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";

export const fetchContactMessages = createServerFn({ method: "GET" })
  .inputValidator((input: { filter?: "all" | "unread" | "read"; search?: string } | undefined) => input)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("contact_messages")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (data?.filter === "unread") {
      query = query.eq("read", false);
    } else if (data?.filter === "read") {
      query = query.eq("read", true);
    }

    if (data?.search) {
      query = query.or(`name.ilike.%${data.search}%,email.ilike.%${data.search}%,subject.ilike.%${data.search}%`);
    }

    const { data: messages, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch contact messages: ${error.message}`);
    }

    return (messages || []).map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone || undefined,
      subject: m.subject || undefined,
      message: m.message,
      submittedAt: m.submitted_at,
      read: m.read,
    }));
  });

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      subject: z.string().optional(),
      message: z.string().min(5),
    })
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { data: inserted, error } = await supabase
      .from("contact_messages")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject || null,
        message: data.message,
        read: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit message: ${error.message}`);
    }

    return {
      id: inserted.id,
      name: inserted.name,
      email: inserted.email,
      phone: inserted.phone || undefined,
      subject: inserted.subject || undefined,
      message: inserted.message,
      submittedAt: inserted.submitted_at,
      read: inserted.read,
    };
  });

export const markMessageRead = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      read: z.boolean(),
    })
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { data: updated, error } = await supabase
      .from("contact_messages")
      .update({ read: data.read })
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update message state: ${error.message}`);
    }

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone || undefined,
      subject: updated.subject || undefined,
      message: updated.message,
      submittedAt: updated.submitted_at,
      read: updated.read,
    };
  });

export const deleteContactMessage = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", data.id);

    if (error) {
      throw new Error(`Failed to delete message: ${error.message}`);
    }

    return { success: true };
  });
