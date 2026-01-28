import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DownloadRequest {
  token: string;
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

    const body: DownloadRequest = await req.json();
    const { token } = body;

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing download token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get purchase by download token
    const { data: purchase, error: purchaseError } = await supabase
      .from("book_purchases")
      .select("*, books(*)")
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

    // Update download count
    await supabase
      .from("book_purchases")
      .update({ download_count: (purchase.download_count || 0) + 1 })
      .eq("id", purchase.id);

    // Get the book
    const book = purchase.books;

    // Generate signed URL for the book file if it exists in storage
    let downloadUrl = null;
    if (book?.file_path) {
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("book-files")
        .createSignedUrl(book.file_path, 3600); // 1 hour expiry

      if (!signedUrlError && signedUrlData) {
        downloadUrl = signedUrlData.signedUrl;
      }
    }

    // If no file in storage, provide a placeholder message
    if (!downloadUrl) {
      // For demo, we'll return a placeholder URL
      // In production, you'd ensure all books have uploaded files
      downloadUrl = `https://example.com/books/${book?.slug || 'sample'}.pdf`;
    }

    console.log(`Download requested for purchase ${purchase.id}, book: ${book?.title}`);

    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl,
        book: {
          id: book?.id,
          title: book?.title,
          subtitle: book?.subtitle,
          cover_image: book?.cover_image,
        },
        purchase: {
          id: purchase.id,
          amount: purchase.amount,
          download_count: (purchase.download_count || 0) + 1,
          created_at: purchase.created_at,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Download error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
