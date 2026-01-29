import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Video,
  Home,
  CreditCard,
  ChevronDown,
  Megaphone,
  DollarSign,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    navigate("/");
  };
  const publicNavLinks = [
    {
      to: "/",
      label: "Home",
    },
    {
      to: "/videos",
      label: "Videos",
    },
    {
      to: "/books",
      label: "Books",
    },
  ];
  const moreLinks = [
    {
      to: "/advertise",
      label: "Advertise With Us",
      icon: Megaphone,
    },
    {
      to: "/how-we-make-money",
      label: "How We Make Money",
      icon: DollarSign,
    },
    {
      to: "/contact",
      label: "Contact",
      icon: Mail,
    },
  ];
  const adminNavLinks = [
    {
      to: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/admin/books",
      label: "Books",
      icon: BookOpen,
    },
    {
      to: "/admin/videos",
      label: "Videos",
      icon: Video,
    },
    {
      to: "/admin/payments",
      label: "Payments",
      icon: CreditCard,
    },
  ];
  const navLinks = isAdmin
    ? adminNavLinks.map(({ to, label }) => ({
        to,
        label,
      }))
    : publicNavLinks;
  return (
    <header className="sticky top-0 z-50 py-2 sm:py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 pill-nav px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center min-w-0 gap-3">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Depths of Zambia" className="h-8 sm:h-10 w-auto" />
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
            {!isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all flex items-center gap-1">
                    More
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {moreLinks.map((link) => (
                    <DropdownMenuItem key={link.to} asChild>
                      <Link to={link.to} className="flex items-center gap-2 cursor-pointer">
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {!isAdmin && (
              <Link to="/donate">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">Donate</Button>
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {isAdmin ? (
              <>
                <Button variant="outline" size="sm" className="rounded-full hidden sm:flex" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
                {/* Mobile Dashboard button + menu for admin */}
                <Link to="/admin" className="md:hidden">
                  <Button variant="ghost" size="sm" className="rounded-full gap-1.5">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="text-sm">Dashboard</span>
                  </Button>
                </Link>
                <button
                  className="md:hidden p-1.5 sm:p-2"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                </button>
              </>
            ) : (
              <>
                {/* Mobile Menu Button for public */}
                <button
                  className="md:hidden p-1.5 sm:p-2"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 rounded-2xl bg-background  mt-2 animate-fade-in shadow-lg">
            <nav className="flex flex-col gap-1 px-2">
              {isAdmin ? (
                <>
                  {adminNavLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center gap-3 text-sm font-medium hover:bg-muted/60 rounded-xl px-4 py-3 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    to="/"
                    className="flex items-center gap-3 text-sm font-medium hover:bg-muted/60 rounded-xl px-4 py-3 transition-all text-muted-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="h-4 w-4" />
                    View Site
                  </Link>
                  <div className="border-t border-border my-2" />
                  <button
                    className="flex items-center gap-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl px-4 py-3 transition-all w-full text-left"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  {publicNavLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="text-sm font-medium hover:bg-muted/60 rounded-xl px-4 py-3 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t border-border my-2" />
                  <p className="text-xs text-muted-foreground px-4 py-2">More</p>
                  {moreLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center gap-3 text-sm font-medium hover:bg-muted/60 rounded-xl px-4 py-3 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link to="/donate" onClick={() => setIsMenuOpen(false)} className="px-2 pt-2">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-full">
                      Donate
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
