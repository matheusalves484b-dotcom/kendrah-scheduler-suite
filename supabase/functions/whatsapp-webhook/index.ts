const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") ?? "";

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  // --- GET: verificação do webhook pela Meta ---
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    console.log("Token recebido:", token, "| Token esperado:", VERIFY_TOKEN, "| Iguais?", token === VERIFY_TOKEN);

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return new Response(challenge ?? "", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    return new Response("Forbidden", { status: 403 });
  }

  // --- POST: eventos reais (status de entrega, mensagens recebidas) ---
  if (req.method === "POST") {
    try {
      const body = await req.json();
      console.log("Webhook recebido:", JSON.stringify(body, null, 2));

      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.statuses) {
        const status = value.statuses[0];
        console.log(`Status da mensagem ${status.id}: ${status.status}`);
        // TODO: atualizar status no banco de dados (Supabase)
      }

      if (value?.messages) {
        const message = value.messages[0];
        console.log(`Mensagem recebida de ${message.from}: ${JSON.stringify(message)}`);
        // TODO: salvar/processar mensagem recebida
      }

      return new Response("OK", { status: 200 });
    } catch (err) {
      console.error("Erro ao processar webhook:", err);
      return new Response("Bad Request", { status: 400 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
});
