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

    const paymentData = verifyData.data ?? {};

    const rawStatus = String(paymentData.status ?? "").toLowerCase();
    let paymentStatus: "pending" | "completed" | "failed" = "pending";
    if (["successful", "success", "completed"].includes(rawStatus)) {
      paymentStatus = "completed";
    } else if (
      [
        "failed",
        "failure",
        "cancelled",
        "canceled",
        "reversed",
        "expired",
      ].includes(rawStatus)
    ) {
      paymentStatus = "failed";
    }

    const lencoReference = paymentData.lencoReference ?? null;

    if (type === "book") {
      // If the caller doesn't send metadata (e.g. status page retry), try to recover it.
      const { data: existingPurchase } = await supabase
        .from("book_purchases")
        .select("id,status,download_token,is_verified,book_id,buyer_email,buyer_phone,amount")
        .eq("transaction_id", reference)
        .maybeSingle();

      const resolvedBookId = bookId || existingPurchase?.book_id;
      const resolvedEmail = email || existingPurchase?.buyer_email;
      const resolvedPhone = phone || existingPurchase?.buyer_phone || "";

      if (!resolvedBookId || !resolvedEmail) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Missing book metadata for verification",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Verify book exists
      const { data: book, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("id", resolvedBookId)
        .single();

      if (bookError || !book) {
        console.error("Book not found:", bookError);
        return new Response(
          JSON.stringify({ success: false, error: "Book not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Don't downgrade an already-completed purchase (verification can be eventually consistent).
      const resolvedStatus =
        existingPurchase?.status === "completed" ? "completed" : paymentStatus;
      const resolvedDownloadToken =
        resolvedStatus === "completed"
          ? existingPurchase?.download_token ?? crypto.randomUUID()
          : existingPurchase?.download_token ?? null;
      const resolvedIsVerified =
        Boolean(existingPurchase?.is_verified) || resolvedStatus === "completed";

      // Create or update purchase record
      if (existingPurchase) {
        await supabase
          .from("book_purchases")
          .update({
            status: resolvedStatus,
            is_verified: resolvedIsVerified,
            download_token: resolvedDownloadToken,
            lenco_reference: lencoReference,
          })
          .eq("id", existingPurchase.id);
      } else {
        await supabase.from("book_purchases").insert({
          book_id: resolvedBookId,
          buyer_email: resolvedEmail,
          buyer_phone: resolvedPhone,
          payment_method: paymentData.type || "mobile-money",
          amount: Number(paymentData.amount ?? amount ?? 0),
          transaction_id: reference,
          lenco_reference: lencoReference,
          status: resolvedStatus,
          download_token: resolvedDownloadToken,
          is_verified: resolvedIsVerified,
        });
      }

      console.log(`Book purchase verified: ${reference}, status: ${paymentStatus}`);

      return new Response(
        JSON.stringify({
          success: resolvedStatus === "completed",
          status: resolvedStatus,
          downloadToken: resolvedStatus === "completed" ? resolvedDownloadToken : null,
          message:
            resolvedStatus === "completed"
              ? "Payment verified successfully"
              : resolvedStatus === "pending"
                ? "Payment is still pending"
                : "Payment was not successful",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (type === "donation") {
      // Handle donation verification
      const { data: existingDonation } = await supabase
        .from("donations")
        .select("id,status,is_verified,donor_email,donor_phone,amount")
        .eq("transaction_id", reference)
        .maybeSingle();

      const resolvedEmail = email || existingDonation?.donor_email;
      const resolvedPhone = phone || existingDonation?.donor_phone || "";

      if (!resolvedEmail) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Missing donor email for verification",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const resolvedStatus =
        existingDonation?.status === "completed" ? "completed" : paymentStatus;
      const resolvedIsVerified =
        Boolean(existingDonation?.is_verified) || resolvedStatus === "completed";

      if (existingDonation) {
        await supabase
          .from("donations")
          .update({
            status: resolvedStatus,
            is_verified: resolvedIsVerified,
            lenco_reference: lencoReference,
          })
          .eq("id", existingDonation.id);
      } else {
        await supabase
          .from("donations")
          .insert({
            donor_name: donorName || null,
            donor_email: resolvedEmail,
            donor_phone: resolvedPhone,
            donor_message: donorMessage || null,
            payment_method: paymentData.type || "mobile-money",
            amount: Number(paymentData.amount ?? amount ?? 0),
            transaction_id: reference,
            lenco_reference: lencoReference,
            status: resolvedStatus,
            is_verified: resolvedIsVerified,
          });
      }

      console.log(`Donation verified: ${reference}, status: ${resolvedStatus}`);

      return new Response(
        JSON.stringify({
          success: resolvedStatus === "completed",
          status: resolvedStatus,
          message:
            resolvedStatus === "completed"
              ? "Donation verified successfully"
              : resolvedStatus === "pending"
                ? "Donation is still pending"
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
