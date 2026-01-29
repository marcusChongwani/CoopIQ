import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import { Link2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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

  const { data: relatedVideos = [] } = useQuery({
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
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : "/placeholder.svg";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!video) {
    return <Navigate to="/404" replace />;
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      
      <main>
        {/* Back Navigation */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/videos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to videos
          </Link>
        </div>

        {/* Hero Video */}
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] mb-12">
          <iframe
            src={getYouTubeEmbedUrl(video.youtube_url)}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Article Header */}
          <div className="mb-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-muted-foreground">
                {new Date(video.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {video.title}
            </h1>

            {video.subtitle && (
              <p className="text-xl text-muted-foreground">{video.subtitle}</p>
            )}
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-16 animate-slide-up stagger-2">
            {video.description && (
              <p className="text-lg leading-relaxed text-muted-foreground mb-8">
                {video.description}
              </p>
            )}
          </div>

          {/* Share Buttons */}
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

        {/* Related Videos */}
        {relatedVideos.length > 0 && (
          <section className="py-16 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold mb-8 animate-slide-up">You might also like</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedVideos.map((relatedVideo, index) => (
                  <div key={relatedVideo.id} className={`animate-slide-up stagger-${Math.min(index + 1, 3)}`}>
                    <ArticleCard
                      id={relatedVideo.id}
                      title={relatedVideo.title}
                      category={relatedVideo.category}
                      date={new Date(relatedVideo.created_at).toLocaleDateString()}
                      image={relatedVideo.thumbnail || getYouTubeThumbnail(relatedVideo.youtube_url)}
                      videoUrl={getYouTubeEmbedUrl(relatedVideo.youtube_url)}
                      subtitle={relatedVideo.subtitle || relatedVideo.description || ""}
                      size="small"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Article;
