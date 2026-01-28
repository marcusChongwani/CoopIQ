import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const ITEMS_PER_PAGE = 6;

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
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            All Books
          </h1>
          <p className="mt-2 text-muted-foreground">
            Explore our collection of books about Zambia's economy, history, and culture.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-muted rounded-2xl h-48" />
            ))}
          </div>
        ) : data?.books.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No books available yet. Check back soon!
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {data?.books.map((book) => (
                <Link
                  key={book.id}
                  to={`/book/${book.slug}`}
                  className="group flex gap-4 p-4 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="h-32 w-24 rounded-xl overflow-hidden bg-muted shrink-0">
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

                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <h3 className="font-semibold text-lg leading-snug truncate group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      {book.subtitle && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {book.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-medium">
                        K{Number(book.price).toFixed(0)}
                      </span>
                      <span className="text-sm text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        View <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
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
                      className="w-8 h-8 p-0"
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
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Books;
