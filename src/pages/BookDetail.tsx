import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import JsonLd, { createBookSchema, createBreadcrumbSchema } from "@/components/JsonLd";
import ExpandableDescription from "@/components/ExpandableDescription";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SkeletonBlock = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-xl bg-muted ${className}`} />
);

const BookDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            <SkeletonBlock className="h-4 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Cover */}
          <div className="flex justify-center lg:justify-start">
            <SkeletonBlock className="w-full max-w-sm aspect-square rounded-2xl" />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <SkeletonBlock className="h-10 w-4/5 rounded-2xl" />
              <SkeletonBlock className="h-10 w-3/5 mt-3 rounded-2xl" />

              <div className="mt-5 space-y-3">
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-11/12" />
                <SkeletonBlock className="h-4 w-10/12" />
                <SkeletonBlock className="h-4 w-8/12" />
              </div>
            </div>

            <div className="py-4 border-y border-border">
              <SkeletonBlock className="h-8 w-32 rounded-2xl" />
              <SkeletonBlock className="h-4 w-72 mt-2" />
            </div>

            {/* Desktop button placeholder */}
            <div className="hidden lg:block">
              <SkeletonBlock className="h-12 w-56 rounded-full" />
            </div>
          </div>
        </div>

        {/* Mobile floating button placeholder */}
        <div className="block lg:hidden">
          <div className="fixed bottom-0 left-0 w-full z-40 px-4 py-4">
            <SkeletonBlock className="h-14 w-full rounded-full" />
          </div>
        </div>
      </main>
    </div>
  );
};

const BookDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const {
    data: book,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["book", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*").eq("slug", slug).maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) return <BookDetailSkeleton />;

  if (error || !book) return <Navigate to="/404" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={book.title}
        description={book.description || `Purchase ${book.title} from Depths of Zambia`}
        canonical={`/book/${slug}`}
        type="book"
        image={book.cover_image || undefined}
      />
      <JsonLd
        data={[
          createBookSchema({
            title: book.title,
            description: book.description || undefined,
            image: book.cover_image || undefined,
            price: book.price,
            slug: book.slug,
          }),
          createBreadcrumbSchema([{ name: "Home", url: "/" }, { name: "Books", url: "/books" }, { name: book.title }]),
        ]}
      />
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              className="w-full max-w-sm aspect-square  object-cover rounded-2xl"
            />
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">{book.title}</h1>

              {book.description && <ExpandableDescription text={book.description} collapsedHeight={100} />}
            </div>

            <div className="py-4 border-y border-border">
              <p className="text-2xl font-bold text-primary">K{Number(book.price).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Pay what you want (minimum K{Number(book.price).toFixed(2)})
              </p>
            </div>

            {/* Floating Buy Button for mobile, static for larger screens */}
            <div className="pt-4 relative">
              {/* Floating on mobile screens */}
              <div className="block lg:hidden">
                <div className="fixed bottom-0 bg-white border border-t-2 border-gray-100 left-0 w-full z-40 px-4 py-4">
                  <Link to={`/book/${slug}/payment`}>
                    <Button size="lg" className="w-full rounded-full px-8 py-6 text-lg font-medium">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Buy Now - K{Number(book.price).toFixed(2)}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Desktop */}
              <div className="hidden lg:block">
                <Link to={`/book/${slug}/payment`}>
                  <Button size="lg" className="w-full sm:w-auto rounded-full px-8 py-6 text-lg font-medium">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Buy Now - K{Number(book.price).toFixed(2)}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookDetail;
