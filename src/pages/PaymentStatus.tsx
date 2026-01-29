import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, Smartphone, RefreshCw } from "lucide-react";

type PaymentStatusType = "pending" | "completed" | "failed";

const PaymentStatus = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const [pollCount, setPollCount] = useState(0);
  const verifyAttemptedRef = useRef(false);

  // Poll for purchase status every 3 seconds
  const { data: purchase, isLoading, refetch, dataUpdatedAt } = useQuery({
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

  const status = (purchase?.status || "pending") as PaymentStatusType;
  const book = purchase?.books as { title: string; slug: string } | null;
  const timedOut = pollCount >= 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading payment status...</p>
        </div>
      </div>
    );
  }

  // Record should exist (created before widget opened)
  // If not found after timeout, show error
  if (!purchase && timedOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-lg font-medium mb-2">Payment not found</p>
          <p className="text-sm text-muted-foreground mb-6">
            This payment link may be invalid or expired.
          </p>
          <Button asChild>
            <Link to="/books">Browse Books</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Still waiting for record to appear (shouldn't happen with new flow, but handle gracefully)
  if (!purchase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Setting up your payment</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Please wait while we prepare your transaction...
          </p>
          <p className="text-xs text-muted-foreground">
            ID: {transactionId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        {status === "pending" && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6 relative">
              <Smartphone className="w-8 h-8 text-amber-500" />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
              </span>
            </div>
            <h1 className="text-xl font-semibold mb-2">Complete payment on your phone</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Check your phone for the payment prompt. Enter your PIN to confirm.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for confirmation…
            </div>
            <Button
              variant="outline"
              onClick={() => {
                verifyAttemptedRef.current = false;
                void refetch();
              }}
              className="w-full gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Check Status
            </Button>
          </>
        )}

        {status === "completed" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Payment successful!</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Redirecting to your download…
            </p>
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Payment failed</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Something went wrong. Please try again.
            </p>
            {book && (
              <Button asChild className="w-full">
                <Link to={`/book/${book.slug}/payment`}>Try again</Link>
              </Button>
            )}
          </>
        )}

        {/* Purchase info */}
        {purchase && (
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-3 text-left">
              {purchase.books?.cover_image && (
                <img 
                  src={purchase.books.cover_image} 
                  alt="" 
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{purchase.books?.title}</p>
                <p className="text-xs text-muted-foreground">K{Number(purchase.amount).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          ID: {transactionId}
        </p>
      </div>
    </div>
  );
};

export default PaymentStatus;
