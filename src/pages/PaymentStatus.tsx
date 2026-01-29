import { useEffect, useMemo, useState } from "react";
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
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

type PaymentStatusType = "pending" | "completed" | "failed";

const PaymentStatusSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          <div className="h-4 w-28 bg-muted rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-7">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm animate-pulse">
              <div className="h-14 w-14 rounded-full bg-muted mx-auto mb-6" />
              <div className="h-7 w-2/3 bg-muted rounded-lg mx-auto mb-3" />
              <div className="h-4 w-3/4 bg-muted rounded mx-auto mb-8" />
              <div className="h-11 w-full bg-muted rounded-xl" />
              <div className="h-11 w-full bg-muted rounded-xl mt-3" />
            </div>
          </section>

          <aside className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm animate-pulse">
              <div className="flex gap-4">
                <div className="h-24 w-20 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-5 w-4/5 bg-muted rounded" />
                  <div className="h-4 w-2/3 bg-muted rounded" />
                </div>
              </div>
              <div className="my-6 h-px bg-border" />
              <div className="space-y-2">
                <div className="h-4 w-1/2 bg-muted rounded" />
                <div className="h-4 w-2/3 bg-muted rounded" />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

const PaymentStatus = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const [pollCount, setPollCount] = useState(0);

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
      const status = query.state.data?.status as PaymentStatusType;
      if (status === "completed" || status === "failed" || pollCount >= 60) {
        return false;
      }
      return 5000;
    },
  });

  useEffect(() => {
    if (purchase?.status === "pending") setPollCount((p) => p + 1);
  }, [purchase?.status]);

  useEffect(() => {
    if (purchase?.status === "completed" && purchase?.download_token) {
      navigate(`/download/${purchase.download_token}`, { replace: true });
    }
  }, [purchase?.status, purchase?.download_token, navigate]);

  const status = (purchase?.status || "pending") as PaymentStatusType;

  const statusConfig = useMemo(
    () => ({
      pending: {
        icon: Smartphone,
        title: "Confirm the payment on your phone",
        description:
          "Stay on this page. We’ll automatically update once your payment is confirmed.",
        helper: [
          "Check your phone for the prompt (STK/MoMo request).",
          "Enter your PIN to approve.",
          "If your network drops, don’t leave — this page will update when it comes back.",
        ],
        badge: "Waiting for confirmation",
        color: "text-amber-500",
        ring: "ring-amber-500/20",
        bg: "bg-amber-500/10",
      },
      completed: {
        icon: CheckCircle2,
        title: "Payment successful",
        description: "Redirecting you to your download…",
        helper: ["If you’re not redirected, use “Check status” below."],
        badge: "Confirmed",
        color: "text-green-500",
        ring: "ring-green-500/20",
        bg: "bg-green-500/10",
      },
      failed: {
        icon: XCircle,
        title: "Payment not completed",
        description:
          "Your payment didn’t go through. You can try again from the payment page.",
        helper: ["If you were charged, contact support with the transaction ID below."],
        badge: "Not completed",
        color: "text-red-500",
        ring: "ring-red-500/20",
        bg: "bg-red-500/10",
      },
    }),
    []
  );

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  if (isLoading) return <PaymentStatusSkeleton />;

  if (!purchase) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <Header />
        <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link
              to="/books"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Books
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <h1 className="text-xl font-semibold tracking-tight mb-2">
              Payment not found
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              We couldn’t find this payment. The link may be incorrect or expired.
            </p>
            <Button asChild className="rounded-xl h-11">
              <Link to="/books">Browse Books</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const book = purchase.books as
    | { title: string; slug: string; cover_image: string }
    | null;

  const minutesElapsed = Math.floor((pollCount * 5) / 60);
  const secondsElapsed = pollCount * 5 - minutesElapsed * 60;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/books"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            Secure checkout
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: status */}
          <section className="lg:col-span-7">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              {/* Icon */}
              <div className="flex items-center gap-4">
                <div
                  className={[
                    "h-14 w-14 rounded-2xl grid place-items-center",
                    config.bg,
                    "ring-1",
                    config.ring,
                  ].join(" ")}
                >
                  {status === "pending" ? (
                    <div className="relative">
                      <StatusIcon className={`w-7 h-7 ${config.color}`} />
                      <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-70" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                      </span>
                    </div>
                  ) : (
                    <StatusIcon className={`w-7 h-7 ${config.color}`} />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{config.badge}</p>
                  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                    {config.title}
                  </h1>
                </div>
              </div>

              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {config.description}
              </p>

              {/* The important “stay on page” notice */}
              {status === "pending" && (
                <div className="mt-5 rounded-2xl bg-muted/40 border border-border p-4">
                  <p className="text-sm font-medium text-foreground">
                    Don’t close this page.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    Sometimes your network drops to Edge/low signal during payment. That’s
                    normal — this page will update automatically once the network returns
                    and the payment is confirmed.
                  </p>

                  <div className="mt-3 text-xs text-muted-foreground">
                    Time waiting:{" "}
                    <span className="font-medium text-foreground">
                      {String(minutesElapsed).padStart(2, "0")}:
                      {String(secondsElapsed).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              )}

              {/* Steps */}
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">What to do</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {config.helper.map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-8 space-y-3">
                {status === "pending" && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking for confirmation…
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => refetch()}
                      className="w-full h-11 rounded-xl gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Check status now
                    </Button>
                  </>
                )}

                {status === "completed" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting…
                  </div>
                )}

                {status === "failed" && book && (
                  <Button asChild size="lg" className="w-full h-11 rounded-xl">
                    <Link to={`/book/${book.slug}/payment`}>Try again</Link>
                  </Button>
                )}
              </div>

              {/* Transaction */}
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Transaction ID:{" "}
                  <span className="font-mono text-foreground">{transactionId}</span>
                </p>
              </div>
            </div>
          </section>

          {/* Right: summary */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
              <div className="flex gap-4">
                <div className="h-24 w-20 rounded-xl overflow-hidden bg-muted shrink-0">
                  {book?.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-xs text-muted-foreground">
                      No cover
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Purchasing</p>
                  <p className="font-semibold leading-snug truncate">
                    {book?.title || "Book"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {purchase.payment_method === "mtn" ? "MTN MoMo" : "Airtel Money"}
                  </p>
                </div>
              </div>

              <div className="my-6 h-px bg-border" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">
                    K{Number(purchase.amount).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{status}</span>
                </div>

                <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed">
                  Keep this page open until it says <span className="font-medium text-foreground">Payment successful</span>.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PaymentStatus;
