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
    url?: string;
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

/** ✅ Pick ONE and keep it consistent everywhere (canonical, sitemap, redirects). */
const SITE_URL = "https://www.depthsofzambia.com";

const JsonLd = ({ data }: JsonLdProps) => {
  useEffect(() => {
    const scriptId = "json-ld-script";

    // Remove existing script if present
    const existingScript = document.getElementById(scriptId);
    if (existingScript) existingScript.remove();

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
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [data]);

  return null;
};

// --- Helpers ---

/** Supports "/path" or full "https://..." */
const toAbsoluteUrl = (maybeUrl?: string) => {
  if (!maybeUrl) return undefined;
  if (maybeUrl.startsWith("http://") || maybeUrl.startsWith("https://")) return maybeUrl;
  return `${SITE_URL}${maybeUrl.startsWith("/") ? "" : "/"}${maybeUrl}`;
};

export const createOrganizationSchema = (): OrganizationSchema => ({
  "@type": "Organization",
  name: "Depths of Zambia",
  url: SITE_URL,
  // Put logo.png in /public so it lives on your domain
  logo: `${SITE_URL}/BackgroundEraser_20250320_125313018.png`,
  description: "Research-driven explainer videos breaking down the issues shaping life in Zambia.",
  sameAs: [
    "https://www.youtube.com/@DepthsofZambia",
    // Add more as needed
  ],
});

export const createWebSiteSchema = (): WebSiteSchema => ({
  "@type": "WebSite",
  name: "Depths of Zambia",
  url: SITE_URL,
  description: "Explainer videos focused on understanding Zambian stories, not noise or hype.",
  // Optional but helpful if you have a search page/feature
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
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

  const thumbnailUrl =
    video.thumbnail ||
    (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined);

  return {
    "@type": "VideoObject",
    name: video.title,
    description: video.description || video.title,
    thumbnailUrl,
    uploadDate: video.createdAt,
    contentUrl: video.youtubeUrl,
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
  image: toAbsoluteUrl(book.image) || book.image,
  author: {
    "@type": "Organization",
    name: "Depths of Zambia",
  },
  offers: {
    "@type": "Offer",
    price: book.price.toString(),
    priceCurrency: "ZMW",
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}/book/${book.slug}`,
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
    item: toAbsoluteUrl(item.url),
  })),
});

export default JsonLd;
