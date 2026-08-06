import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN") ?? "";
const PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";
const GRAPH_VERSION = "v20.0";

type SendTemplatePayload = {
  to: string;
  templateName: string;
  headerParams?: string[];
  bodyParams?: string[];
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as SendTemplatePayload;

    if (!payload.to || !payload.templateName) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: to, templateName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const components: Record<string, unknown>[] = [];

    if (payload.headerParams?.length) {
      components.push({
        type: "header",
        parameters: payload.headerParams.map((text) => ({ type: "text", text })),
      });
    }

    if (payload.bodyParams?.length) {
      components.push({
        type: "body",
        parameters: payload.bodyParams.map((text) => ({ type: "text", text })),
      });
    }

    const whatsappPayload = {
      messaging_product: "whatsapp",
      to: payload.to,
      type: "template",
      template: {
        name: payload.templateName,
        language: { code: "pt_BR" },
        components,
      },
    };

    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(whatsappPayload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Erro ao enviar mensagem WhatsApp:", JSON.stringify(result));
      return new Response(JSON.stringify({ success: false, error: result }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Mensagem enviada com sucesso:", JSON.stringify(result));
    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erro ao processar envio:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
