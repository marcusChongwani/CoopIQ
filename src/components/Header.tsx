import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ShieldCheck, LogOut, LayoutDashboard, BookOpen, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const publicNavLinks = [
    { to: "/", label: "Home" },
    { to: "/videos", label: "Videos" },
    { to: "/books", label: "Books" },
    { to: "/donate", label: "Advertise" },
    { to: "/contact", label: "Contact" },
  ];

  const adminNavLinks = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/books", label: "Books" },
    { to: "/admin/videos", label: "Videos" },
  ];

  const navLinks = isAdmin ? adminNavLinks : publicNavLinks;

  return (
    <header className="sticky top-0 z-50 py-2 sm:py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 pill-nav px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center min-w-0 gap-3">
            <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2 sm:gap-3">
              <img src={logo} alt="Depths of Zambia" className="h-8 sm:h-10 w-auto" />
              <span className="text-base sm:text-xl font-bold font-serif text-primary hidden md:block truncate">
                Depths of Zambia
              </span>
            </Link>
            {isAdmin && (
              <Badge variant="secondary" className="hidden sm:inline-flex items-center gap-1 text-xs">
                <ShieldCheck className="h-3 w-3" />
                Admin
              </Badge>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/"
                className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all text-muted-foreground"
              >
                View Site
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {isAdmin ? (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Link to="/donate">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                  Donate
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button - only for non-admin */}
            {!isAdmin && (
              <button
                className="md:hidden p-1.5 sm:p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu - only for non-admin */}
        {isMenuOpen && !isAdmin && (
          <div className="md:hidden py-4 rounded-2xl bg-white animate-fade-in">
            <nav className="flex flex-col gap-4">
              {publicNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/donate" onClick={() => setIsMenuOpen(false)}>
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
