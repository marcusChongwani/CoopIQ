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
    <div className="flex sm:flex-row gap-6 bg-background rounded-lg">
      {/* Book Cover */}
      <div className="flex-shrink-0 w-40">
        <img
          src={image}
          alt={title}
          className="w-full h-auto aspect-square object-cover rounded"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center gap-3">
        <h3 className="text-lg sm:text-2xl font-bold text-foreground uppercase line-clamp-2 tracking-wide">
          {title}
        </h3>
        <p className="text-muted-foreground line-clamp-1">{subtitle}</p>
       
        <Link to={`/book/${slug}`}>
          <Button className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-5 mt-2 w-fit">
            {buttonText}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BookCard;
