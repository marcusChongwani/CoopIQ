import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookCardProps {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  image: string;
  buttonText?: string;
}

const BookCard = ({
  id,
  title,
  subtitle,
  price,
  image,
  buttonText = "Get the Book",
}: BookCardProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-6 bg-background p-4 rounded-lg">
      {/* Book Cover */}
      <div className="flex-shrink-0 w-full sm:w-48">
        <img
          src={image}
          alt={title}
          className="w-full h-auto rounded shadow-md"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center gap-3">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-muted-foreground">{subtitle}</p>
        <p className="text-muted-foreground">{price}</p>
        <a href={`/book/${id}`}>
          <Button className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-5 mt-2 w-fit">
            {buttonText}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </a>
      </div>
    </div>
  );
};

export default BookCard;
