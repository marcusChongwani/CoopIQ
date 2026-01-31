import { Link } from "react-router-dom";
import { Youtube, Music2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/videos" className="hover:text-accent transition-colors">
                  Videos
                </Link>
              </li>
              <li>
                <Link to="/books" className="hover:text-accent transition-colors">
                  Books
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover:text-accent transition-colors">
                  Donate
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-accent transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/how-we-make-money" className="hover:text-accent transition-colors">
                  How We Make Money
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Partner</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/advertise" className="hover:text-accent transition-colors">
                  Advertise With Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us column - lucide-react icons */}
<div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex items-center gap-4">
              <a
                href="https://www.tiktok.com/@depthsofzambia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
                aria-label="Depths of Zambia on TikTok"
              >
                <img src="data:image/png;base64,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" className="h-6 w-6" />
              </a>

              <a
                href="https://youtube.com/@depthsofzambia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
                aria-label="Depths of Zambia on YouTube"
              >
                <img src="https://static.vecteezy.com/system/resources/thumbnails/023/986/739/small/youtube-logo-youtube-logo-transparent-youtube-icon-transparent-free-free-png.png" className="h-7 w-7" />
              </a>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Depths of Zambia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
