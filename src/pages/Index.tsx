import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import BookCard from "@/components/BookCard";
import HeroSection from "@/components/HeroSection";
import IntroSection from "@/components/IntroSection";
import { articles } from "@/data/articles";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const books = [
  {
    id: "smart-budgeting",
    title: "Smart Budgeting 50/30/20",
    subtitle: "A plan for every kwacha.",
    price: "Starting at K10+. Pay what you want.",
    image: "/placeholder.svg",
  },
  {
    id: "zambia-economics",
    title: "Understanding Zambia's Economy",
    subtitle: "A deep dive into economic realities.",
    price: "Starting at K15+. Pay what you want.",
    image: "/placeholder.svg",
  },
];

const Index = () => {
  const featuredArticles = articles.slice(0, 2);

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
            <a
              href="#all"
              className="text-sm  border font-medium text-muted-foreground hover:text-accent transition-colors px-4 py-2 rounded-full hover:bg-muted/60"
            >
              View all 
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.map((article, index) => (
              <div key={article.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                <ArticleCard {...article} size="small" />
              </div>
            ))}
          </div>
        </section>

        {/* Featured Books Section */}
        <section id="books" className="py-12">
          <div className="flex items-center justify-between mb-6 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Featured Books</h2>
            <a
              href="#all"
              className="text-sm border font-medium text-muted-foreground hover:text-accent transition-colors px-4 py-2 rounded-full hover:bg-muted/60"
            >
              View all
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {books.map((book, index) => (
              <div key={book.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                <BookCard {...book} />
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="my-20 rounded-[2.5rem] bg-card p-12 md:p-16 text-center animate-scale-in">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Stay Updated.</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
            On Zambia's economy, history and everyday realities.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-start sm:justify-center gap-3 sm:gap-4 animate-slide-up stagger-2">
              <Button className="rounded-full  w-full px-6 sm:px-8 py-6 text-base font-medium">
                <Play className="w-4 h-4 mr-2" />
                Watch Videos
              </Button>

              <Button
                variant="outline"
                className="rounded-full  w-full px-6 sm:px-8 py-6 text-base font-medium"
              >
                Explore Books
              </Button>
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
                  <a href="/contact" className="hover:text-accent transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/donate" className="hover:text-accent transition-colors">
                    Donate
                  </a>
                </li>
                <li>
                  <a href="/donate" className="hover:text-accent transition-colors">
                    Advertise with us
                  </a>
                </li>
                <li>
                  <a href="/donate" className="hover:text-accent transition-colors">
                    How we make money
                  </a>
                </li>
               
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/about" className="hover:text-accent transition-colors">
                    Our Story
                  </a>
                </li>
                
                <li>
                  <a href="/contact" className="hover:text-accent transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
           
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/privacy" className="hover:text-accent transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-accent transition-colors">
                    Terms of Service
                  </a>
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
