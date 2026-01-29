import { useEffect, useState } from "react";
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

const DonationStatus = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [pollCount, setPollCount] = useState(0);

  // Poll for donation status every 5 seconds
  const { data: donation, isLoading, refetch } = useQuery({
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
    if (donation?.status === "pending") {
      setPollCount((prev) => prev + 1);
    }
  }, [donation?.status]);

  const status = (donation?.status || "pending") as DonationStatusType;

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

  if (!donation) {
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
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Donation to</p>
              <p className="font-medium">Depths of Zambia</p>
              <p className="text-sm text-muted-foreground">
                K{Number(donation.amount).toFixed(2)} via{" "}
                {donation.payment_method === "mtn" ? "MTN MoMo" : "Airtel Money"}
              </p>
            </div>
          </div>

          {/* Donor info if provided */}
          {donation.donor_name && status === "completed" && (
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
