import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionRequest {
  plan_type: "basic" | "premium" | "enterprise";
  phone_number: string;
  email: string;
}

const SUBSCRIPTION_PLANS = {
  basic: { amount: 2000, name: "Basic Plan", duration: "monthly" },
  premium: { amount: 5000, name: "Premium Plan", duration: "monthly" },
  enterprise: { amount: 10000, name: "Enterprise Plan", duration: "monthly" },
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-DOCTOR-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const instasendKey = Deno.env.get("INSTASEND_SECRET_KEY");
    if (!instasendKey) throw new Error("INSTASEND_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Verify user is a doctor
    const { data: userRole, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !userRole || userRole.role !== "doctor") {
      throw new Error("Access denied: Only doctors can subscribe to plans");
    }

    const { plan_type, phone_number, email }: SubscriptionRequest = await req.json();
    logStep("Subscription request received", { plan_type, phone_number });

    const plan = SUBSCRIPTION_PLANS[plan_type];
    if (!plan) {
      throw new Error("Invalid subscription plan");
    }

    // Create Instasend subscription payment
    const instasendPayload = {
      amount: plan.amount,
      phone_number: phone_number,
      email: email,
      narrative: `Doctor subscription - ${plan.name}`,
      currency: "KES",
    };

    logStep("Creating Instasend subscription payment", instasendPayload);

    const instasendResponse = await fetch("https://payment.intasend.com/api/v1/payment/mpesa-stk-push/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${instasendKey}`,
      },
      body: JSON.stringify(instasendPayload),
    });

    const paymentData = await instasendResponse.json();
    logStep("Instasend response", paymentData);

    if (!instasendResponse.ok) {
      throw new Error(`Instasend API error: ${paymentData.message || 'Unknown error'}`);
    }

    // Store subscription information (you may want to create a subscriptions table)
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); // Add 1 month

    // For now, we'll store this in the profiles table or create a subscriptions table
    // This is a simplified implementation
    logStep("Subscription payment initiated successfully", { 
      tracking_id: paymentData.tracking_id,
      plan: plan.name,
      amount: plan.amount
    });

    return new Response(JSON.stringify({
      success: true,
      tracking_id: paymentData.tracking_id,
      checkout_id: paymentData.id,
      plan: plan.name,
      amount: plan.amount,
      message: "Subscription payment initiated successfully",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-doctor-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});