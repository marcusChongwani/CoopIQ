import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PaymentRequest {
  type: "donation" | "book";
  bookId?: string;
  email: string;
  phone: string;
  amount: number;
  paymentMethod: "mtn" | "airtel";
  donorName?: string;
  donorMessage?: string;
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

    const LENCO_API_KEY = Deno.env.get("LENCO_API_KEY");
    if (!LENCO_API_KEY) {
      console.error("LENCO_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: PaymentRequest = await req.json();
    const { type, bookId, email, phone, amount, paymentMethod, donorName, donorMessage } = body;

    // Validate required fields
    if (!type || !email || !phone || !amount || !paymentMethod) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === "book" && !bookId) {
      return new Response(
        JSON.stringify({ success: false, error: "Book ID required for book payments" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate payment method
    if (!["mtn", "airtel"].includes(paymentMethod)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid payment method" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique reference
    const reference = `${type.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Map payment method to Lenco operator (based on Lenco API docs)
    const operatorMap: Record<string, string> = {
      mtn: "mtn",
      airtel: "airtel",
    };

    // Format phone number (remove leading 0, add country code if needed)
    let formattedPhone = phone.replace(/^0+/, "");
    if (!formattedPhone.startsWith("260")) {
      formattedPhone = `260${formattedPhone}`;
    }

    console.log(`Initiating Lenco ${type} payment: ${reference}, amount: ${amount}, phone: ${formattedPhone}`);

    // Call Lenco API for mobile money collection
    const lencoResponse = await fetch("https://api.lenco.co/access/v2/collections/mobile-money", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LENCO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency: "ZMW",
        country: "ZM",
        phone: formattedPhone,
        operator: operatorMap[paymentMethod],
        reference: reference,
        narration: type === "donation" 
          ? `Donation to Depths of Zambia${donorName ? ` from ${donorName}` : ""}`
          : `Book purchase - Depths of Zambia`,
      }),
    });

    const lencoData = await lencoResponse.json();
    console.log("Lenco API response:", JSON.stringify(lencoData));

    if (!lencoResponse.ok || !lencoData.status) {
      console.error("Lenco API error:", lencoData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: lencoData.message || "Payment initiation failed" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lencoReference = lencoData.data?.lencoReference || lencoData.data?.id;
    const lencoStatus = lencoData.data?.status || "pending";
    
    // Map Lenco statuses to our internal statuses (pending, completed, failed)
    const statusMap: Record<string, string> = {
      "successful": "completed",
      "completed": "completed",
      "pending": "pending",
      "pay-offline": "pending", // User needs to complete payment on phone
      "processing": "pending",
      "failed": "failed",
      "cancelled": "failed",
      "expired": "failed",
    };
    const paymentStatus = statusMap[lencoStatus] || "pending";

    if (type === "donation") {
      // Create donation record
      const { error: donationError } = await supabase
        .from("donations")
        .insert({
          donor_name: donorName || null,
          donor_email: email,
          donor_phone: phone,
          donor_message: donorMessage || null,
          amount: amount,
          payment_method: paymentMethod,
          status: paymentStatus,
          transaction_id: reference,
          lenco_reference: lencoReference,
        });

      if (donationError) {
        console.error("Error creating donation:", donationError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to record donation" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Donation recorded: ${reference}`);

      return new Response(
        JSON.stringify({
          success: true,
          transactionId: reference,
          lencoReference,
          status: paymentStatus,
          message: paymentStatus === "pending" 
            ? "Please check your phone to complete the payment"
            : "Payment processed successfully",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Book payment
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

      // Validate amount
      if (amount < Number(book.price)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Minimum amount is K${Number(book.price).toFixed(2)}` 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const downloadToken = crypto.randomUUID();

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from("book_purchases")
        .insert({
          book_id: bookId,
          buyer_email: email,
          buyer_phone: phone,
          payment_method: paymentMethod,
          amount: amount,
          transaction_id: reference,
          lenco_reference: lencoReference,
          status: paymentStatus === "successful" ? "completed" : paymentStatus,
          download_token: paymentStatus === "successful" ? downloadToken : null,
        });

      if (purchaseError) {
        console.error("Error creating purchase:", purchaseError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to process payment" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Book purchase recorded: ${reference}`);

      return new Response(
        JSON.stringify({
          success: true,
          transactionId: reference,
          lencoReference,
          status: paymentStatus,
          downloadToken: paymentStatus === "successful" ? downloadToken : null,
          message: paymentStatus === "pending" 
            ? "Please check your phone to complete the payment"
            : "Payment processed successfully",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
