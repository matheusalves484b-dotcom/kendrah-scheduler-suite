// supabase/functions/send-reminders-1h/index.ts
//
// Chamada periodicamente por um pg_cron job (a cada 10-15 minutos).
// Busca appointments que acontecem em ~1h e ainda não receberam o lembrete de 1h,
// e dispara o template lembrete_1h_agendamento para o CLIENTE.
//
// Janela: 50 a 70 minutos de antecedência (margem para cobrir o intervalo
// entre execuções do cron, já que ele roda a cada ~10-15 min).

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function formatarHoraBR(isoString: string) {
  const data = new Date(isoString);
  return data.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

Deno.serve(async (req: Request) => {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 50 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 70 * 60 * 1000);

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        id,
        start_time,
        customer_name,
        customer_phone,
        status,
        reminder_1h_sent,
        profiles (
          business_name
        )
      `)
      .gte("start_time", windowStart.toISOString())
      .lte("start_time", windowEnd.toISOString())
      .eq("status", "confirmed")
      .eq("reminder_1h_sent", false);

    if (error) throw error;

    const resultados = [];

    for (const ag of appointments ?? []) {
      const horaFormatada = formatarHoraBR(ag.start_time);
      const businessName = ag.profiles?.business_name ?? "";

      await supabase.functions.invoke("whatsapp-send", {
        body: {
          to: ag.customer_phone,
          templateName: "lembrete_1h_agendamento",
          headerParams: [businessName],
          bodyParams: [businessName, ag.customer_name, horaFormatada],
        },
      });

      await supabase
        .from("appointments")
        .update({ reminder_1h_sent: true })
        .eq("id", ag.id);

      resultados.push({ id: ag.id, status: "lembrete 1h enviado (cliente)" });
    }

    return new Response(JSON.stringify({ processados: resultados.length, resultados }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erro ao enviar lembretes de 1h:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
