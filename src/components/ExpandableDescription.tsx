import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableDescriptionProps {
  text: string;
  collapsedHeight?: number;
  className?: string;
}

const ExpandableDescription = ({
  text,
  collapsedHeight = 100,
  className = "",
}: ExpandableDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setNeedsExpansion(contentRef.current.scrollHeight > collapsedHeight);
    }
  }, [text, collapsedHeight]);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  if (!text) return null;

  // If content doesn't need expansion, just show it
  if (!needsExpansion) {
    return (
      <div className={className}>
        <p className="text-lg leading-relaxed text-muted-foreground">{text}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative">
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? "auto" : collapsedHeight }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="overflow-hidden"
        >
          <div ref={contentRef}>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {text}
            </p>
          </div>
        </motion.div>

        {/* Gradient fade overlay - only visible when collapsed */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleExpanded}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1 -ml-1"
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <>
            Show less
            <ChevronUp className="w-4 h-4" />
          </>
        ) : (
          <>
            Read full description
            <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};

export default ExpandableDescription;
