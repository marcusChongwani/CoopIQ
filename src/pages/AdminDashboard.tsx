import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Video, Star } from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">
        {value}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
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

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your content.
        </p>
      </div>

      {/* Stats */}
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
  );
}
