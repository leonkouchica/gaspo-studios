import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";

export const listStaffUsers = createServerFn({ method: "GET" })
  .handler(async () => {
    const supabase = getSupabaseAdmin();
    
    // Fetch all roles from user_roles
    const { data: dbRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (rolesError) {
      throw new Error(`Failed to list staff roles: ${rolesError.message}`);
    }

    // Fetch actual users from auth.users (requires service role key)
    const { data: authResult, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.warn("Could not list auth users from admin API (possibly missing service role privileges). Matching using DB fallback.");
      return (dbRoles || []).map((r) => ({
        id: r.id,
        userId: r.user_id,
        role: r.role,
        email: "staff@gaspostudios.com", // Fallback email
        createdAt: r.created_at,
      }));
    }

    const authUsers = authResult.users || [];
    const userMap = new Map(authUsers.map((u) => [u.id, u.email]));

    return (dbRoles || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      role: r.role,
      email: userMap.get(r.user_id) || "unknown@gaspostudios.com",
      createdAt: r.created_at,
    }));
  });

export const createStaffUser = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(["admin", "editor", "photographer", "viewer"]),
    })
  )
  .handler(async ({ data, context }) => {
    const supabase = getSupabaseAdmin();

    // 1. Create the user in Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    if (!authUser.user) {
      throw new Error("Failed to create auth user: user returned null");
    }

    // 2. Insert into user_roles
    const { data: roleRecord, error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: authUser.user.id,
        role: data.role,
      })
      .select()
      .single();

    if (roleError) {
      // Clean up user if role insert failed to prevent orphaned auth users
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Failed to assign user role: ${roleError.message}`);
    }

    return {
      id: roleRecord.id,
      userId: authUser.user.id,
      email: authUser.user.email,
      role: roleRecord.role,
      createdAt: roleRecord.created_at,
    };
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId: z.string(),
      role: z.enum(["admin", "editor", "photographer", "viewer"]),
    })
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { data: updated, error } = await supabase
      .from("user_roles")
      .update({ role: data.role })
      .eq("user_id", data.userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }

    return {
      id: updated.id,
      userId: updated.user_id,
      role: updated.role,
      createdAt: updated.created_at,
    };
  });

export const deleteStaffUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    // Delete user from auth (will cascade delete user_roles via FK constraint)
    const { error } = await supabase.auth.admin.deleteUser(data.userId);

    if (error) {
      throw new Error(`Failed to delete staff user: ${error.message}`);
    }

    return { success: true };
  });
