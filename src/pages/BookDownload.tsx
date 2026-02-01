import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, ArrowLeft, AlertCircle, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BookDownload = () => {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["download", token],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-book-download", {
        body: { token },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });

 const handleDownload = async () => {
  const { data, error } = await supabase.storage
    .from("books")
    .createSignedUrl("my-book.pdf", 120); // expires in 60s

  if (error) {
    console.error(error);
    return;
  }

  window.location.href = data.signedUrl;
};


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              Verifying your purchase
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm text-center">
            <div className="animate-pulse text-muted-foreground">
              Verifying your purchase…
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state — minimal, Airbnb-ish card
  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <Header />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>

          <div className="max-w-xl mx-auto rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  Download link not found
                </h1>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  This link is invalid or expired. Please check your email for the latest
                  download link, or contact support.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link to="/">
                    <Button variant="outline" className="rounded-xl h-11">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Return home
                    </Button>
                  </Link>

                  <a
                    href="mailto:support@depthsofzambia.com"
                    className="inline-flex items-center justify-center h-11 px-4 rounded-xl border border-border bg-card hover:bg-muted/50 text-sm font-medium transition-colors"
                  >
                    Email support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Success state — split layout like the new payment page
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            Purchase verified
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: main message + download */}
          <section className="lg:col-span-7">
            <div className="">
              <div className="flex flex-col items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary mt-0.5" />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    You’re all set
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Your payment was successful. Download your book below.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  size="lg"
                  onClick={handleDownload}
                  className="w-full h-12 rounded-xl text-base font-medium"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF
                </Button>

                <div className="mt-4 text-xs text-muted-foreground">
                  Having trouble?{" "}
                  <a
                    href="mailto:support@depthsofzambia.com"
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    support@depthsofzambia.com
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Download count</span>
                <span className="font-medium text-foreground">
                  {data.purchase?.download_count || 0}
                </span>
              </div>
            </div>
          </section>

          {/* Right: sticky book summary (Airbnb-ish) */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
              <div className="flex gap-4">
                <div className="h-24 w-20 rounded-xl overflow-hidden bg-muted shrink-0">
                  <img
                    src={data.book?.cover_image || "/placeholder.svg"}
                    alt={data.book?.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Book</p>
                  <h2 className="font-semibold leading-snug truncate">
                    {data.book?.title}
                  </h2>
                  {data.book?.subtitle && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {data.book.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="my-6 h-px bg-border" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount paid</span>
                  <span className="font-semibold">
                    K{Number(data.purchase?.amount || 0).toFixed(2)}
                  </span>
                </div>

                <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed">
                  Keep your link safe. If it expires, email support and we’ll help you out.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BookDownload;
