import { Link } from "react-router-dom";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import BookCard from "@/components/BookCard";
import HeroSection from "@/components/HeroSection";
import IntroSection from "@/components/IntroSection";
import MissionSection from "@/components/MissionSection";
import DonationSection from "@/components/DonationSection";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: books = [] } = useQuery({
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

  const { data: featuredVideos = [] } = useQuery({
    queryKey: ["featured-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(3);
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

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Intro Section */}
        <IntroSection />

        {/* Featured Articles Grid */}
        <section id="articles" className="py-6">
          <div className="flex items-center justify-between mb-6 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl  font-bold tracking-tight">Featured Videos</h2>
            <Link
              to="/videos"
              className="text-sm  border font-medium text-muted-foreground hover:text-accent transition-colors px-4 py-2 rounded-full hover:bg-muted/60"
            >
              View all 
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVideos.map((video, index) => (
              <div key={video.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
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
              </div>
            ))}
          </div>
        </section>

        {/* Featured Books Section */}
        <section id="books" className="py-12">
          <div className="flex items-center justify-between mb-6 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Featured Books</h2>
            <Link
              to="/books"
              className="text-sm border font-medium text-muted-foreground hover:text-accent transition-colors px-4 py-2 rounded-full hover:bg-muted/60"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {books.map((book, index) => (
              <div key={book.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                <BookCard
                  slug={book.slug}
                  title={book.title}
                  subtitle={book.subtitle || ""}
                  price={`Starting at K${Number(book.price).toFixed(0)}+`}
                  image={book.cover_image || "/placeholder.svg"}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Mission Section */}
        <MissionSection />

        {/* Donation Section */}
        <DonationSection />

        {/* Newsletter Section */}
        <section className="my-20 rounded-[2.5rem] bg-card p-12 md:p-16 text-center animate-scale-in">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Stay Updated.</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
            On Zambia's economy, history and everyday realities.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-start sm:justify-center gap-3 sm:gap-4 animate-slide-up stagger-2">
              <Link to="/videos" className="w-full">
              <Button className="rounded-full  w-full px-6 sm:px-8 py-6 text-base font-medium">
                <Play className="w-4 h-4 mr-2" />
                Watch Videos
              </Button>
              </Link>
              <Link to="/books" className="w-full">
              <Button
                variant="outline"
                className="rounded-full  w-full px-6 sm:px-8 py-6 text-base font-medium"
              >
                Explore Books
              </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Explore</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                
                <li>
                  <Link to="/contact" className="hover:text-accent transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/donate" className="hover:text-accent transition-colors">
                    Donate
                  </Link>
                </li>
                <li>
                  <Link to="/donate" className="hover:text-accent transition-colors">
                    Advertise with us
                  </Link>
                </li>
                <li>
                  <Link to="/donate" className="hover:text-accent transition-colors">
                    How we make money
                  </Link>
                </li>
               
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/about" className="hover:text-accent transition-colors">
                    Our Story
                  </Link>
                </li>
                
                <li>
                  <Link to="/contact" className="hover:text-accent transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
           
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/privacy" className="hover:text-accent transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-accent transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 Perspective. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
