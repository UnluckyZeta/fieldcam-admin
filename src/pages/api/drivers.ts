import type { APIRoute } from "astro";
import { supabaseServer } from "../../lib/supabase-server";

// POST /api/drivers
// Actions supported: 'create', 'delete', 'reset-password'
export const POST: APIRoute = async ({ request, cookies }) => {
  const adminId = cookies.get("admin_id")?.value;
  if (!adminId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    // ── CREATE DRIVER ──────────────────────────────────────────
    if (action === "create") {
      const { full_name, email, phone } = body;

      if (!full_name || !email) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
      }

      // Generate credentials
      const driver_code = "DRV" + Math.floor(100000 + Math.random() * 900000);
      const password = Math.random().toString(36).slice(-8) + "Dr!";

      // 1. Create auth user
      const { data: authUser, error: authError } = await supabaseServer.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role: "driver" }
      });

      if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), { status: 400 });
      }

      const userId = authUser.user.id;

      // 2. Create driver profile in public.drivers
      const { error: dbError } = await supabaseServer
        .from("drivers")
        .insert({
          id: userId,
          driver_code,
          full_name,
          phone: phone || null
        });

      if (dbError) {
        // Roll back auth user if DB insert fails
        await supabaseServer.auth.admin.deleteUser(userId);
        return new Response(JSON.stringify({ error: dbError.message }), { status: 400 });
      }

      return new Response(JSON.stringify({
        success: true,
        driver_code,
        email,
        password,
        id: userId
      }), { status: 200 });
    }

    // ── DELETE DRIVER ──────────────────────────────────────────
    if (action === "delete") {
      const { id } = body;
      if (!id) {
        return new Response(JSON.stringify({ error: "Missing driver ID" }), { status: 400 });
      }

      // Delete from DB drivers table
      const { error: dbError } = await supabaseServer
        .from("drivers")
        .delete()
        .eq("id", id);

      if (dbError) {
        return new Response(JSON.stringify({ error: dbError.message }), { status: 400 });
      }

      // Delete from Supabase Auth
      const { error: authError } = await supabaseServer.auth.admin.deleteUser(id);
      if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), { status: 400 });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // ── RESET PASSWORD ─────────────────────────────────────────
    if (action === "reset-password") {
      const { id, password } = body;
      if (!id || !password) {
        return new Response(JSON.stringify({ error: "Missing ID or password" }), { status: 400 });
      }

      const { error: authError } = await supabaseServer.auth.admin.updateUserById(id, {
        password
      });

      if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), { status: 400 });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Unsupported action" }), { status: 400 });

  } catch (err: any) {
    console.error("[API Drivers] Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Server Error" }), { status: 500 });
  }
};
