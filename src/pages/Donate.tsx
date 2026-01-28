import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
import { ArrowLeft, Phone, Mail, Loader2, ShieldCheck, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const donationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^[0-9+]+$/, "Please enter a valid phone number"),
  amount: z.number().min(1, "Amount must be at least K1"),
});

type DonationFormData = z.infer<typeof donationSchema>;

const presetAmounts = [10, 20, 50, 100, 500];

const Donate = () => {
  const [searchParams] = useSearchParams();
  const initialAmount = Number(searchParams.get("amount")) || 50;
  
  const [selectedMethod, setSelectedMethod] = useState<"mtn" | "airtel">("mtn");
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      email: "",
      phone: "",
      amount: initialAmount,
    },
  });

  const currentAmount = form.watch("amount");

  const onSubmit = async (data: DonationFormData) => {
    setIsProcessing(true);

    try {
      // Simulate donation processing (would integrate with real payment API)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.success("Thank you for your donation! Your support means everything.");
      form.reset({ email: "", phone: "", amount: 50 });
    } catch (err) {
      console.error("Donation error:", err);
      toast.error("Donation failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-background animate-fade-in">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            Secure mobile money donation
          </div>
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: form */}
          <section className="lg:col-span-7">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Support Our Work
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your donation helps us continue creating independent content about Zambia.
              </p>
            </div>

            {/* Preset amounts */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Select amount</p>
              <div className="grid grid-cols-5 gap-2">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => form.setValue("amount", amount)}
                    className={[
                      "px-3 py-3 text-sm font-medium rounded-xl border transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      currentAmount === amount
                        ? "bg-foreground text-background border-foreground"
                        : "bg-card hover:bg-muted/50 text-foreground border-border",
                    ].join(" ")}
                  >
                    K{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Payment method</p>
              <div className="grid grid-cols-2 rounded-xl border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("mtn")}
                  className={[
                    "px-4 py-3 text-sm font-medium transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selectedMethod === "mtn"
                      ? "bg-foreground text-background"
                      : "bg-card hover:bg-muted/50 text-foreground",
                  ].join(" ")}
                  aria-pressed={selectedMethod === "mtn"}
                >
                  MTN MoMo
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("airtel")}
                  className={[
                    "px-4 py-3 text-sm font-medium transition-colors border-l border-border",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selectedMethod === "airtel"
                      ? "bg-foreground text-background"
                      : "bg-card hover:bg-muted/50 text-foreground",
                  ].join(" ")}
                  aria-pressed={selectedMethod === "airtel"}
                >
                  Airtel Money
                </button>
              </div>
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        {selectedMethod === "mtn" ? "MTN" : "Airtel"} number
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="0977123456"
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
                      <FormLabel className="text-sm">Custom Amount (ZMW)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          step="1"
                          className="h-12 rounded-xl"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 rounded-xl text-base font-medium"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      Donate K{(currentAmount || 0).toFixed(0)}
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground flex items-start gap-2 pt-1">
                  <ShieldCheck className="w-4 h-4 mt-0.5" />
                  <p>
                    Your donation is secure and supports independent Zambian media.
                  </p>
                </div>
              </form>
            </Form>

            <p className="mt-4 text-[11px] text-muted-foreground">
              By donating, you agree to our Terms of Service and Privacy Policy.
            </p>
          </section>

          {/* Right: sticky summary */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Supporting</p>
                  <h2 className="font-semibold">Depths of Zambia</h2>
                </div>
              </div>

              <div className="my-6 h-px bg-border" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment method</span>
                  <span className="font-medium">
                    {selectedMethod === "mtn" ? "MTN MoMo" : "Airtel Money"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Your donation</span>
                  <span className="font-semibold text-lg">
                    K{(currentAmount || 0).toFixed(0)}
                  </span>
                </div>

                <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed">
                  Your contribution helps fund independent research, video production, 
                  and educational content about Zambia. Thank you for your support!
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Donate;
