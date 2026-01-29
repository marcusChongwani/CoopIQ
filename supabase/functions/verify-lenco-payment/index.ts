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

    const LENCO_API_KEY = Deno.env.get("LENCO_API_KEY");
    if (!LENCO_API_KEY) {
      console.error("LENCO_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { reference, type, bookId, email, phone, amount, donorName, donorMessage } = await req.json();

    if (!reference) {
      return new Response(
        JSON.stringify({ success: false, error: "Reference required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Verifying Lenco payment: ${reference}`);

    // Verify payment with Lenco API
    const verifyResponse = await fetch(
      `https://api.lenco.co/access/v2/collections/status/${reference}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${LENCO_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData = await verifyResponse.json();
    console.log("Lenco verification response:", JSON.stringify(verifyData));

    if (!verifyResponse.ok || !verifyData.status) {
      console.error("Lenco verification failed:", verifyData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: verifyData.message || "Payment verification failed" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paymentData = verifyData.data;
    const paymentStatus = paymentData.status === "successful" ? "completed" : "failed";
    const lencoReference = paymentData.lencoReference;

    if (type === "book" && bookId) {
      // Verify book exists
      const { data: book, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single();

      if (bookError || !book) {
        console.error("Book not found:", bookError);
        return new Response(
          JSON.stringify({ success: false, error: "Book not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate download token only if successful
      const downloadToken = paymentStatus === "completed" ? crypto.randomUUID() : null;

      // Create or update purchase record
      const { data: existingPurchase } = await supabase
        .from("book_purchases")
        .select("id")
        .eq("transaction_id", reference)
        .maybeSingle();

      if (existingPurchase) {
        // Update existing
        await supabase
          .from("book_purchases")
          .update({
            status: paymentStatus,
            is_verified: paymentStatus === "completed",
            download_token: downloadToken,
            lenco_reference: lencoReference,
          })
          .eq("id", existingPurchase.id);
      } else {
        // Create new
        await supabase
          .from("book_purchases")
          .insert({
            book_id: bookId,
            buyer_email: email,
            buyer_phone: phone || "",
            payment_method: paymentData.type || "mobile-money",
            amount: parseFloat(paymentData.amount),
            transaction_id: reference,
            lenco_reference: lencoReference,
            status: paymentStatus,
            download_token: downloadToken,
            is_verified: paymentStatus === "completed",
          });
      }

      console.log(`Book purchase verified: ${reference}, status: ${paymentStatus}`);

      return new Response(
        JSON.stringify({
          success: paymentStatus === "completed",
          status: paymentStatus,
          downloadToken,
          message: paymentStatus === "completed" 
            ? "Payment verified successfully" 
            : "Payment was not successful",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (type === "donation") {
      // Handle donation verification
      const { data: existingDonation } = await supabase
        .from("donations")
        .select("id")
        .eq("transaction_id", reference)
        .maybeSingle();

      if (existingDonation) {
        await supabase
          .from("donations")
          .update({
            status: paymentStatus,
            is_verified: paymentStatus === "completed",
            lenco_reference: lencoReference,
          })
          .eq("id", existingDonation.id);
      } else {
        await supabase
          .from("donations")
          .insert({
            donor_name: donorName || null,
            donor_email: email,
            donor_phone: phone || "",
            donor_message: donorMessage || null,
            payment_method: paymentData.type || "mobile-money",
            amount: parseFloat(paymentData.amount),
            transaction_id: reference,
            lenco_reference: lencoReference,
            status: paymentStatus,
            is_verified: paymentStatus === "completed",
          });
      }

      console.log(`Donation verified: ${reference}, status: ${paymentStatus}`);

      return new Response(
        JSON.stringify({
          success: paymentStatus === "completed",
          status: paymentStatus,
          message: paymentStatus === "completed" 
            ? "Donation verified successfully" 
            : "Payment was not successful",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid payment type" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
