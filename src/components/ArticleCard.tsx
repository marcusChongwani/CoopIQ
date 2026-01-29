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
  category,
  image,
  videoUrl,
  size = "small",
  subtitle = "The deeper story of Zambia's debt trap with China.",
}: ArticleCardProps) => {
  return (
    <a
      href={`/article/${id}`}
      className={[
        "bg-white",
        "transition-all duration-300",
        size === "large" ? "col-span-1 md:col-span-2" : "",
      ].join(" ")}
    >
      {/* Thumbnail / Video */}
      <div
        className={[
          "bg-muted rounded-md overflow-hidden",
          size === "large" ? "aspect-[16/8]" : "aspect-[16/9]",
        ].join(" ")}
      >
        {videoUrl ? (
          <iframe
            src={videoUrl}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
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

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-1">
          {subtitle}
        </p>
      </div>
    </a>
  );
};

export default ArticleCard;
