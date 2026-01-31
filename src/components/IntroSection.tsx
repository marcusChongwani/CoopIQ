import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const IntroSection = () => {
  return (
    <section className="max-w-3xl mx-auto py-4 animate-fade-in text-left sm:text-center">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground mb-6 animate-slide-up">
        <span className="block sm:hidden">Explaining Zambia beyond the headlines.</span>
        <span className="hidden sm:block">Zambia, Explained</span>
      </h1>

      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl sm:mx-auto mb-10 animate-slide-up stagger-1">
        Documentary-Style stories, Explainers, and e-books breaking down the country beyond headlines.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-start sm:justify-center gap-3 sm:gap-4 animate-slide-up stagger-2">
        <Button asChild className="rounded-md w-full sm:w-auto px-6 sm:px-8 py-6 text-base font-medium">
          <Link to="/videos">
            <Play className="w-4 h-4 mr-2" />
            Watch Videos
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="rounded-md px-6 w-full sm:w-auto sm:px-8 py-6 text-base font-medium"
        >
          <Link to="/books">Explore Books</Link>
        </Button>
      </div>
    </section>
  );
};

export default IntroSection;
