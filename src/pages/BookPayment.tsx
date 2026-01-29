import { useEffect, useMemo, useState } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Mail, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    LencoPay: {
      getPaid: (options: {
        key: string;
        reference: string;
        email: string;
        amount: number;
        currency: string;
        channels: string[];
        label?: string;
        customer?: {
          firstName?: string;
          lastName?: string;
          phone?: string;
        };
        onSuccess: (response: { reference: string }) => void;
        onClose: () => void;
        onConfirmationPending: () => void;
      }) => void;
    };
  }
}

const paymentSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  amount: z.number().min(1, "Amount must be at least K1"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const BookPayment = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: book, isLoading, error } = useQuery({
    queryKey: ["book", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: lencoConfig } = useQuery({
    queryKey: ["lenco-public-key"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-lenco-public-key");
      if (error) throw error;
      return data;
    },
  });

  const minPrice = useMemo(() => {
    const p = Number(book?.price ?? 0);
    return Number.isFinite(p) && p > 0 ? p : 10;
  }, [book?.price]);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      email: "",
      amount: minPrice,
    },
  });

  useEffect(() => {
    if (!book) return;
    const current = form.getValues("amount");
    if (!current || current === 10) form.setValue("amount", minPrice);
  }, [book, minPrice, form]);

  const initiatePayment = async (data: PaymentFormData) => {
    if (!book || !lencoConfig?.publicKey) {
      toast.error("Payment service not available");
      return;
    }

    if (data.amount < minPrice) {
      toast.error(`Minimum amount is K${minPrice.toFixed(2)}`);
      return;
    }

    setIsProcessing(true);
    const reference = `BOOK-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    try {
      // Step 1: Create pending record in database FIRST
      const { error: initError } = await supabase.functions.invoke("initiate-payment", {
        body: {
          type: "book",
          reference,
          email: data.email,
          amount: data.amount,
          bookId: book.id,
        },
      });

      if (initError) {
        console.error("Failed to initiate payment:", initError);
        toast.error("Failed to start payment. Please try again.");
        setIsProcessing(false);
        return;
      }

      console.log("Payment record created, opening widget:", reference);

      // Step 2: Open Lenco widget
      window.LencoPay.getPaid({
        key: lencoConfig.publicKey,
        reference,
        email: data.email,
        amount: data.amount,
        currency: "ZMW",
        channels: ["mobile-money"],
        label: book.title,
        onSuccess: () => {
          console.log("Widget success callback - navigating to status page");
          setIsProcessing(false);
          toast.success("Payment initiated! Verifying...");
          navigate(`/payment-status/${reference}`, { replace: true });
        },
        onClose: () => {
          console.log("Widget closed");
          setIsProcessing(false);
          // Still navigate to status page - user may have completed payment on phone
          toast.info("Checking payment status...");
          navigate(`/payment-status/${reference}`);
        },
        onConfirmationPending: () => {
          console.log("Confirmation pending - navigating to status page");
          setIsProcessing(false);
          toast.info("Complete the payment on your phone");
          navigate(`/payment-status/${reference}`);
        },
      });
    } catch (err) {
      console.error("Payment initiation error:", err);
      toast.error("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  const onSubmit = (data: PaymentFormData) => {
    initiatePayment(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="animate-pulse text-muted-foreground">Loading…</div>
        </div>
      </div>
    );
  }

  if (error || !book) return <Navigate to="/404" replace />;

  return (
    <div className="bg-background animate-fade-in">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            to={`/book/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            Secure mobile money checkout
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-7">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Confirm and pay
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Complete your purchase in under a minute.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="you@example.com"
                            className="pl-10 h-12 rounded-xl"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Amount (ZMW)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={minPrice}
                          step="0.01"
                          className="h-12 rounded-xl"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Minimum K{minPrice.toFixed(2)}. Optional: pay more to support the author.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 rounded-xl text-base font-medium"
                  disabled={isProcessing || !lencoConfig?.publicKey}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>Pay K{(form.watch("amount") || 0).toFixed(2)}</>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground flex items-start gap-2 pt-1">
                  <ShieldCheck className="w-4 h-4 mt-0.5" />
                  <p>
                    You'll receive the download link immediately after payment.
                  </p>
                </div>
              </form>
            </Form>

            <p className="mt-4 text-[11px] text-muted-foreground">
              By purchasing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </section>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-muted shrink-0">
                  {book.cover_image ? (
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
                  <p className="text-xs text-muted-foreground">Book</p>
                  <h2 className="font-semibold leading-snug truncate">
                    {book.title}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Minimum price: K{minPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="my-6 h-px bg-border" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">You pay</span>
                  <span className="font-semibold">
                    K{(form.watch("amount") || 0).toFixed(2)}
                  </span>
                </div>

                <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed">
                  Tip: if you pay above the minimum, you directly support more content like this.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BookPayment;
