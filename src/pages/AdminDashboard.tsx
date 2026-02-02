import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Video, Star, Banknote, ShoppingCart, Receipt, TrendingUp } from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  prefix,
  subtitle,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  prefix?: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground truncate">{subtitle}</p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  // Content counts
  const { data: booksCount = 0 } = useQuery({
    queryKey: ["admin-books-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("books")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: videosCount = 0 } = useQuery({
    queryKey: ["admin-videos-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("videos")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: featuredBooksCount = 0 } = useQuery({
    queryKey: ["admin-featured-books-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("books")
        .select("*", { count: "exact", head: true })
        .eq("featured", true);
      return count || 0;
    },
  });

  const { data: featuredVideosCount = 0 } = useQuery({
    queryKey: ["admin-featured-videos-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("featured", true);
      return count || 0;
    },
  });

  // Financial metrics
  const { data: donationsTotal = 0 } = useQuery({
    queryKey: ["admin-donations-total"],
    queryFn: async () => {
      const { data } = await supabase
        .from("donations")
        .select("amount")
        .eq("is_verified", true);
      return data?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
    },
  });

  const { data: bookRevenueTotal = 0 } = useQuery({
    queryKey: ["admin-book-revenue-total"],
    queryFn: async () => {
      const { data } = await supabase
        .from("book_purchases")
        .select("amount")
        .eq("is_verified", true);
      return data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    },
  });

  const { data: transactionsCount = 0 } = useQuery({
    queryKey: ["admin-transactions-count"],
    queryFn: async () => {
      const [donations, purchases] = await Promise.all([
        supabase
          .from("donations")
          .select("*", { count: "exact", head: true })
          .eq("is_verified", true),
        supabase
          .from("book_purchases")
          .select("*", { count: "exact", head: true })
          .eq("is_verified", true),
      ]);
      return (donations.count || 0) + (purchases.count || 0);
    },
  });

  // Engagement metrics - most purchased book
  const { data: topBook } = useQuery({
    queryKey: ["admin-top-book"],
    queryFn: async () => {
      const { data: purchases } = await supabase
        .from("book_purchases")
        .select("book_id")
        .eq("is_verified", true);
      
      if (!purchases?.length) return null;
      
      // Count purchases per book
      const bookCounts = purchases.reduce((acc, p) => {
        acc[p.book_id] = (acc[p.book_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Find the book with most purchases
      const topBookId = Object.entries(bookCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      
      if (!topBookId) return null;
      
      const { data: book } = await supabase
        .from("books")
        .select("title")
        .eq("id", topBookId)
        .single();
      
      return book ? { title: book.title, count: bookCounts[topBookId] } : null;
    },
  });

  // Most recent featured video as "trending"
  const { data: trendingVideo } = useQuery({
    queryKey: ["admin-trending-video"],
    queryFn: async () => {
      const { data } = await supabase
        .from("videos")
        .select("title")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      return data;
    },
  });

  const totalRevenue = donationsTotal + bookRevenueTotal;

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your content and revenue.
        </p>
      </div>

      {/* Financial Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Revenue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Total revenue"
            value={totalRevenue}
            icon={Banknote}
            prefix="K"
          />
          <StatCard
            label="Book sales"
            value={bookRevenueTotal}
            icon={ShoppingCart}
            prefix="K"
          />
          <StatCard
            label="Donations"
            value={donationsTotal}
            icon={Banknote}
            prefix="K"
          />
          <StatCard
            label="Transactions"
            value={transactionsCount}
            icon={Receipt}
          />
        </div>
      </div>

      {/* Content Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Content</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Total books"
            value={booksCount}
            icon={BookOpen}
          />
          <StatCard
            label="Featured books"
            value={featuredBooksCount}
            icon={Star}
          />
          <StatCard
            label="Total videos"
            value={videosCount}
            icon={Video}
          />
          <StatCard
            label="Featured videos"
            value={featuredVideosCount}
            icon={Star}
          />
        </div>
      </div>

      {/* Engagement Stats */}
      <div>
        <h2 className="text-lg font-medium mb-4">Engagement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard
            label="Top selling book"
            value={topBook?.title || "No sales yet"}
            icon={TrendingUp}
            subtitle={topBook ? `${topBook.count} purchase${topBook.count > 1 ? 's' : ''}` : undefined}
          />
          <StatCard
            label="Featured video"
            value={trendingVideo?.title || "None set"}
            icon={Video}
            subtitle="Latest featured"
          />
        </div>
      </div>
    </div>
  );
}
