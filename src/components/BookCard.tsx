import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface BookCardProps {
  slug: string;
  title: string;
  subtitle: string;
  price: string;
  image: string;
  buttonText?: string;
}

const BookCard = ({
  slug,
  title,
  subtitle,
  price,
  image,
  buttonText = "Get the Book",
}: BookCardProps) => {
  return (
    <div className="flex gap-4 sm:gap-6 bg-background rounded-lg">
      {/* Cover */}
      <div className="shrink-0 w-24 sm:w-40">
        <img
          src={image}
          alt={title}
          className="w-full aspect-[3/4] object-cover rounded"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-2 sm:gap-3">
        <h3 className="text-base sm:text-2xl font-bold text-foreground uppercase line-clamp-2 tracking-wide">
          {title}
        </h3>

        <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">
          {subtitle}
        </p>

      

        <Link to={`/book/${slug}`} className=" block w-full">
          <Button
            className="
              w-full sm:w-fit
              rounded-md
              bg-primary hover:bg-primary/90 text-primary-foreground
              px-4 sm:px-6
              py-4 sm:py-5
            "
          >
            <span className="truncate">{buttonText}</span>
            <ChevronRight className="w-4 h-4 ml-1 shrink-0" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BookCard;
