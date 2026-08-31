import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

Deno.serve(async (req) => {
  // Supabase Edge Functions are called directly from the browser. Without
  // handling the CORS preflight, browsers report a generic "Failed to send a
  // request to the Edge Function" even when the function itself is healthy.
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization");

    if (!supabaseUrl || !serviceRoleKey || !authHeader) {
      return json({ error: "Não autorizado." }, 401);
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return json({ error: "Token de autenticação ausente." }, 401);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Validate the caller's access token before using the service role.
    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(token);

    if (userError || !user) {
      return json({ error: "Sessão inválida ou expirada. Faça login novamente." }, 401);
    }

    const userId = user.id;

    // Delete only records owned by the authenticated user.
    const { error: appointmentsError } = await admin
      .from("appointments")
      .delete()
      .eq("user_id", userId);
    if (appointmentsError) {
      console.error("appointments deletion failed", appointmentsError);
      return json({ error: "Não foi possível remover os agendamentos." }, 500);
    }

    const { error: servicesError } = await admin
      .from("services")
      .delete()
      .eq("user_id", userId);
    if (servicesError) {
      console.error("services deletion failed", servicesError);
      return json({ error: "Não foi possível remover os serviços." }, 500);
    }

    const { error: availabilityError } = await admin
      .from("availability_slots")
      .delete()
      .eq("user_id", userId);
    if (availabilityError) {
      console.error("availability deletion failed", availabilityError);
      return json({ error: "Não foi possível remover a disponibilidade." }, 500);
    }

    const { error: profileError } = await admin
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (profileError) {
      console.error("profile deletion failed", profileError);
      return json({ error: "Não foi possível remover o perfil." }, 500);
    }

    // Avatar deletion is best-effort. Account deletion must not fail just
    // because an avatar bucket/file is missing or already removed.
    try {
      const { data: files } = await admin.storage
        .from("avatars")
        .list(userId, { limit: 100 });

      if (files?.length) {
        const paths = files.map((file) => `${userId}/${file.name}`);
        await admin.storage.from("avatars").remove(paths);
      }
    } catch (storageError) {
      console.warn("avatar cleanup failed", storageError);
    }

    // The Auth user is deleted last. The service role key never reaches the
    // browser; it exists only in the Edge Function environment.
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      console.error("auth user deletion failed", deleteUserError);
      return json({ error: "Não foi possível excluir a conta de autenticação." }, 500);
    }

    return json({ success: true });
  } catch (error) {
    console.error("delete-account unexpected error", error);
    return json({ error: "Erro interno ao excluir a conta. Tente novamente." }, 500);
  }
});
