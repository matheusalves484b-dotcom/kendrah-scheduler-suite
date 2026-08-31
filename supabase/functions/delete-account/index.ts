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
    if (!token) return json({ error: "Token de autenticação ausente." }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Validate the caller before using the service role.
    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(token);

    if (userError || !user) {
      return json({ error: "Sessão inválida ou expirada. Faça login novamente." }, 401);
    }

    const userId = user.id;

    // Capture avatar paths before deleting the Auth user. The database schema
    // uses ON DELETE CASCADE from auth.users -> profiles -> owned records,
    // so the database deletion is performed atomically by PostgreSQL when the
    // Auth user is removed. We intentionally do not manually delete these
    // rows one-by-one, which could leave a partially deleted account.
    let avatarPaths: string[] = [];
    try {
      const { data: files } = await admin.storage
        .from("avatars")
        .list(userId, { limit: 100 });
      if (files?.length) avatarPaths = files.map((file) => `${userId}/${file.name}`);
    } catch (storageError) {
      console.warn("Could not inspect avatar files before deletion", storageError);
    }

    // IMPORTANT: profiles.id references auth.users(id) ON DELETE CASCADE.
    // services, appointments and availability_slots reference profiles(id)
    // ON DELETE CASCADE. Therefore this single Auth deletion atomically
    // removes the user's relational data, or none of it if the deletion fails.
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      console.error("auth user deletion failed", deleteUserError);
      return json({
        error: "Não foi possível excluir a conta. Nenhum dado do banco foi removido.",
      }, 500);
    }

    // Storage is outside the PostgreSQL transaction. It is deliberately
    // cleaned only after the account deletion succeeds, so a storage failure
    // can never cause a partially deleted database account.
    if (avatarPaths.length) {
      try {
        const { error: storageError } = await admin.storage
          .from("avatars")
          .remove(avatarPaths);
        if (storageError) console.warn("Avatar cleanup failed", storageError);
      } catch (storageError) {
        console.warn("Avatar cleanup failed", storageError);
      }
    }

    return json({ success: true });
  } catch (error) {
    console.error("delete-account unexpected error", error);
    return json({ error: "Erro interno ao excluir a conta. Tente novamente." }, 500);
  }
});
