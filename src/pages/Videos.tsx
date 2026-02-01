import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import JsonLd, { createBreadcrumbSchema } from "@/components/JsonLd";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ITEMS_PER_PAGE = 6;

const VideoCardSkeleton = ({ size = "small" }: { size?: "small" | "large" }) => {
  return (
    <div
      className={["group block overflow-hidden animate-pulse", size === "large" ? "col-span-1 md:col-span-2" : ""].join(
        " ",
      )}
    >
      <div
        className={[
          "relative bg-muted rounded-md overflow-hidden",
          size === "large" ? "aspect-[16/8]" : "aspect-[16/9]",
        ].join(" ")}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-black/15">
          <div className="h-14 w-14 rounded-full bg-white/70" />
        </div>
      </div>
      <div className="py-4 space-y-3">
        <div className="h-6 w-5/6 bg-muted rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-11/12 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
};

const Videos = () => {
  const [page, setPage] = useState(1);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("videos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);

  const paginatedVideos = videos.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : "/placeholder.svg";
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Videos"
        description="Watch our collection of research-driven explainer videos about Zambia's economy, history, and culture."
        canonical="/videos"
      />
      <JsonLd data={createBreadcrumbSchema([{ name: "Home", url: "/" }, { name: "Videos" }])} />
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">All Videos</h1>
          <p className="mt-2 text-muted-foreground">Watch our collections of documentaries and explainers. </p>
        </div>

        {isLoading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 opacity-70">
              <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
              <div className="h-10 w-24 rounded-xl bg-muted animate-pulse" />
              <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
            </div>
          </>
        ) : paginatedVideos.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No videos available yet. Check back soon!</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {paginatedVideos.map((video) => (
                <ArticleCard
                  key={video.id}
                  id={video.id}
                  title={video.title}
                  category={video.category}
                  date={new Date(video.created_at).toLocaleDateString()}
                  image={video.thumbnail || getYouTubeThumbnail(video.youtube_url)}
                  videoUrl={getYouTubeEmbedUrl(video.youtube_url)}
                  subtitle={video.subtitle || video.description || ""}
                  size="small"
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

export default Videos;
