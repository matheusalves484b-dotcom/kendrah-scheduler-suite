import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SITE_URL = (Deno.env.get("SITE_URL") ?? "https://kendrah-scheduler-suite.lovable.app").replace(/\/$/, "");

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Configuração do Supabase incompleta na Edge Function.");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autenticado.");

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Sessão inválida ou expirada.");

    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      throw new Error("Informe um e-mail válido.");
    }

    if (email === user.email?.toLowerCase()) {
      throw new Error("Você não pode adicionar seu próprio e-mail.");
    }

    const { data: existingMember, error: existingError } = await admin
      .from("team_members")
      .select("id, invited_email, status")
      .eq("owner_id", user.id)
      .in("status", ["pending", "active"])
      .maybeSingle();

    if (existingError) throw existingError;
    if (existingMember) {
      throw new Error("Sua conta já possui um profissional convidado ou ativo.");
    }

    const { data: invitation, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${SITE_URL}/auth/accept-invite`,
    });

    if (inviteError) {
      if (inviteError.message.toLowerCase().includes("already registered")) {
        throw new Error("Este e-mail já possui uma conta no KENDRAH. Peça ao profissional para entrar normalmente e, se necessário, podemos tratar contas existentes separadamente.");
      }
      throw inviteError;
    }

    const { error: insertError } = await admin
      .from("team_members")
      .insert({
        owner_id: user.id,
        member_id: invitation.user?.id ?? null,
        invited_email: email,
        role: "professional",
        status: "pending",
      });

    if (insertError) {
      await admin.auth.admin.deleteUser(invitation.user.id);
      throw insertError;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao enviar convite de profissional:", error);

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
