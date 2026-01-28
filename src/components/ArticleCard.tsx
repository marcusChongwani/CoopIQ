import { Play } from "lucide-react";

interface ArticleCardProps {
  id: string;
  title: string;
  category: string;
  date: string; // keeping it, but not shown (the reference card doesn’t show date)
  image: string;
  size?: "small" | "large";
  subtitle?: string; // optional (matches the “deeper story…” line)
}

const ArticleCard = ({
  id,
  title,
  category,
  image,
  size = "small",
  subtitle = "The deeper story of Zambia’s debt trap with China.",
}: ArticleCardProps) => {
  const getCategoryClass = (cat: string) => {
    const normalized = cat.toLowerCase();
    if (normalized.includes("econom")) return "bg-[#F2C66D] text-[#2A1D00]";
    if (normalized.includes("financ")) return "bg-[#F2C66D] text-[#2A1D00]";
    return "bg-[#F2C66D] text-[#2A1D00]";
  };

  return (
    <a
      href={`/article/${id}`}
      className={[
        "  bg-white",
        " transition-all duration-300",
        size === "large" ? "col-span-1 md:col-span-2" : "",
      ].join(" ")}
    >
      {/* Thumbnail */}
      <div
        className={[
          " bg-muted",
          size === "large" ? "aspect-[16/8]" : "aspect-[16/9]",
        ].join(" ")}
      >
        <img
          src={image}
          alt={title}
          className="h-full w-full rounded-md object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        
       
      
       
      </div>

      {/* Content */}
      <div className="py-4">
        <h3
          className={[
            "text-[#1F2937] leading-tight",
            "font-semibold",
            size === "large" ? "text-xl md:text-2xl" : "text-lg",
          ].join(" ")}
        >
          {title}
        </h3>

        <p className="mt-2 text-sm text-black/60 leading-relaxed line-clamp-1">
          {subtitle}
        </p>
      </div>
    </a>
  );
};

export default ArticleCard;
