import { Play, ExternalLink } from "lucide-react";

interface VideoCardProps {
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  url: string;
}

const VideoCard = ({
  title,
  description,
  thumbnail,
  duration,
  url,
}: VideoCardProps) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video bg-muted">
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-foreground fill-foreground ml-1" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {duration}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors flex items-start gap-2">
          {title}
          <ExternalLink className="w-4 h-4 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {description}
        </p>
      </div>
    </a>
  );
};

export default VideoCard;
