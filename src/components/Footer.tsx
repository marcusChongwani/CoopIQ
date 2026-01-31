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
                <img src="https://static.vecteezy.com/system/resources/thumbnails/042/148/603/small/tiktok-logo-tiktok-social-media-icon-free-png.png" className="h-6 w-6" />
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
