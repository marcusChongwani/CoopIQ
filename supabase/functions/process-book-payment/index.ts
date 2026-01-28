import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PaymentRequest {
  bookId: string;
  email: string;
  phone: string;
  amount: number;
  paymentMethod: "mtn" | "airtel";
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body: PaymentRequest = await req.json();
    const { bookId, email, phone, amount, paymentMethod } = body;

    // Validate required fields
    if (!bookId || !email || !phone || !amount || !paymentMethod) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
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

    // Get book details
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

    // Generate unique transaction ID and download token
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const downloadToken = crypto.randomUUID();

    // In a real implementation, you would:
    // 1. Call MTN MoMo or Airtel Money API to initiate payment
    // 2. Wait for callback/webhook confirmation
    // 3. Only then mark as completed
    
    // For demo purposes, we'll simulate a successful payment
    console.log(`Processing ${paymentMethod} payment for ${phone}, amount: K${amount}`);

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from("book_purchases")
      .insert({
        book_id: bookId,
        buyer_email: email,
        buyer_phone: phone,
        payment_method: paymentMethod,
        amount: amount,
        transaction_id: transactionId,
        status: "completed", // In production, this would be 'pending' until webhook confirms
        download_token: downloadToken,
      })
      .select()
      .single();

    if (purchaseError) {
      console.error("Error creating purchase:", purchaseError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to process payment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Payment successful! Transaction: ${transactionId}, Download token: ${downloadToken}`);

    return new Response(
      JSON.stringify({
        success: true,
        transactionId,
        downloadToken,
        message: "Payment processed successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Payment processing error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
