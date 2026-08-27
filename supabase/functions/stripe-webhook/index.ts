import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: unknown) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } },
);

async function upsertSubscriber(params: {
  email: string;
  customerId: string | null;
  subscriptionId?: string | null;
  status?: string | null;
  subscribed: boolean;
  priceId?: string | null;
  productId?: string | null;
  subscriptionEnd?: string | null;
}) {
  // Try to link to an existing auth user by email
  let userId: string | null = null;
  const { data: profileUser } = await supabase.auth.admin.listUsers();
  userId = profileUser?.users?.find((u) => u.email?.toLowerCase() === params.email.toLowerCase())?.id ?? null;

  const { error } = await supabase.from("subscribers").upsert(
    {
      email: params.email,
      user_id: userId,
      stripe_customer_id: params.customerId,
      stripe_subscription_id: params.subscriptionId ?? null,
      status: params.status ?? null,
      subscribed: params.subscribed,
      price_id: params.priceId ?? null,
      product_id: params.productId ?? null,
      subscription_end: params.subscriptionEnd ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );
  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
  logStep("Subscriber updated", { email: params.email, subscribed: params.subscribed, userId });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    logStep("Missing configuration");
    return new Response("Server not configured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature ?? "", webhookSecret);
  } catch (err) {
    logStep("Signature verification failed", { message: err instanceof Error ? err.message : String(err) });
    return new Response("Invalid signature", { status: 400 });
  }

  logStep("Event received", { type: event.type, id: event.id });

  try {
    const getEmail = async (customerId: string | null, fallback?: string | null) => {
      if (fallback) return fallback;
      if (!customerId) return null;
      const customer = await stripe.customers.retrieve(customerId);
      if (typeof customer === "object" && !("deleted" in customer && customer.deleted)) {
        return (customer as Stripe.Customer).email ?? null;
      }
      return null;
    };

    const handleSubscription = async (subscription: Stripe.Subscription) => {
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      const email = await getEmail(customerId);
      if (!email) {
        logStep("No email for customer, skipping", { customerId });
        return;
      }
      const item = subscription.items.data[0];
      const active = ["active", "trialing", "past_due"].includes(subscription.status);
      const periodEnd = (item as unknown as { current_period_end?: number })?.current_period_end ??
        (subscription as unknown as { current_period_end?: number }).current_period_end ?? null;

      await upsertSubscriber({
        email,
        customerId,
        subscriptionId: subscription.id,
        status: subscription.status,
        subscribed: active && subscription.status !== "canceled",
        priceId: item?.price?.id ?? null,
        productId: typeof item?.price?.product === "string" ? item.price.product : item?.price?.product?.id ?? null,
        subscriptionEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      });
    };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) {
          logStep("Non-subscription checkout, ignored");
          break;
        }
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await handleSubscription(subscription);
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as unknown as { subscription?: string | { id: string } }).subscription;
        const id = typeof subscriptionId === "string" ? subscriptionId : subscriptionId?.id;
        if (!id) {
          logStep("Invoice without subscription, ignored");
          break;
        }
        const subscription = await stripe.subscriptions.retrieve(id);
        await handleSubscription(subscription);
        break;
      }
      case "customer.subscription.updated": {
        await handleSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        const email = await getEmail(customerId);
        if (email) {
          await upsertSubscriber({
            email,
            customerId,
            subscriptionId: subscription.id,
            status: "canceled",
            subscribed: false,
            priceId: subscription.items.data[0]?.price?.id ?? null,
            productId: typeof subscription.items.data[0]?.price?.product === "string"
              ? (subscription.items.data[0].price.product as string)
              : null,
            subscriptionEnd: new Date().toISOString(),
          });
        }
        break;
      }
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
