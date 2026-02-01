import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function safeFilename(name: string) {
  return (name || "book")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Validate token + purchase status, get book file_path
    const { data: purchase, error: purchaseErr } = await supabase
      .from("book_purchases")
      .select("id, status, download_token, amount, download_count, books(title, file_path)")
      .eq("download_token", token)
      .maybeSingle();

    if (purchaseErr) throw purchaseErr;

    if (!purchase) {
      return new Response(JSON.stringify({ error: "Invalid or expired link" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (purchase.status !== "completed") {
      return new Response(JSON.stringify({ error: "Payment not completed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle both single object and array from join
    const booksData = purchase.books as unknown;
    const book = Array.isArray(booksData) ? booksData[0] : booksData as { title: string; file_path: string } | null;

    if (!book?.file_path) {
      return new Response(JSON.stringify({ error: "File path missing on book" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download from Storage - bucket is "book-files"
    const BUCKET = "book-files";

    console.log(`Downloading file: ${book.file_path} from bucket: ${BUCKET}`);

    const { data: fileBlob, error: dlErr } = await supabase.storage
      .from(BUCKET)
      .download(book.file_path);

    if (dlErr) {
      console.error("Storage download error:", dlErr);
      throw dlErr;
    }

    if (!fileBlob) throw new Error("No file returned");

    const buf = await fileBlob.arrayBuffer();
    const filename = `${safeFilename(book.title)}.pdf`;

    // Increment download count server-side
    await supabase
      .from("book_purchases")
      .update({ download_count: (purchase.download_count || 0) + 1 })
      .eq("id", purchase.id);

    console.log(`Serving file ${filename} for purchase ${purchase.id}`);

    // Force download with Content-Disposition: attachment
    return new Response(buf, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
