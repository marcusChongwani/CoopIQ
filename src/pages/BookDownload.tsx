import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, ArrowLeft, AlertCircle, ShieldCheck, ExternalLink, X } from "lucide-react";

// Detect if user is in an in-app browser
const detectInAppBrowser = (): { isInApp: boolean; browserName: string } => {
  const ua = navigator.userAgent || navigator.vendor || "";
  
  // TikTok
  if (/TikTok|musical_ly/i.test(ua)) {
    return { isInApp: true, browserName: "TikTok" };
  }
  // Instagram
  if (/Instagram/i.test(ua)) {
    return { isInApp: true, browserName: "Instagram" };
  }
  // Facebook
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) {
    return { isInApp: true, browserName: "Facebook" };
  }
  // Twitter/X
  if (/Twitter/i.test(ua)) {
    return { isInApp: true, browserName: "Twitter" };
  }
  // Snapchat
  if (/Snapchat/i.test(ua)) {
    return { isInApp: true, browserName: "Snapchat" };
  }
  // LinkedIn
  if (/LinkedInApp/i.test(ua)) {
    return { isInApp: true, browserName: "LinkedIn" };
  }
  // WeChat
  if (/MicroMessenger/i.test(ua)) {
    return { isInApp: true, browserName: "WeChat" };
  }
  // Generic WebView detection
  if (/wv|WebView/i.test(ua)) {
    return { isInApp: true, browserName: "app" };
  }
  
  return { isInApp: false, browserName: "" };
};

const BookDownload = () => {
  const { token } = useParams<{ token: string }>();
  const [showInAppBanner, setShowInAppBanner] = useState(true);
  
  const inAppBrowser = useMemo(() => detectInAppBrowser(), []);

  // useQuery for verification only (JSON response)
  const { data, isLoading, error } = useQuery({
    queryKey: ["verify-download", token],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-book-download?token=${encodeURIComponent(token || "")}`,
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Verification failed");
      }

      return response.json();
    },
    enabled: !!token,
  });

  // Direct download via edge function URL - browser handles file download
  const handleDownload = () => {
    if (!token) return;

    const downloadUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-book?token=${encodeURIComponent(token)}`;

    // If in-app browser, open in new tab so user can at least view the PDF
    if (inAppBrowser.isInApp) {
      window.open(downloadUrl, "_blank");
      return;
    }

    // Normal browser: trigger download via anchor click
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // In-app browser banner component
  const InAppBrowserBanner = () => {
    if (!inAppBrowser.isInApp || !showInAppBanner) return null;
    
    return (
      <div className="bg-muted/50 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                You're using {inAppBrowser.browserName}'s built-in browser
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                To download: tap the <span className="font-semibold">⋯</span> or <span className="font-semibold">⋮</span> menu and select{" "}
                <span className="font-semibold">"Open in Safari"</span> or{" "}
                <span className="font-semibold">"Open in Chrome"</span>, then click download again.
              </p>
            </div>
            <button 
              onClick={() => setShowInAppBanner(false)}
              className="p-1 rounded-md hover:bg-muted transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <InAppBrowserBanner />
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
            <div className="animate-pulse text-muted-foreground">Verifying your purchase…</div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <Header />
        <InAppBrowserBanner />

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
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Download link not found</h1>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  This link is invalid or expired. Please check your email for the latest download link, or contact
                  support.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link to="/">
                    <Button variant="outline" className="rounded-xl h-11">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Return home
                    </Button>
                  </Link>

                  <a
                    href="mailto:depthsofzambia@gmail.com"
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

  // Success state
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <Header />
        <InAppBrowserBanner />

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
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">You're all set</h1>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Your payment was successful. Download your book below.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button size="lg" onClick={handleDownload} className="w-full h-12 rounded-xl text-base font-medium">
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF
                </Button>

                <div className="mt-4 text-xs text-muted-foreground">
                  Having trouble?{" "}
                  <a
                    href="https://wa.me/message/GR7WX3OGSIXEF1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    Chat with us on WhatsApp
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Download count</span>
                <span className="font-medium text-foreground">{data.purchase?.download_count || 0}</span>
              </div>
            </div>
          </section>

          {/* Right: sticky book summary */}
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
                  <h2 className="font-semibold leading-snug truncate">{data.book?.title}</h2>
                  {data.book?.subtitle && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{data.book.subtitle}</p>
                  )}
                </div>
              </div>

              <div className="my-6 h-px bg-border" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount paid</span>
                  <span className="font-semibold">K{Number(data.purchase?.amount || 0).toFixed(2)}</span>
                </div>

                <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed">
                  Keep your link safe. If it expires, email support and we'll help you out.
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
