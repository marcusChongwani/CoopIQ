import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InAppBrowserModalProps {
  open: boolean;
  onClose: () => void;
  browserName?: string | null;
}

const InAppBrowserModal = ({ open, onClose, browserName }: InAppBrowserModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="relative w-full max-w-md mx-4 mb-0 sm:mb-0 bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Video container */}
            <div className="relative  w-full max-h-[50vh] bg-muted overflow-hidden">
              <video autoPlay loop muted playsInline className="w-full h-full object-contain">
                <source src="/videos/open-in-browser-guide.mov" type="video/quicktime" />
                <source src="/videos/open-in-browser-guide.mov" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Open in {browserName ? "Safari or Chrome" : "your browser"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Payments and downloads may not work properly in {browserName ? `${browserName}'s` : "in-app"} browser.
                  Tap the <span className="font-medium text-foreground">⋯</span> menu and select{" "}
                  <span className="font-medium text-foreground">"Open in Safari"</span> or{" "}
                  <span className="font-medium text-foreground">"Open in Chrome"</span>.
                </p>
              </div>

              <Button variant="outline" className="w-full rounded-full" onClick={onClose}>
                Got it
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InAppBrowserModal;
