import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BookDetail = () => {
  const { slug } = useParams<{ slug: string }>();

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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>

        {/* Book Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-slide-up">
          {/* Book Cover */}
          <div className="flex justify-center lg:justify-start">
            <img
              src={book.cover_image || "/placeholder.svg"}
              alt={book.title}
              className="w-full max-w-sm rounded-lg shadow-lg"
            />
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="text-xl text-muted-foreground">{book.subtitle}</p>
              )}
            </div>

            <div className="py-4 border-y border-border">
              <p className="text-2xl font-bold text-primary">
                K{Number(book.price).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Pay what you want (minimum K{Number(book.price).toFixed(2)})
              </p>
            </div>

            {book.description && (
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}

            <div className="pt-4">
              <Link to={`/book/${slug}/payment`}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-8 py-6 text-lg font-medium"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Buy Now - K{Number(book.price).toFixed(2)}
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Instant PDF download after payment
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Pay via MTN or Airtel Mobile Money
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Lifetime access to updates
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookDetail;
