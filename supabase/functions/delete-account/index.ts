import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization");

  if (!supabaseUrl || !serviceRoleKey || !authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const token = authHeader.replace(/^Bearer\s+/i, "");
  const { data: { user }, error: userError } = await admin.auth.getUser(token);

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Sessão inválida ou expirada." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = user.id;

  // Remove user-owned records and storage before deleting the Auth user.
  // Auth deletion is the final operation so a failure does not silently
  // remove the identity while leaving the account unusable.
  const { error: appointmentsError } = await admin
    .from("appointments")
    .delete()
    .eq("user_id", userId);
  if (appointmentsError) {
    return new Response(JSON.stringify({ error: "Não foi possível remover os agendamentos." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error: servicesError } = await admin
    .from("services")
    .delete()
    .eq("user_id", userId);
  if (servicesError) {
    return new Response(JSON.stringify({ error: "Não foi possível remover os serviços." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error: availabilityError } = await admin
    .from("availability_slots")
    .delete()
    .eq("user_id", userId);
  if (availabilityError) {
    return new Response(JSON.stringify({ error: "Não foi possível remover a disponibilidade." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error: profileError } = await admin
    .from("profiles")
    .delete()
    .eq("id", userId);
  if (profileError) {
    return new Response(JSON.stringify({ error: "Não foi possível remover o perfil." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error: storageListError, data: files } = await admin.storage
    .from("avatars")
    .list(userId, { limit: 100 });

  if (!storageListError && files?.length) {
    const paths = files.map((file) => `${userId}/${file.name}`);
    await admin.storage.from("avatars").remove(paths);
  }

  const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
  if (deleteUserError) {
    return new Response(JSON.stringify({ error: "Não foi possível excluir a conta de autenticação." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
