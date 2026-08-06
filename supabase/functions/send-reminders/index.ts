import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN")!;
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")!;

// Janela de antecedência do lembrete (em horas).
const REMINDER_WINDOW_HOURS = 24;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface AppointmentRow {
  id: string;
  customer_name: string;
  customer_phone: string;
  start_time: string;
  service_name: string;
  user_id: string;
  profiles: { business_name: string } | null;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function sendWhatsAppMessage(toPhone: string, message: string) {
  const to = toPhone.replace(/\D/g, "");

  const response = await fetch(
    `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Falha ao enviar WhatsApp para ${to}: ${JSON.stringify(data)}`);
  }

  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000);

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(
        `
        id,
        customer_name,
        customer_phone,
        start_time,
        service_name,
        user_id,
        profiles ( business_name )
      `,
      )
      .eq("reminder_sent", false)
      .eq("status", "confirmed")
      .gte("start_time", now.toISOString())
      .lte("start_time", windowEnd.toISOString());

    if (error) throw error;

    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const appt of (appointments ?? []) as unknown as AppointmentRow[]) {
      if (!appt.customer_phone) {
        results.push({ id: appt.id, ok: false, error: "sem telefone" });
        continue;
      }

      const businessName = appt.profiles?.business_name ?? "seu prestador";
      const when = formatDateTime(appt.start_time);

      const message =
        `Olá, ${appt.customer_name}! ` +
        `Passando para lembrar do seu horário em ${businessName} ` +
        `para ${appt.service_name} no dia ${when}. Até lá!`;

      try {
        await sendWhatsAppMessage(appt.customer_phone, message);

        const { error: updateError } = await supabase
          .from("appointments")
          .update({ reminder_sent: true })
          .eq("id", appt.id);

        if (updateError) throw updateError;

        results.push({ id: appt.id, ok: true });
      } catch (err) {
        console.error("Erro no lembrete", appt.id, err);
        results.push({
          id: appt.id,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Erro geral:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
