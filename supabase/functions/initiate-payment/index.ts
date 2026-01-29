import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { type, reference, email, phone, amount, bookId, donorName, donorMessage } = body;

    console.log(`Initiating payment: type=${type}, reference=${reference}, email=${email}, amount=${amount}`);

    if (!type || !reference || !email || !amount) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === "book") {
      if (!bookId) {
        return new Response(
          JSON.stringify({ success: false, error: "Book ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify book exists
      const { data: book, error: bookError } = await supabase
        .from("books")
        .select("id, title, price")
        .eq("id", bookId)
        .single();

      if (bookError || !book) {
        console.error("Book not found:", bookError);
        return new Response(
          JSON.stringify({ success: false, error: "Book not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if record already exists (idempotent)
      const { data: existing } = await supabase
        .from("book_purchases")
        .select("id")
        .eq("transaction_id", reference)
        .maybeSingle();

      if (existing) {
        console.log(`Book purchase record already exists for ${reference}`);
        return new Response(
          JSON.stringify({ success: true, reference, message: "Record already exists" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create pending purchase record
      // Note: payment_method defaults to "mtn" - will be updated by webhook with actual provider
      const { error: insertError } = await supabase.from("book_purchases").insert({
        book_id: bookId,
        buyer_email: email,
        buyer_phone: phone || "",
        payment_method: "mtn",
        amount: Number(amount),
        transaction_id: reference,
        status: "pending",
        is_verified: false,
      });

      if (insertError) {
        console.error("Failed to create book purchase:", insertError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to initiate payment" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Book purchase record created: ${reference}`);
      return new Response(
        JSON.stringify({ success: true, reference, message: "Payment initiated" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (type === "donation") {
      // Check if record already exists (idempotent)
      const { data: existing } = await supabase
        .from("donations")
        .select("id")
        .eq("transaction_id", reference)
        .maybeSingle();

      if (existing) {
        console.log(`Donation record already exists for ${reference}`);
        return new Response(
          JSON.stringify({ success: true, reference, message: "Record already exists" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create pending donation record
      const { error: insertError } = await supabase.from("donations").insert({
        donor_name: donorName || null,
        donor_email: email,
        donor_phone: phone || "",
        donor_message: donorMessage || null,
        payment_method: "mobile-money",
        amount: Number(amount),
        transaction_id: reference,
        status: "pending",
        is_verified: false,
      });

      if (insertError) {
        console.error("Failed to create donation:", insertError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to initiate donation" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Donation record created: ${reference}`);
      return new Response(
        JSON.stringify({ success: true, reference, message: "Donation initiated" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid payment type" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Initiate payment error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
