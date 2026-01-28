import { useState } from "react";
import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Placeholder video data - replace with actual data from database
const PLACEHOLDER_VIDEOS = [
  {
    id: "1",
    title: "Understanding Zambia's Economy",
    description: "A deep dive into the economic landscape of Zambia and what drives growth.",
    thumbnail: "/placeholder.svg",
    duration: "12:34",
    url: "#",
  },
  {
    id: "2",
    title: "The History of the Kwacha",
    description: "Tracing the journey of Zambia's currency from independence to today.",
    thumbnail: "/placeholder.svg",
    duration: "8:45",
    url: "#",
  },
  {
    id: "3",
    title: "Copper Mining in Zambia",
    description: "Exploring the copper belt and its significance to the nation's economy.",
    thumbnail: "/placeholder.svg",
    duration: "15:20",
    url: "#",
  },
  {
    id: "4",
    title: "Zambian Agriculture Explained",
    description: "Understanding the role of farming in Zambia's economic development.",
    thumbnail: "/placeholder.svg",
    duration: "10:15",
    url: "#",
  },
];

const ITEMS_PER_PAGE = 6;

const Videos = () => {
  const [page, setPage] = useState(1);

  // For now, use placeholder data
  const videos = PLACEHOLDER_VIDEOS;
  const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);
  const paginatedVideos = videos.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            All Videos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Watch our collection of videos explaining Zambia's stories.
          </p>
        </div>

        {paginatedVideos.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No videos available yet. Check back soon!
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {paginatedVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  title={video.title}
                  description={video.description}
                  thumbnail={video.thumbnail}
                  duration={video.duration}
                  url={video.url}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPage(i + 1)}
                      className="w-8 h-8 p-0"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Videos;
