import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import JsonLd, { createBreadcrumbSchema } from "@/components/JsonLd";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 6;

const BookCardSkeleton = () => {
  return (
    <div className="flex sm:flex-row gap-6 bg-background rounded-lg animate-pulse">
      <div className="flex-shrink-0 w-40">
        <div className="w-full aspect-[3/4] bg-muted rounded" />
      </div>
      <div className="flex flex-col justify-center gap-3 flex-1">
        <div className="h-7 w-4/5 bg-muted rounded-lg" />
        <div className="h-7 w-3/5 bg-muted rounded-lg" />
        <div className="h-4 w-2/3 bg-muted rounded" />
        <div className="h-11 w-36 bg-muted rounded-md mt-2" />
      </div>
    </div>
  );
};

const Books = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["books", page],
    queryFn: async () => {
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: books, error, count } = await supabase
        .from("books")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { books: books || [], total: count || 0 };
    },
  });

  const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Books"
        description="Explore our collection of books about Zambia's economy, history, and culture. Digital downloads available."
        canonical="/books"
      />
      <JsonLd
        data={createBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Books" },
        ])}
      />
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            All Books
          </h1>
          <p className="mt-2 text-muted-foreground">
            Explore our collection of books.
          </p>
        </div>

        {isLoading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 opacity-70">
              <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
              <div className="h-10 w-24 rounded-xl bg-muted animate-pulse" />
              <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
            </div>
          </>
        ) : data?.books.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No books available yet. Check back soon!
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {data?.books.map((book) => (
                <BookCard
                  key={book.id}
                  slug={book.slug}
                  title={book.title}
                  subtitle={book.subtitle || ""}
                  price={`K${Number(book.price).toFixed(0)}`}
                  image={book.cover_image || "/placeholder.svg"}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPage(i + 1)}
                      className="w-9 h-9 p-0 rounded-xl"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Books;
