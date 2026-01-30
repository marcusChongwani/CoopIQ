import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: "website" | "article" | "book" | "video.other";
  image?: string;
  imageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
}

const SITE_NAME = "Depths of Zambia";
const DEFAULT_DESCRIPTION =
  "Research-driven explainer videos breaking down the issues shaping life in Zambia — clearly, calmly, and with context.";
const DEFAULT_IMAGE = "https://deepthofzambia.lovable.app/og-image.png";
const SITE_URL = "https://deepthofzambia.lovable.app";

const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  type = "website",
  image = DEFAULT_IMAGE,
  imageAlt = "Depths of Zambia",
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  noIndex = false,
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Explainer Videos with Context`;
  const fullCanonical = canonical ? `${SITE_URL}${canonical}` : undefined;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to set or update meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Helper to set link tags
    const setLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    // Basic meta tags
    setMeta("description", description);
    setMeta("author", author || SITE_NAME);

    // Robots
    if (noIndex) {
      setMeta("robots", "noindex, nofollow");
    } else {
      setMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    }

    // Open Graph
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type, true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("og:image", image, true);
    setMeta("og:image:alt", imageAlt, true);
    setMeta("og:locale", "en_ZM", true);
    
    if (fullCanonical) {
      setMeta("og:url", fullCanonical, true);
      setLink("canonical", fullCanonical);
    }

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);

    // Article-specific meta
    if (type === "article" && publishedTime) {
      setMeta("article:published_time", publishedTime, true);
      if (modifiedTime) {
        setMeta("article:modified_time", modifiedTime, true);
      }
      if (author) {
        setMeta("article:author", author, true);
      }
      if (section) {
        setMeta("article:section", section, true);
      }
      tags.forEach((tag, index) => {
        setMeta(`article:tag:${index}`, tag, true);
      });
    }

    // Cleanup function to remove dynamically added tags on unmount
    return () => {
      // We don't remove tags since they get updated on next page
    };
  }, [fullTitle, description, type, image, imageAlt, fullCanonical, publishedTime, modifiedTime, author, section, tags, noIndex]);

  return null;
};

export default SEOHead;
