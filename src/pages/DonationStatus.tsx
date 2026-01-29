import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  Heart,
  Home
} from "lucide-react";

type DonationStatusType = "pending" | "completed" | "failed";

type DonationMeta =
  | {
      type: "donation";
      email: string;
      amount: number;
      donorName?: string;
      donorMessage?: string;
    }
  | null;

const DonationStatus = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [pollCount, setPollCount] = useState(0);
  const verifyAttemptedRef = useRef(false);

  const donationMeta: DonationMeta = useMemo(() => {
    if (!transactionId) return null;
    try {
      const raw = sessionStorage.getItem(`payment_meta_${transactionId}`);
      return raw ? (JSON.parse(raw) as DonationMeta) : null;
    } catch {
      return null;
    }
  }, [transactionId]);

  // Poll for donation status every 5 seconds
  const { data: donation, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["donation-status", transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("transaction_id", transactionId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!transactionId,
    refetchInterval: (query) => {
      // Stop polling if completed or failed, or after 60 polls (5 minutes)
      const status = query.state.data?.status as DonationStatusType;
      if (status === "completed" || status === "failed" || pollCount >= 60) {
        return false;
      }
      return 5000; // Poll every 5 seconds
    },
  });

  useEffect(() => {
    // Count every poll tick (even if the row doesn't exist yet) so we can time out gracefully.
    if (!transactionId) return;
    if (!dataUpdatedAt) return;
    setPollCount((prev) => prev + 1);
  }, [dataUpdatedAt, transactionId]);

  useEffect(() => {
    if (!transactionId) return;
    if (verifyAttemptedRef.current) return;
    if (!donationMeta || donationMeta.type !== "donation") return;
    if (!donationMeta.email) return;
    if (donation?.status === "completed" || donation?.status === "failed") return;

    verifyAttemptedRef.current = true;

    supabase.functions
      .invoke("verify-lenco-payment", {
        body: {
          reference: transactionId,
          type: "donation",
          email: donationMeta.email,
          amount: donationMeta.amount,
          donorName: donationMeta.donorName,
          donorMessage: donationMeta.donorMessage,
        },
      })
      .then(({ error }) => {
        if (error) throw error;
        void refetch();
      })
      .catch((err) => {
        console.error("Donation status-page verification error:", err);
      });
  }, [transactionId, donationMeta, donation?.status, refetch]);

  useEffect(() => {
    if (!transactionId) return;
    if (donation?.status === "completed" || donation?.status === "failed") {
      try {
        sessionStorage.removeItem(`payment_meta_${transactionId}`);
      } catch {
        // ignore
      }
    }
  }, [donation?.status, transactionId]);

  const status = (donation?.status || "pending") as DonationStatusType;
  const timedOut = pollCount >= 60;

  const statusConfig = {
    pending: {
      icon: Smartphone,
      title: "Complete payment on your phone",
      description: "Check your phone for the payment prompt. Enter your PIN to confirm the donation.",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    completed: {
      icon: CheckCircle2,
      title: "Thank you for your donation!",
      description: "Your generosity helps us continue creating independent content about Zambia.",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    failed: {
      icon: XCircle,
      title: "Donation failed",
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

  if (!donation && timedOut) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <h1 className="text-xl font-semibold mb-2">Donation not found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find this donation. It may have expired or the link is incorrect.
          </p>
          <Button asChild>
            <Link to="/donate">Make a Donation</Link>
          </Button>
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

          {/* Donation Info */}
          {donation && (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card mb-8">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Donation to</p>
                <p className="font-medium">Depths of Zambia</p>
                <p className="text-sm text-muted-foreground">
                  K{Number(donation.amount).toFixed(2)} via{" "}
                  {String(donation.payment_method || "")
                    .toLowerCase()
                    .includes("mtn")
                    ? "MTN MoMo"
                    : String(donation.payment_method || "")
                        .toLowerCase()
                        .includes("airtel")
                      ? "Airtel Money"
                      : "Mobile Money"}
                </p>
              </div>
            </div>
          )}

          {/* Donor info if provided */}
          {donation?.donor_name && status === "completed" && (
            <div className="rounded-xl bg-muted/50 p-4 mb-8 text-left">
              <p className="text-sm font-medium mb-1">Thank you, {donation.donor_name}!</p>
              {donation.donor_message && (
                <p className="text-sm text-muted-foreground italic">
                  "{donation.donor_message}"
                </p>
              )}
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
            <div className="space-y-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/">
                  <Home className="w-5 h-5" />
                  Return Home
                </Link>
              </Button>
              <div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/donate">Make Another Donation</Link>
                </Button>
              </div>
            </div>
          )}

          {status === "failed" && (
            <Button asChild size="lg">
              <Link to="/donate">Try Again</Link>
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

export default DonationStatus;
