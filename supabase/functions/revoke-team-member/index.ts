import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");

    if (!supabaseUrl || !serviceRoleKey || !anonKey || !authHeader) {
      return json({ success: false, error: "Não autorizado." }, 401);
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
      data: { user },
      error: userError,
    } = await callerClient.auth.getUser();

    if (userError || !user) {
      return json({ success: false, error: "Sessão inválida ou expirada." }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const teamMemberId = typeof body?.team_member_id === "string"
      ? body.team_member_id
      : null;

    if (!teamMemberId) {
      return json({ success: false, error: "ID do profissional não informado." }, 400);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Localiza exatamente o profissional que o proprietário solicitou remover.
    const { data: member, error: memberError } = await admin
      .from("team_members")
      .select("id, owner_id, member_id, invited_email, status")
      .eq("id", teamMemberId)
      .eq("owner_id", user.id)
      .in("status", ["pending", "active"])
      .maybeSingle();

    if (memberError) throw memberError;
    if (!member) {
      return json({ success: false, error: "Profissional não encontrado, já removido ou sem acesso." }, 404);
    }

    // Nunca permitir que o proprietário da conta seja excluído.
    if (member.member_id === user.id) {
      return json({ success: false, error: "Não é possível remover o proprietário da conta." }, 400);
    }

    let deletedAuthUser = false;

    // Se já existe member_id, remove diretamente pelo UUID do Auth.
    if (member.member_id) {
      const { error: deleteUserError } = await admin.auth.admin.deleteUser(member.member_id);
      if (deleteUserError) {
        throw new Error(`Não foi possível liberar o e-mail do profissional: ${deleteUserError.message}`);
      }
      deletedAuthUser = true;
    } else if (member.invited_email) {
      // Convites pendentes podem não ter member_id. Nesse caso, localiza a conta
      // do Auth pelo e-mail e remove somente essa conta.
      const targetEmail = member.invited_email.trim().toLowerCase();
      let page = 1;
      const perPage = 1000;

      while (true) {
        const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
          page,
          perPage,
        });

        if (usersError) throw usersError;

        const users = usersData?.users ?? [];
        const authUser = users.find(
          (candidate) => candidate.email?.trim().toLowerCase() === targetEmail,
        );

        if (authUser) {
          // Proteção adicional contra exclusão do proprietário por e-mail.
          if (authUser.id === user.id) {
            return json({ success: false, error: "Não é possível remover o proprietário da conta." }, 400);
          }

          const { error: deleteUserError } = await admin.auth.admin.deleteUser(authUser.id);
          if (deleteUserError) {
            throw new Error(`Não foi possível liberar o e-mail do profissional: ${deleteUserError.message}`);
          }
          deletedAuthUser = true;
          break;
        }

        if (users.length < perPage) break;
        page += 1;
      }
    }

    // Só marca como revogado depois de concluir a remoção da conta do Auth.
    const { error: revokeError } = await admin
      .from("team_members")
      .update({
        status: "revoked",
        member_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", member.id)
      .eq("owner_id", user.id);

    if (revokeError) throw revokeError;

    return json({
      success: true,
      deleted_auth_user: deletedAuthUser,
      message: "Profissional removido e e-mail liberado para novo cadastro independente.",
    });
  } catch (error) {
    console.error("Erro ao remover profissional:", error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, 400);
  }
});
