import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, Smartphone, ArrowLeft, RefreshCw, BookOpen, X } from "lucide-react";

type PaymentStatusType = "pending" | "completed" | "failed" | "cancelled";

const PaymentStatus = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pollCount, setPollCount] = useState(0);
  const verifyAttemptedRef = useRef(false);
  const widgetClosed = searchParams.get("closed") === "true";
  const [showCancelled, setShowCancelled] = useState(widgetClosed);

  // Poll for purchase status every 3 seconds
  const {
    data: purchase,
    isLoading,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["payment-status", transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_purchases")
        .select("*, books(*)")
        .eq("transaction_id", transactionId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!transactionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status as PaymentStatusType;
      // Stop polling if completed/failed or after 100 polls (~5 minutes)
      if (status === "completed" || status === "failed" || pollCount >= 100) {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
  });

  // Track poll count
  useEffect(() => {
    if (!transactionId || !dataUpdatedAt) return;
    setPollCount((p) => p + 1);
  }, [dataUpdatedAt, transactionId]);

  // Trigger verification once when status page loads and record exists
  useEffect(() => {
    if (!transactionId) return;
    if (verifyAttemptedRef.current) return;
    if (!purchase) return; // Wait for record to exist
    if (purchase.status === "completed" || purchase.status === "failed") return;

    verifyAttemptedRef.current = true;

    console.log("Triggering verification for:", transactionId);
    supabase.functions
      .invoke("verify-lenco-payment", {
        body: {
          reference: transactionId,
          type: "book",
          bookId: purchase.book_id,
          email: purchase.buyer_email,
          amount: purchase.amount,
        },
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("Verification error:", error);
          return;
        }
        console.log("Verification result:", data);
        void refetch();
      })
      .catch((err) => {
        console.error("Verification error:", err);
      });
  }, [transactionId, purchase, refetch]);

  // Auto-redirect to download page when completed
  useEffect(() => {
    if (purchase?.status === "completed" && purchase?.download_token) {
      navigate(`/download/${purchase.download_token}`, { replace: true });
    }
  }, [purchase?.status, purchase?.download_token, navigate]);

  // Determine effective status - show cancelled if widget was closed and payment is still pending
  const dbStatus = (purchase?.status || "pending") as PaymentStatusType;
  const status: PaymentStatusType = showCancelled && dbStatus === "pending" ? "cancelled" : dbStatus;
  const book = purchase?.books as { title: string; slug: string; cover_image?: string } | null;
  const timedOut = pollCount >= 100;

  // If payment completes while showing cancelled, update to show completed
  useEffect(() => {
    if (dbStatus === "completed" || dbStatus === "failed") {
      setShowCancelled(false);
    }
  }, [dbStatus]);

  const statusConfig = {
    pending: {
      icon: Smartphone,
      title: "Complete payment on your phone",
      description: "Check your phone for the payment prompt. Enter your PIN to confirm the purchase.",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    completed: {
      icon: CheckCircle2,
      title: "Payment successful!",
      description: "Redirecting to your download...",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    failed: {
      icon: XCircle,
      title: "Payment failed",
      description: "Something went wrong. Please try again.",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    cancelled: {
      icon: X,
      title: "Payment cancelled",
      description: "You closed the payment window. You can still complete the payment on your phone, or try again.",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Please Wait Loading payment status...</p>
        </div>
      </div>
    );
  }

  // Record should exist (created before widget opened)
  if (!purchase && timedOut) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Payment not found</h1>
          <p className="text-muted-foreground mb-6">This payment link may be invalid or expired.</p>
          <Button asChild>
            <Link to="/books">Browse Books</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Still waiting for record
  if (!purchase) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Setting up your payment</h1>
          <p className="text-sm text-muted-foreground mb-6">Please wait while we prepare your transaction...</p>
          <p className="text-xs text-muted-foreground">ID: {transactionId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center">
          {/* Status Icon */}
          <div className={`inline-flex p-6 rounded-full ${config.bgColor} mb-6`}>
            {status === "pending" ? (
              <div className="relative">
                <StatusIcon className={`w-16 h-16 ${config.color}`} />
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500"></span>
                </span>
              </div>
            ) : (
              <StatusIcon className={`w-16 h-16 ${config.color}`} />
            )}
          </div>

          {/* Status Text */}
          <h1 className="text-2xl font-semibold mb-2">{config.title}</h1>
          <p className="text-muted-foreground mb-8">{config.description}</p>

          {/* Purchase Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {book?.cover_image ? (
                <img src={book.cover_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Purchasing</p>
              <p className="font-medium">{book?.title || "Book"}</p>
              <p className="text-sm text-muted-foreground">
                K{Number(purchase.amount).toFixed(2)} via{" "}
                {String(purchase.payment_method || "")
                  .toLowerCase()
                  .includes("mtn")
                  ? "MTN MoMo"
                  : String(purchase.payment_method || "")
                        .toLowerCase()
                        .includes("airtel")
                    ? "Airtel Money"
                    : "Mobile Money"}
              </p>
            </div>
          </div>

          {/* Actions */}
          {status === "pending" && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Waiting for payment confirmation...
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  verifyAttemptedRef.current = false;
                  void refetch();
                }}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Check Status
              </Button>
            </div>
          )}

          {status === "cancelled" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you started the payment on your phone, it may still complete.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelled(false);
                    verifyAttemptedRef.current = false;
                    void refetch();
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Check Status
                </Button>
                {book && (
                  <Button asChild>
                    <Link to={`/book/${book.slug}/payment`}>Try Again</Link>
                  </Button>
                )}
              </div>
            </div>
          )}

          {status === "completed" && (
            <div className="space-y-3">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Preparing your download...</p>
            </div>
          )}

          {status === "failed" && book && (
            <Button asChild size="lg">
              <Link to={`/book/${book.slug}/payment`}>Try Again</Link>
            </Button>
          )}

          {/* Transaction Info */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">Transaction ID: {transactionId}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentStatus;
