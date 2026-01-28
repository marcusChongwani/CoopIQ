import { useState } from "react";
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
import { ArrowLeft, Phone, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const paymentSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^[0-9+]+$/, "Please enter a valid phone number"),
  amount: z.number().min(1, "Amount must be at least K1"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const BookPayment = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<"mtn" | "airtel">("mtn");
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

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      email: "",
      phone: "",
      amount: book?.price ? Number(book.price) : 10,
    },
  });

  // Update amount when book loads
  if (book && form.getValues("amount") === 10 && Number(book.price) !== 10) {
    form.setValue("amount", Number(book.price));
  }

  const onSubmit = async (data: PaymentFormData) => {
    if (!book) return;

    if (data.amount < Number(book.price)) {
      toast.error(`Minimum amount is K${Number(book.price).toFixed(2)}`);
      return;
    }

    setIsProcessing(true);

    try {
      const { data: result, error } = await supabase.functions.invoke(
        "process-book-payment",
        {
          body: {
            bookId: book.id,
            email: data.email,
            phone: data.phone,
            amount: data.amount,
            paymentMethod: selectedMethod,
          },
        }
      );

      if (error) throw error;

      if (result.success && result.downloadToken) {
        toast.success("Payment successful! Redirecting to download...");
        navigate(`/download/${result.downloadToken}`);
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            to={`/book/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to book
          </Link>
        </div>

        {/* Payment Form */}
        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-sm border border-border animate-slide-up">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-muted-foreground mb-8">
            {book.title} - K{Number(book.price).toFixed(2)} minimum
          </p>

          {/* Payment Method Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedMethod("mtn")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === "mtn"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">📱</div>
                  <div className="font-semibold">MTN MoMo</div>
                  <div className="text-xs text-muted-foreground">
                    Mobile Money
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("airtel")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === "airtel"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">📱</div>
                  <div className="font-semibold">Airtel Money</div>
                  <div className="text-xs text-muted-foreground">
                    Mobile Money
                  </div>
                </div>
              </button>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="your@email.com"
                          className="pl-10"
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedMethod === "mtn" ? "MTN" : "Airtel"} Phone Number
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="0977123456"
                          className="pl-10"
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
                    <FormLabel>Amount (ZMW)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={Number(book.price)}
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum K{Number(book.price).toFixed(2)} - pay more to
                      support the author!
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full rounded-full py-6 text-lg font-medium"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay K{form.watch("amount")?.toFixed(2) || "0.00"}</>
                )}
              </Button>
            </form>
          </Form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            By purchasing, you agree to our Terms of Service and Privacy Policy.
            You'll receive a download link immediately after payment.
          </p>
        </div>
      </main>
    </div>
  );
};

export default BookPayment;
