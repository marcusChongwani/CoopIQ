import { Link } from "react-router-dom";
import { Play } from "lucide-react";

interface ArticleCardProps {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  videoUrl?: string;
  size?: "small" | "large";
  subtitle?: string;
}

const ArticleCard = ({
  id,
  title,
  image,
  videoUrl,
  size = "small",
  subtitle = "The deeper story of Zambia's debt trap with China.",
}: ArticleCardProps) => {
  return (
    <Link
      to={`/article/${id}`}
      className={[
        "group block overflow-hidden",
        "transition-all duration-300",
        size === "large" ? "col-span-1 md:col-span-2" : "",
      ].join(" ")}
    >
      {/* Thumbnail with Play Overlay */}
      <div
        className={[
          "relative bg-muted rounded-md overflow-hidden",
          size === "large" ? "aspect-[16/8]" : "aspect-[16/9]",
        ].join(" ")}
      >
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Play button overlay for videos */}
        {videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
            <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-foreground fill-foreground ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="py-4">
        <h3
          className={[
            "text-foreground leading-tight",
            "font-semibold",
            size === "large" ? "text-xl md:text-2xl" : "text-lg",
          ].join(" ")}
        >
          {title}
        </h3>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {subtitle}
        </p>
      </div>
    </Link>
  );
};

export default ArticleCard;
