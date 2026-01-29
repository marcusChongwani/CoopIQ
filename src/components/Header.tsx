import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 py-2 sm:py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 pill-nav px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <img src={logo} alt="Depths of Zambia" className="h-8 sm:h-10 w-auto" />
              <span className="text-base sm:text-xl font-bold font-serif text-primary hidden md:block truncate">Depths of Zambia</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
              Home
            </Link>
            <Link to="/videos" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
              Videos
            </Link>
            <Link to="/books" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
              Books
            </Link>
            <Link to="/donate" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
              Advertise
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Link to="/donate">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-full">
                Donate
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-1.5 sm:p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 rounded-2xl bg-white animate-fade-in">
            <nav className="flex flex-col gap-4">
              <Link to="/" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
                Home
              </Link>
              <Link to="/videos" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
                Videos
              </Link>
              <Link to="/books" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
                Books
              </Link>
              <Link to="/donate" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
                Advertise
              </Link>
              <Link to="/contact" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
                Contact
              </Link>

              <Link to="/donate">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-full">
                  Donate
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
