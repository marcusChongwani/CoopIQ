import { useEffect } from "react";

type JsonLdData = 
  | OrganizationSchema
  | WebSiteSchema
  | ArticleSchema
  | VideoSchema
  | BookSchema
  | BreadcrumbSchema;

interface OrganizationSchema {
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  description?: string;
}

interface WebSiteSchema {
  "@type": "WebSite";
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
}

interface ArticleSchema {
  "@type": "Article" | "NewsArticle";
  headline: string;
  description?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: {
    "@type": "Person" | "Organization";
    name: string;
  };
  publisher?: {
    "@type": "Organization";
    name: string;
    logo?: {
      "@type": "ImageObject";
      url: string;
    };
  };
}

interface VideoSchema {
  "@type": "VideoObject";
  name: string;
  description?: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  contentUrl?: string;
  embedUrl?: string;
  duration?: string;
}

interface BookSchema {
  "@type": "Book";
  name: string;
  description?: string;
  image?: string;
  author?: {
    "@type": "Person" | "Organization";
    name: string;
  };
  offers?: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
    availability: string;
  };
}

interface BreadcrumbSchema {
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }[];
}

interface JsonLdProps {
  data: JsonLdData | JsonLdData[];
}

const SITE_URL = "https://deepthofzambia.lovable.app";

const JsonLd = ({ data }: JsonLdProps) => {
  useEffect(() => {
    const scriptId = "json-ld-script";
    
    // Remove existing script if present
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script element
    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";

    const jsonLdData = Array.isArray(data)
      ? data.map((item) => ({ "@context": "https://schema.org", ...item }))
      : { "@context": "https://schema.org", ...data };

    script.text = JSON.stringify(jsonLdData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null;
};

// Helper functions to create common schemas
export const createOrganizationSchema = (): OrganizationSchema => ({
  "@type": "Organization",
  name: "Depths of Zambia",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: "Research-driven explainer videos breaking down the issues shaping life in Zambia.",
  sameAs: [
    "https://www.youtube.com/@DepthsofZambia",
    // Add social media links as they become available
  ],
});

export const createWebSiteSchema = (): WebSiteSchema => ({
  "@type": "WebSite",
  name: "Depths of Zambia",
  url: SITE_URL,
  description: "Explainer videos focused on understanding Zambian stories, not noise or hype.",
});

export const createVideoSchema = (video: {
  title: string;
  description?: string;
  thumbnail?: string;
  youtubeUrl: string;
  createdAt: string;
}): VideoSchema => {
  const videoId = video.youtubeUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/
  )?.[1];

  return {
    "@type": "VideoObject",
    name: video.title,
    description: video.description || video.title,
    thumbnailUrl: video.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : undefined),
    uploadDate: video.createdAt,
    embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : undefined,
  };
};

export const createBookSchema = (book: {
  title: string;
  description?: string;
  image?: string;
  price: number;
  slug: string;
}): BookSchema => ({
  "@type": "Book",
  name: book.title,
  description: book.description || book.title,
  image: book.image,
  author: {
    "@type": "Organization",
    name: "Depths of Zambia",
  },
  offers: {
    "@type": "Offer",
    price: book.price.toString(),
    priceCurrency: "ZMW",
    availability: "https://schema.org/InStock",
  },
});

export const createBreadcrumbSchema = (
  items: { name: string; url?: string }[]
): BreadcrumbSchema => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url ? `${SITE_URL}${item.url}` : undefined,
  })),
});

export default JsonLd;
