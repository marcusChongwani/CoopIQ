import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Video,
  LogOut,
  LayoutDashboard,
  Home,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import Header from "@/components/Header";

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/admin/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user && !isAdmin) navigate("/");
  }, [isAdmin, loading, user, navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground/60" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const isActive = (path: string) => {
    // active for exact or nested routes like /admin/books/123
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="space-y-1 gap-1 flex flex-col">
      <Link to="/admin" onClick={onNavigate}>
        <button
          className={[
            "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            isActive("/admin")
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          ].join(" ")}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </button>
      </Link>

      <Link to="/admin/books" onClick={onNavigate}>
        <button
          className={[
            "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            isActive("/admin/books")
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          ].join(" ")}
        >
          <BookOpen className="h-4 w-4" />
          Books
        </button>
      </Link>

      <Link to="/admin/videos" onClick={onNavigate}>
        <button
          className={[
            "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            isActive("/admin/videos")
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          ].join(" ")}
        >
          <Video className="h-4 w-4" />
          Videos
        </button>
      </Link>

      <div className="pt-4 mt-4 border-t border-border">
        <Link to="/" onClick={onNavigate}>
          <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
            Back to site
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header/>
      {/* Mobile top bar (minimal) */}
      <header className="lg:hidden sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">Admin</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-xl"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Layout */}
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-[280px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block border-r bg-background">
          <div className="sticky top-0 h-screen px-4 py-6">
            <div className="px-2 mb-6">
              <p className="text-xs text-muted-foreground">Depths of Zambia</p>
              <h1 className="text-lg font-semibold tracking-tight">Admin</h1>
            </div>

            <NavLinks />

            <div className="mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl text-destructive "
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50"
            aria-hidden={!sidebarOpen}
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />

            <div className="absolute left-0 top-0 h-full w-[82%] max-w-[320px] bg-background border-r shadow-xl">
              <div className="h-14 px-4 flex items-center justify-between border-b">
                <div>
                  <p className="text-xs text-muted-foreground">Depths of Zambia</p>
                  <p className="text-sm font-semibold">Admin</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close menu"
                  className="rounded-xl"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4">
                <NavLinks onNavigate={() => setSidebarOpen(false)} />
              </div>

              <div className="absolute bottom-0 left-0 w-full p-4 border-t bg-background">
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-xl text-destructive hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="min-h-[calc(100vh-56px)] lg:min-h-screen px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {/* Optional page shell like Airbnb: subtle top spacing + clean */}
          <div className="max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
