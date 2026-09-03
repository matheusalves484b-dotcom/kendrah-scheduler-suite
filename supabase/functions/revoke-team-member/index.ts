import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");
    if (!supabaseUrl || !serviceRoleKey || !anonKey || !authHeader) return json({ success: false, error: "Não autorizado." }, 401);

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) return json({ success: false, error: "Sessão inválida ou expirada." }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: member, error: memberError } = await admin
      .from("team_members")
      .select("id, member_id, invited_email, status")
      .eq("owner_id", user.id)
      .in("status", ["pending", "active"])
      .maybeSingle();

    if (memberError) throw memberError;
    if (!member) return json({ success: false, error: "Nenhum profissional ativo ou convite pendente encontrado." }, 404);

    // A conta do profissional é criada pelo convite do Supabase. Ao removê-lo,
    // apagamos também essa identidade para liberar o mesmo e-mail para um novo
    // cadastro independente no KENDRAH.
    if (member.member_id) {
      const { error: deleteUserError } = await admin.auth.admin.deleteUser(member.member_id);
      if (deleteUserError) throw new Error(`Não foi possível liberar o e-mail do profissional: ${deleteUserError.message}`);
    }

    const { error: revokeError } = await admin
      .from("team_members")
      .update({ status: "revoked", member_id: null, updated_at: new Date().toISOString() })
      .eq("id", member.id)
      .eq("owner_id", user.id);

    if (revokeError) throw revokeError;
    return json({ success: true });
  } catch (error) {
    console.error("Erro ao remover profissional:", error);
    return json({ success: false, error: error instanceof Error ? error.message : String(error) }, 400);
  }
});
