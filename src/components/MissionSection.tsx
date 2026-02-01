import { Link } from "react-router-dom";
import { ArrowRight, Globe2, BookOpen, Video } from "lucide-react";
import logo from "@/assets/logo.png";
// put your map image in assets and import it:
// <-- rename to your actual file

const MissionSection = () => {
  return (
    <section className="">
      <Link
        to="/about"
        className="
          group block overflow-hidden
          
          transition-all
        hover:-translate-y-[1px]
        "
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left: Visual */}
          <div className="lg:col-span-5 relative">

            <div className="relative  sm:p-8 h-full flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                {/* big map card */}
                <div className="">
  <img
    src="https://media.istockphoto.com/id/1618136445/vector/zambia-map-with-waving-flag-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=1hobogTZebSXWy1DWmoDmkg2RQioe-nDui-tSx_yLP0="
    alt="Zambia"
    className="
      w-full
      object-contain
      
      aspect-square
      max-h-56
      sm:max-h-none
    "
  />
</div>

                {/* floating badge */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 border border-border shadow-sm max-w-full">
                    <img
                      src={logo}
                      alt="Depths of Zambia"
                      className="w-7 h-7 rounded-full object-contain shrink-0"
                    />

                    <span className="text-sm font-semibold truncate min-w-0">
                      Depths of Zambia
                    </span>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Right: Copy */}
          <div className="lg:col-span-7 pt-12 sm:p-8 lg:p-10">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Our mission
              </p>

              <span
                className="
                  hidden sm:inline-flex items-center gap-2
                  text-sm font-medium text-muted-foreground
                  group-hover:text-primary transition-colors
                "
              >
                Learn more
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <h3 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
              Explaining Zambia beyond the headlines.
            </h3>

            <p className="mt-3 text-muted-foreground leading-relaxed">
              We turn complex stories into clear, honest explanations — through
              videos and books that help you understand what really matters.
            </p>

            {/* Pillars */}
            <div className="mt-6 hidden  sm:grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Globe2 className="w-4 h-4 text-primary" />
                  Context
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  History, economy, and culture — connected.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Video className="w-4 h-4 text-primary" />
                  Video-first
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Short, watchable breakdowns.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Deep dives
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Books for the full story.
                </p>
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="mt-6 sm:hidden inline-flex items-center gap-2 underline text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              About
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
};

export default MissionSection;
