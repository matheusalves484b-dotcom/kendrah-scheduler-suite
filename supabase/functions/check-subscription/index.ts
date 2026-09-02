import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-device-id",
};
const logStep = (step: string, details?: unknown) => console.log(`[CHECK-SUBSCRIPTION] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // A assinatura pertence ao proprietário da conta compartilhada.
    const { data: membership } = await supabaseClient
      .from("team_members")
      .select("owner_id")
      .eq("member_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    const workspaceOwnerId = membership?.owner_id ?? user.id;
    const { data: ownerUser, error: ownerError } = await supabaseClient.auth.admin.getUserById(workspaceOwnerId);
    if (ownerError) throw ownerError;
    const billingEmail = ownerUser.user?.email ?? user.email;

    const { data: profile, error: profileError } = await supabaseClient.from("profiles").select("is_ambassador").eq("id", workspaceOwnerId).maybeSingle();
    if (profileError) throw profileError;

    const isAmbassador = profile?.is_ambassador === true;
    const trialEnd = new Date(new Date(ownerUser.user?.created_at ?? user.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    const livemode = stripeKey.startsWith("sk_live_");

    if (isAmbassador) {
      return new Response(JSON.stringify({ subscribed: true, is_ambassador: true, access_allowed: true, access_reason: "ambassador", product_id: "ambassador", subscription_end: null, cancel_at_period_end: false, trial_end: trialEnd, livemode }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: billingEmail, limit: 1 });

    if (customers.data.length === 0) {
      const trialActive = Date.now() < new Date(trialEnd).getTime();
      return new Response(JSON.stringify({ subscribed: false, is_ambassador: false, access_allowed: trialActive, access_reason: trialActive ? "trial" : "expired", product_id: null, subscription_end: null, trial_end: trialEnd, livemode }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    const subscriptions = await stripe.subscriptions.list({ customer: customers.data[0].id, status: "active", limit: 1 });
    const hasActiveSub = subscriptions.data.length > 0;
    let productId: string | null = null;
    let subscriptionEnd: string | null = null;
    let cancelAtPeriodEnd = false;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      const periodEnd = subscription.items.data[0]?.current_period_end ?? (subscription as unknown as { current_period_end: number }).current_period_end;
      subscriptionEnd = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
      cancelAtPeriodEnd = subscription.cancel_at_period_end;
      productId = String(subscription.items.data[0].price.product);
    }

    const trialActive = Date.now() < new Date(trialEnd).getTime();
    const accessAllowed = hasActiveSub || trialActive;
    logStep("Access check", { userId: user.id, workspaceOwnerId, accessAllowed, trialActive, hasActiveSub });

    return new Response(JSON.stringify({ subscribed: hasActiveSub, is_ambassador: false, access_allowed: accessAllowed, access_reason: hasActiveSub ? "subscription" : trialActive ? "trial" : "expired", product_id: productId, subscription_end: subscriptionEnd, cancel_at_period_end: cancelAtPeriodEnd, trial_end: trialEnd, livemode }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});
