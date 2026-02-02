import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  /**
   * Canonical can be:
   * - a path like "/videos/123"
   * - a full URL like "https://www.depthsofzambia.com/videos/123"
   */
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

/** ✅ Pick ONE and keep it consistent everywhere (canonical, sitemap, redirects). */
const SITE_URL = "https://www.depthsofzambia.com";
const SITE_NAME = "Depths of Zambia";

const DEFAULT_DESCRIPTION =
  "Research-driven explainer videos breaking down the issues shaping life in Zambia — clearly, calmly, and with context.";

/** ✅ Put og-image.png in /public so it's served from your own domain. */
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

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
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Explainer Videos with Context`;

  // ✅ Build a safe canonical URL (supports "/path" or full "https://..." input)
  const fullCanonical = canonical
    ? canonical.startsWith("http")
      ? canonical
      : `${SITE_URL}${canonical.startsWith("/") ? "" : "/"}${canonical}`
    : undefined;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to set or update meta tags (name= or property=)
    const setMeta = (key: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, key);
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

    // Helper to remove previously injected meta tags by property/name
    const removeAllMeta = (key: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      document
        .querySelectorAll(`meta[${attr}="${key}"]`)
        .forEach((el) => el.parentNode?.removeChild(el));
    };

    // Helper to add duplicate meta tags (needed for article:tag)
    const addMeta = (key: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      const el = document.createElement("meta");
      el.setAttribute(attr, key);
      el.setAttribute("content", content);
      document.head.appendChild(el);
    };

    // Basic meta tags
    setMeta("description", description);
    setMeta("author", author || SITE_NAME);

    // Robots
    setMeta(
      "robots",
      noIndex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );

    // Canonical + OG URL (always set to something stable)
    const effectiveUrl = fullCanonical || `${SITE_URL}${window.location.pathname}`;
    setLink("canonical", effectiveUrl);
    setMeta("og:url", effectiveUrl, true);

    // Open Graph
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type, true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("og:image", image, true);
    setMeta("og:image:alt", imageAlt, true);
    setMeta("og:locale", "en_ZM", true);

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
    setMeta("twitter:url", effectiveUrl);

    // Clean old article meta that can linger between SPA route changes
    removeAllMeta("article:published_time", true);
    removeAllMeta("article:modified_time", true);
    removeAllMeta("article:author", true);
    removeAllMeta("article:section", true);
    removeAllMeta("article:tag", true);

    // Article-specific meta
    if (type === "article") {
      if (publishedTime) addMeta("article:published_time", publishedTime, true);
      if (modifiedTime) addMeta("article:modified_time", modifiedTime, true);
      if (author) addMeta("article:author", author, true);
      if (section) addMeta("article:section", section, true);

      // ✅ Correct: repeat the same property multiple times
      tags.forEach((tag) => addMeta("article:tag", tag, true));
    }
  }, [
    fullTitle,
    description,
    type,
    image,
    imageAlt,
    fullCanonical,
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    noIndex,
  ]);

  return null;
};

export default SEOHead;
