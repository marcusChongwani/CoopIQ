import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import JsonLd, { createVideoSchema, createBreadcrumbSchema } from "@/components/JsonLd";
import ArticleCard from "@/components/ArticleCard";
import ExpandableDescription from "@/components/ExpandableDescription";
import { Link2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const VideoCardSkeleton = () => {
  return (
    <div className="group block overflow-hidden animate-pulse">
      <div className="relative bg-muted rounded-md overflow-hidden aspect-[16/9]">
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

const ArticleSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            <div className="h-4 w-28 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] mb-12 bg-muted animate-pulse" />
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-6 animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
            <div className="space-y-3 mb-4">
              <div className="h-10 md:h-12 lg:h-14 w-5/6 bg-muted rounded-xl" />
              <div className="h-10 md:h-12 lg:h-14 w-3/5 bg-muted rounded-xl" />
            </div>
            <div className="h-6 w-2/3 bg-muted rounded" />
          </div>
          <div className="mb-16 animate-pulse space-y-3">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-11/12 bg-muted rounded" />
            <div className="h-4 w-10/12 bg-muted rounded" />
            <div className="h-4 w-8/12 bg-muted rounded" />
          </div>
          <div className="mb-12 pb-12 border-b border-border animate-pulse">
            <div className="h-4 w-32 bg-muted rounded mb-4" />
            <div className="h-11 w-full sm:w-56 bg-muted rounded-full" />
          </div>
        </article>
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-8 w-60 bg-muted rounded-xl animate-pulse mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const Article = () => {
  const { id } = useParams<{ id: string }>();

  const { data: video, isLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: relatedVideos = [], isLoading: relatedLoading } = useQuery({
    queryKey: ["related-videos", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .neq("id", id)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/
    );
    return match
      ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
      : "/placeholder.svg";
  };

  if (isLoading) return <ArticleSkeleton />;

  if (!video) return <Navigate to="/404" replace />;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={video.title}
        description={video.description || video.subtitle || `Watch ${video.title} on Depths of Zambia`}
        canonical={`/article/${id}`}
        type="video.other"
        image={video.thumbnail || getYouTubeThumbnail(video.youtube_url)}
        publishedTime={video.created_at}
        section={video.category}
      />
      <JsonLd
        data={[
          createVideoSchema({
            title: video.title,
            description: video.description || undefined,
            thumbnail: video.thumbnail || undefined,
            youtubeUrl: video.youtube_url,
            createdAt: video.created_at,
          }),
          createBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Videos", url: "/videos" },
            { name: video.title },
          ]),
        ]}
      />
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/videos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to videos
          </Link>
        </div>

        <div className="mb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative w-full aspect-video overflow-hidden rounded-xl">
              <iframe
                src={getYouTubeEmbedUrl(video.youtube_url)}
                title={video.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>



        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-muted-foreground">
                {new Date(video.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl lg:text-4xl font-bold mb-4 leading-tight">
              {video.title}
            </h1>

            {video.subtitle && (
              <p className="text-xl text-muted-foreground">{video.subtitle}</p>
            )}
          </div>

          <div className="prose prose-lg max-w-none mb-16 animate-slide-up stagger-2">
            {video.description && (
              <ExpandableDescription
                text={video.description}
                collapsedHeight={120}
                className="mb-8"
              />
            )}
          </div>

          <div className="mb-12 pb-12 border-b border-border">
            <p className="text-sm font-semibold mb-4">Share this video</p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-3 rounded-full border border-border hover:border-primary hover:bg-muted transition-all flex items-center justify-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                <span className="text-sm">Copy link</span>
              </button>
            </div>
          </div>
        </article>

        {(relatedLoading || relatedVideos.length > 0) && (
          <section className="py-16 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold mb-8 animate-slide-up">
                You might also like
              </h2>

              {relatedLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <VideoCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedVideos.map((relatedVideo, index) => (
                    <div
                      key={relatedVideo.id}
                      className={`animate-slide-up stagger-${Math.min(index + 1, 3)}`}
                    >
                      <ArticleCard
                        id={relatedVideo.id}
                        title={relatedVideo.title}
                        category={relatedVideo.category}
                        date={new Date(relatedVideo.created_at).toLocaleDateString()}
                        image={
                          relatedVideo.thumbnail ||
                          getYouTubeThumbnail(relatedVideo.youtube_url)
                        }
                        videoUrl={getYouTubeEmbedUrl(relatedVideo.youtube_url)}
                        subtitle={relatedVideo.subtitle || relatedVideo.description || ""}
                        size="small"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Article;
