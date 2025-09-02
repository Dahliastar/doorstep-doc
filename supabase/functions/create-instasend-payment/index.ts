import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  appointment_id: string;
  amount: number;
  phone_number: string;
  email: string;
  currency?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-INSTASEND-PAYMENT] ${step}${detailsStr}`);
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

    const { appointment_id, amount, phone_number, email, currency = "KES" }: PaymentRequest = await req.json();
    logStep("Payment request received", { appointment_id, amount, phone_number, currency });

    // Verify appointment belongs to user
    const { data: appointment, error: appointmentError } = await supabaseClient
      .from("appointments")
      .select("*")
      .eq("id", appointment_id)
      .eq("patient_id", user.id)
      .single();

    if (appointmentError || !appointment) {
      throw new Error("Appointment not found or access denied");
    }

    // Create Instasend payment request
    const instasendPayload = {
      amount: amount,
      phone_number: phone_number,
      email: email,
      narrative: `Payment for medical appointment ${appointment_id}`,
      currency: currency,
    };

    logStep("Creating Instasend payment", instasendPayload);

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

    // Update appointment with payment information
    const { error: updateError } = await supabaseClient
      .from("appointments")
      .update({
        payment_status: "pending",
        amount: amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointment_id);

    if (updateError) {
      logStep("Error updating appointment", updateError);
      throw new Error("Failed to update appointment with payment info");
    }

    logStep("Payment initiated successfully", { tracking_id: paymentData.tracking_id });

    return new Response(JSON.stringify({
      success: true,
      tracking_id: paymentData.tracking_id,
      checkout_id: paymentData.id,
      message: "Payment initiated successfully",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-instasend-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});