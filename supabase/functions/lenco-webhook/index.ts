import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LencoWebhookPayload {
  event: string;
  data: {
    id: string;
    reference: string;
    lencoReference: string;
    status: string;
    amount: string;
    currency: string;
    type: string;
    completedAt?: string;
    reasonForFailure?: string;
    mobileMoneyDetails?: {
      phone: string;
      operator: string;
      operatorTransactionId?: string;
    };
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload: LencoWebhookPayload = await req.json();
    console.log("Lenco webhook received:", JSON.stringify(payload));

    const { event, data } = payload;
    
    if (!data?.reference || !data?.status) {
      console.error("Invalid webhook payload - missing reference or status");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map Lenco status to our internal status
    const statusMap: Record<string, string> = {
      "successful": "completed",
      "completed": "completed",
      "pending": "pending",
      "pay-offline": "pending",
      "processing": "pending",
      "failed": "failed",
      "cancelled": "failed",
      "expired": "failed",
    };
    const internalStatus = statusMap[data.status] || "pending";

    // Determine if this is a donation or book payment based on reference prefix
    const isDonation = data.reference.startsWith("DONATION-");
    const isBook = data.reference.startsWith("BOOK-");

    console.log(`Processing ${isDonation ? "donation" : "book"} webhook: ${data.reference}, status: ${data.status} -> ${internalStatus}`);

    if (isDonation) {
      // Update donation record
      const { error: updateError } = await supabase
        .from("donations")
        .update({
          status: internalStatus,
          lenco_reference: data.lencoReference,
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", data.reference);

      if (updateError) {
        console.error("Error updating donation:", updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to update donation" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Donation ${data.reference} updated to status: ${internalStatus}`);
    } else if (isBook) {
      // For completed book payments, generate download token if not exists
      let updateData: Record<string, unknown> = {
        status: internalStatus,
        lenco_reference: data.lencoReference,
        updated_at: new Date().toISOString(),
      };

      if (internalStatus === "completed") {
        // Check if download token already exists
        const { data: existingPurchase } = await supabase
          .from("book_purchases")
          .select("download_token")
          .eq("transaction_id", data.reference)
          .maybeSingle();

        if (!existingPurchase?.download_token) {
          updateData.download_token = crypto.randomUUID();
        }
      }

      const { error: updateError } = await supabase
        .from("book_purchases")
        .update(updateData)
        .eq("transaction_id", data.reference);

      if (updateError) {
        console.error("Error updating book purchase:", updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to update purchase" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Book purchase ${data.reference} updated to status: ${internalStatus}`);
    } else {
      console.warn(`Unknown reference format: ${data.reference}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
