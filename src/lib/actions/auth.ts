import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server.ts";
import { requireAuth } from "../auth-guard.server.ts";

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password must be at most 128 characters")
  .refine((pw) => /[A-Z]/.test(pw), "Password must contain at least one uppercase letter")
  .refine((pw) => /[a-z]/.test(pw), "Password must contain at least one lowercase letter")
  .refine((pw) => /[0-9]/.test(pw), "Password must contain at least one number")
  .refine((pw) => /[^A-Za-z0-9]/.test(pw), "Password must contain at least one special character");

export const listStaffUsers = createServerFn({ method: "GET" }).handler(async () => {
  requireAuth();
  const supabase = getSupabaseAdmin();

  const { data: dbRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select("*")
    .order("created_at", { ascending: false });

  if (rolesError) {
    throw new Error(`Failed to list staff roles: ${rolesError.message}`);
  }

  const { data: authResult, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.warn("Could not list auth users from admin API. Matching using DB fallback.");
    return (dbRoles || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      role: r.role,
      email: "staff@gaspostudios.com",
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
      password: passwordSchema,
      role: z.enum(["admin", "editor", "photographer", "viewer"]),
      requestingUserId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

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

    const { data: roleRecord, error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: authUser.user.id, role: data.role })
      .select()
      .single();

    if (roleError) {
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
      requestingUserId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    // Prevent self-demotion
    const currentUser = requireAuth();
    if (data.userId === currentUser.userId) {
      throw new Error("You cannot modify your own account. Ask another admin.");
    }

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
  .inputValidator(
    z.object({
      userId: z.string(),
      requestingUserId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    requireAuth();
    const supabase = getSupabaseAdmin();

    // Prevent self-deletion
    const currentUser = requireAuth();
    if (data.userId === currentUser.userId) {
      throw new Error("You cannot delete your own account. Ask another admin.");
    }

    // Prevent deleting the last admin
    const { count: adminCount } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if (adminCount !== null && adminCount <= 1) {
      const { data: targetRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.userId)
        .single();

      if (targetRole?.role === "admin") {
        throw new Error("Cannot delete the last admin. Assign another admin first.");
      }
    }

    const { error } = await supabase.auth.admin.deleteUser(data.userId);
    if (error) {
      throw new Error(`Failed to delete staff user: ${error.message}`);
    }

    return { success: true };
  });
