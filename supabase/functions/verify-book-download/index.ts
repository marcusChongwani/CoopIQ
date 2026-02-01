import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Get token from query string
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing download token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get purchase by download token - do NOT expose file_path
    const { data: purchase, error: purchaseError } = await supabase
      .from("book_purchases")
      .select(`
        id,
        amount,
        download_count,
        created_at,
        status,
        books (
          id,
          title,
          subtitle,
          cover_image,
          slug
        )
      `)
      .eq("download_token", token)
      .eq("status", "completed")
      .single();

    if (purchaseError || !purchase) {
      console.error("Purchase not found:", purchaseError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired download link" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle both single object and array from join
    const booksData = purchase.books as unknown;
    const book = Array.isArray(booksData) ? booksData[0] : booksData;

    console.log(`Verified download for purchase ${purchase.id}, book: ${book?.title}`);

    return new Response(
      JSON.stringify({
        success: true,
        book: {
          id: book?.id,
          title: book?.title,
          subtitle: book?.subtitle,
          cover_image: book?.cover_image,
          slug: book?.slug,
        },
        purchase: {
          id: purchase.id,
          amount: purchase.amount,
          download_count: purchase.download_count || 0,
          created_at: purchase.created_at,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Verify download error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
