// supabase/functions/send-reminders/index.ts
//
// Chamada periodicamente por um pg_cron job (ex: a cada hora).
// Busca appointments que acontecem em ~24h e ainda não receberam lembrete,
// e dispara o template correspondente para cliente e prestador (via profiles).
//
// - lembrete_agendamento (cliente): TEM cabeçalho -> envia headerParams
// - lembrete_atendimento_prestador (prestador): NÃO tem cabeçalho -> não envia headerParams
// - Datas/horas formatadas no fuso America/Sao_Paulo

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function formatarDataHoraBR(isoString: string) {
  const data = new Date(isoString);
  const dataFormatada = data.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
  const horaFormatada = data.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dataFormatada, horaFormatada };
}

Deno.serve(async (req: Request) => {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        id,
        start_time,
        service_name,
        customer_name,
        customer_phone,
        status,
        reminder_sent,
        profiles (
          business_name,
          whatsapp_number
        )
      `)
      .gte("start_time", windowStart.toISOString())
      .lte("start_time", windowEnd.toISOString())
      .eq("status", "confirmed")
      .eq("reminder_sent", false);

    if (error) throw error;

    const resultados = [];

    for (const ag of appointments ?? []) {
      const { dataFormatada, horaFormatada } = formatarDataHoraBR(ag.start_time);
      const businessName = ag.profiles?.business_name ?? "";
      const providerPhone = ag.profiles?.whatsapp_number ?? "";

      // Lembrete para o cliente (template COM cabeçalho)
      await supabase.functions.invoke("whatsapp-send", {
        body: {
          to: ag.customer_phone,
          templateName: "lembrete_agendamento",
          headerParams: [businessName],
          bodyParams: [businessName, ag.customer_name, dataFormatada, horaFormatada],
        },
      });

      // Lembrete para o prestador (template SEM cabeçalho -> sem headerParams)
      if (providerPhone) {
        await supabase.functions.invoke("whatsapp-send", {
          body: {
            to: providerPhone,
            templateName: "lembrete_atendimento_prestador",
            bodyParams: [
              businessName,
              businessName,
              ag.customer_name,
              dataFormatada,
              horaFormatada,
            ],
          },
        });
      }

      await supabase
        .from("appointments")
        .update({ reminder_sent: true })
        .eq("id", ag.id);

      resultados.push({ id: ag.id, status: "lembrete enviado" });
    }

    return new Response(JSON.stringify({ processados: resultados.length, resultados }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erro ao enviar lembretes:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
