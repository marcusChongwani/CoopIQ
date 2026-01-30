import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import JsonLd, { createOrganizationSchema, createWebSiteSchema } from "@/components/JsonLd";
import ArticleCard from "@/components/ArticleCard";
import BookCard from "@/components/BookCard";
import IntroSection from "@/components/IntroSection";
import MissionSection from "@/components/MissionSection";
import DonationSection from "@/components/DonationSection";
import FeaturedVideosSkeleton from "@/components/FeaturedVideosSkeleton";
import FeaturedBooksSkeleton from "@/components/FeaturedBooksSkeleton";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
} as const;

const Index = () => {
  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: featuredVideos = [], isLoading: videosLoading } = useQuery({
    queryKey: ["featured-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : "/placeholder.svg";
  };

  // Limit to 4 items max
  const displayedVideos = featuredVideos.slice(0, 4);
  const displayedBooks = books.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead canonical="/" />
      <JsonLd data={[createOrganizationSchema(), createWebSiteSchema()]} />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Section */}
        <IntroSection />

        {/* Featured Videos Section */}
        {videosLoading ? (
          <FeaturedVideosSkeleton />
        ) : displayedVideos.length > 0 ? (
          <motion.section
            id="articles"
            className="py-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Featured Videos</h2>
              <Link
                to="/videos"
                className="text-sm border font-medium text-muted-foreground hover:text-accent transition-colors px-4 py-2 rounded-full hover:bg-muted/60"
              >
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ArticleCard
                    id={video.id}
                    title={video.title}
                    category={video.category}
                    date={new Date(video.created_at).toLocaleDateString()}
                    image={video.thumbnail || getYouTubeThumbnail(video.youtube_url)}
                    videoUrl={getYouTubeEmbedUrl(video.youtube_url)}
                    subtitle={video.subtitle || video.description || ""}
                    size="small"
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        ) : null}

        {/* Featured Books Section */}
        {booksLoading ? (
          <FeaturedBooksSkeleton />
        ) : displayedBooks.length > 0 ? (
          <motion.section
            id="books"
            className="py-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Featured Books</h2>
              <Link
                to="/books"
                className="text-sm border font-medium text-muted-foreground hover:text-accent transition-colors px-4 py-2 rounded-full hover:bg-muted/60"
              >
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayedBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <BookCard
                    slug={book.slug}
                    title={book.title}
                    subtitle={book.subtitle || ""}
                    price={`Starting at K${Number(book.price).toFixed(0)}+`}
                    image={book.cover_image || "/placeholder.svg"}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        ) : null}

        {/* Mission Section */}
        <MissionSection />

        {/* Donation Section */}
        <DonationSection />

        {/* Newsletter Section */}
        <motion.section
          className="my-20 rounded-[2.5rem] bg-card p-12 md:p-16 text-center"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Stay Updated.</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              On Zambia's economy, history and everyday realities.
            </p>
            <div className="flex flex-row sm:flex-row items-center justify-start sm:justify-center gap-3 sm:gap-4">
              <Link to="/videos" className="w-full sm:w-auto">
                <Button className="rounded-full w-full px-6 sm:px-8 py-6 text-base font-medium">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Videos
                </Button>
              </Link>
              <Link to="/books" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="rounded-full w-full px-6 sm:px-8 py-6 text-base font-medium"
                >
                  Explore Books
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
