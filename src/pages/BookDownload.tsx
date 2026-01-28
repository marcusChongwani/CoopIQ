import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BookDownload = () => {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["download", token],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "get-book-download",
        {
          body: { token },
        }
      );

      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });

  const handleDownload = async () => {
    if (!data?.downloadUrl) return;

    // Open download URL in new tab
    window.open(data.downloadUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="animate-pulse">Verifying your purchase...</div>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-card rounded-2xl p-8 text-center border border-border">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Download Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This download link is invalid or has expired. Please check your
              email for the correct link or contact support.
            </p>
            <Link to="/">
              <Button variant="outline" className="rounded-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-card rounded-2xl p-8 sm:p-12 text-center border border-border animate-slide-up">
          <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />

          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Thank You for Your Purchase!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your payment was successful. Click below to download your book.
          </p>

          {/* Book Info */}
          <div className="bg-muted/50 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <img
                src={data.book?.cover_image || "/placeholder.svg"}
                alt={data.book?.title}
                className="w-20 h-28 object-cover rounded"
              />
              <div className="text-left">
                <h2 className="font-bold text-lg">{data.book?.title}</h2>
                {data.book?.subtitle && (
                  <p className="text-sm text-muted-foreground">
                    {data.book.subtitle}
                  </p>
                )}
                <p className="text-sm text-primary mt-2">
                  Amount paid: K{Number(data.purchase?.amount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleDownload}
            className="w-full sm:w-auto rounded-full px-12 py-6 text-lg font-medium"
          >
            <Download className="w-5 h-5 mr-2" />
            Download PDF
          </Button>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Having trouble? Contact us at{" "}
              <a
                href="mailto:support@depthsofzambia.com"
                className="text-primary hover:underline"
              >
                support@depthsofzambia.com
              </a>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Download count: {data.purchase?.download_count || 0}
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse more books
          </Link>
        </div>
      </main>
    </div>
  );
};

export default BookDownload;
