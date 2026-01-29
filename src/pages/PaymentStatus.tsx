import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, Smartphone } from "lucide-react";

type PaymentStatusType = "pending" | "completed" | "failed";

type PaymentMeta =
  | {
      type: "book";
      bookId: string;
      email: string;
      amount: number;
    }
  | null;

const PaymentStatus = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const [pollCount, setPollCount] = useState(0);
  const verifyAttemptedRef = useRef(false);

  const paymentMeta: PaymentMeta = useMemo(() => {
    if (!transactionId) return null;
    try {
      const raw = sessionStorage.getItem(`payment_meta_${transactionId}`);
      return raw ? (JSON.parse(raw) as PaymentMeta) : null;
    } catch {
      return null;
    }
  }, [transactionId]);

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
      if (status === "completed" || status === "failed" || pollCount >= 60) {
        return false;
      }
      return 5000;
    },
  });

  useEffect(() => {
    // Count every poll tick (even if the row doesn't exist yet) so we can time out gracefully.
    if (!transactionId) return;
    if (!dataUpdatedAt) return;
    setPollCount((p) => p + 1);
  }, [dataUpdatedAt, transactionId]);

  useEffect(() => {
    if (!transactionId) return;
    if (verifyAttemptedRef.current) return;
    if (!paymentMeta || paymentMeta.type !== "book") return;
    if (purchase?.status === "completed" || purchase?.status === "failed") return;

    verifyAttemptedRef.current = true;

    supabase.functions
      .invoke("verify-lenco-payment", {
        body: {
          reference: transactionId,
          type: "book",
          bookId: paymentMeta.bookId,
          email: paymentMeta.email,
          amount: paymentMeta.amount,
        },
      })
      .then(({ data, error }) => {
        if (error) throw error;

        if (data?.status === "completed" && data?.downloadToken) {
          try {
            sessionStorage.removeItem(`payment_meta_${transactionId}`);
          } catch {
            // ignore
          }
          navigate(`/download/${data.downloadToken}`, { replace: true });
          return;
        }

        // Ensure we refresh the DB row after verification attempt.
        void refetch();
      })
      .catch((err) => {
        console.error("Status-page verification error:", err);
      });
  }, [transactionId, paymentMeta, purchase?.status, navigate, refetch]);

  useEffect(() => {
    if (purchase?.status === "completed" && purchase?.download_token) {
      try {
        if (transactionId) sessionStorage.removeItem(`payment_meta_${transactionId}`);
      } catch {
        // ignore
      }
      navigate(`/download/${purchase.download_token}`, { replace: true });
    }
  }, [purchase?.status, purchase?.download_token, navigate]);

  useEffect(() => {
    if (purchase?.status === "failed" && transactionId) {
      try {
        sessionStorage.removeItem(`payment_meta_${transactionId}`);
      } catch {
        // ignore
      }
    }
  }, [purchase?.status, transactionId]);

  const status = (purchase?.status || "pending") as PaymentStatusType;
  const book = purchase?.books as { title: string; slug: string } | null;
  const timedOut = pollCount >= 60;
  const isMissing = !purchase;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!purchase && timedOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-lg font-medium mb-2">Payment not found</p>
          <p className="text-sm text-muted-foreground mb-6">
            This link may be invalid or expired.
          </p>
          <Button asChild>
            <Link to="/books">Browse Books</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        {status === "pending" && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2">
              {isMissing ? "Finalizing your payment" : "Check your phone"}
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              {isMissing
                ? "We're confirming your payment. This can take a moment."
                : "Approve the payment on your phone to continue."}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for confirmation…
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="w-full"
            >
              Refresh
            </Button>
          </>
        )}

        {status === "completed" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Payment successful</h1>
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

        <p className="mt-8 text-xs text-muted-foreground">
          ID: {transactionId}
        </p>
      </div>
    </div>
  );
};

export default PaymentStatus;
