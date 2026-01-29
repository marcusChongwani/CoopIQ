import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Smartphone, 
  ArrowLeft,
  RefreshCw
} from "lucide-react";

type PaymentStatusType = "pending" | "completed" | "failed";

const PaymentStatus = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const [pollCount, setPollCount] = useState(0);

  // Poll for payment status every 5 seconds
  const { data: purchase, isLoading, refetch } = useQuery({
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
      // Stop polling if completed or failed, or after 60 polls (5 minutes)
      const status = query.state.data?.status as PaymentStatusType;
      if (status === "completed" || status === "failed" || pollCount >= 60) {
        return false;
      }
      return 5000; // Poll every 5 seconds
    },
  });

  useEffect(() => {
    if (purchase?.status === "pending") {
      setPollCount((prev) => prev + 1);
    }
  }, [purchase?.status]);

  // Redirect to download immediately if completed
  useEffect(() => {
    if (purchase?.status === "completed" && purchase?.download_token) {
      navigate(`/download/${purchase.download_token}`, { replace: true });
    }
  }, [purchase?.status, purchase?.download_token, navigate]);

  const status = (purchase?.status || "pending") as PaymentStatusType;

  const statusConfig = {
    pending: {
      icon: Smartphone,
      title: "Complete payment on your phone",
      description: "Check your phone for the payment prompt. Enter your PIN to confirm the payment.",
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
      description: "The payment could not be completed. Please try again.",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <h1 className="text-xl font-semibold mb-2">Payment not found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find this payment. It may have expired or the link is incorrect.
          </p>
          <Button asChild>
            <Link to="/books">Browse Books</Link>
          </Button>
        </div>
      </div>
    );
  }

  const book = purchase.books as { title: string; slug: string; cover_image: string } | null;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-12">
        <Link
          to="/books"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Books
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

          {/* Book Info */}
          {book && (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card mb-8">
              {book.cover_image && (
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="w-16 h-20 object-cover rounded-lg"
                />
              )}
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Purchasing</p>
                <p className="font-medium">{book.title}</p>
                <p className="text-sm text-muted-foreground">
                  K{Number(purchase.amount).toFixed(2)} via{" "}
                  {purchase.payment_method === "mtn" ? "MTN MoMo" : "Airtel Money"}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          {status === "pending" && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Waiting for payment confirmation...
              </div>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Check Status
              </Button>
            </div>
          )}

          {status === "completed" && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting to download...
            </div>
          )}

          {status === "failed" && book && (
            <Button asChild size="lg">
              <Link to={`/book/${book.slug}/payment`}>Try Again</Link>
            </Button>
          )}

          {/* Transaction Info */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Transaction ID: {transactionId}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentStatus;
