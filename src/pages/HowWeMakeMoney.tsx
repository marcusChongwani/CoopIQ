import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { ArrowLeft, Megaphone, Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const HowWeMakeMoney = () => {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            How We Make Money
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            At Depths of Zambia, we focus on context over noise. The goal is simple: help people understand Zambia beyond surface-level takes.
          </p>
        </div>

        {/* Intro */}
        <div className="prose prose-neutral dark:prose-invert mb-12">
          <p className="text-muted-foreground leading-relaxed">
            To keep the work going, we rely on a few clear revenue streams. Our model combines advertising and partnerships, support from our audience, and ebook sales.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            <strong className="text-foreground">Funding never controls the stories we tell.</strong> Editorial independence comes first, always. When content is sponsored, it's clearly disclosed, and partnerships are kept selective and aligned with our values.
          </p>
        </div>

        {/* Revenue Streams */}
        <div className="space-y-8">
          {/* Advertising */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Megaphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">1. Advertising and partnerships</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We work with selected brands and organizations through sponsored documentary videos and stand-alone video ads. All partnerships are designed to fit naturally within our content and meet our editorial standards.
                </p>
              </div>
            </div>
          </div>

          {/* Donations */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">2. Donations</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Some viewers choose to support Depths of Zambia directly. Donations help cover research, scripting, animation, and video production.
                </p>
                <Link to="/donate" className="inline-block mt-4">
                  <Button variant="outline" size="sm" className="rounded-full">
                    Make a Donation
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Ebook Sales */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">3. Ebook sales</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We publish original ebooks focused on Zambian stories. All ebooks start at K10, and readers can choose to pay more if they want to further support the project. All ebooks are ad-free.
                </p>
                <Link to="/books" className="inline-block mt-4">
                  <Button variant="outline" size="sm" className="rounded-full">
                    Browse Books
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Closing */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-muted-foreground text-center">
            That's how Depths of Zambia is sustained. Simple, transparent, and focused on the work.
          </p>
        </div>
      </main>
    </div>
  );
};

export default HowWeMakeMoney;
