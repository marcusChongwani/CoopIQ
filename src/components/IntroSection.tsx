import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const IntroSection = () => {
  return (
    <section className="max-w-3xl mx-auto py-4  animate-fade-in text-left sm:text-center">
  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground mb-6 animate-slide-up">
    <span className="block sm:hidden">Explaining Zambia beyond the headlines.</span>
    <span className="hidden sm:block">
      Explaining Zambia<br />beyond the headlines.
    </span>
  </h1>

  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl sm:mx-auto mb-10 animate-slide-up stagger-1">
    Independent videos and books breaking down Zambia's economy, history, and
    everyday realities.
  </p>

  <div className="flex flex-row sm:flex-row items-center justify-start sm:justify-center gap-3 sm:gap-4 animate-slide-up stagger-2">
    <Button className="rounded-md px-6 sm:px-8 py-6 text-base font-medium">
      <Play className="w-4 h-4 mr-2" />
      Watch Videos
    </Button>

    <Button
      variant="outline"
      className="rounded-md px-6 sm:px-8 py-6 text-base font-medium"
    >
      Explore Books
    </Button>
  </div>
</section>

  );
};

export default IntroSection;
