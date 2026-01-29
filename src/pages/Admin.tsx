import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, LogOut, LayoutDashboard, Home, Menu, X } from 'lucide-react';

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, user, navigate]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavLinks = () => (
    <>
      <Link to="/admin" onClick={() => setSidebarOpen(false)}>
        <Button
          variant={isActive('/admin') ? 'secondary' : 'ghost'}
          className="w-full justify-start"
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </Link>
      <Link to="/admin/books" onClick={() => setSidebarOpen(false)}>
        <Button
          variant={isActive('/admin/books') ? 'secondary' : 'ghost'}
          className="w-full justify-start"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Books
        </Button>
      </Link>
      <Link to="/admin/videos" onClick={() => setSidebarOpen(false)}>
        <Button
          variant={isActive('/admin/videos') ? 'secondary' : 'ghost'}
          className="w-full justify-start"
        >
          <Video className="mr-2 h-4 w-4" />
          Videos
        </Button>
      </Link>
      
      <div className="pt-4 border-t border-border mt-4">
        <Link to="/" onClick={() => setSidebarOpen(false)}>
          <Button
            variant="ghost"
            className="w-full justify-start"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Main Site
          </Button>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between p-4 border-b bg-card">
        <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`
        lg:hidden fixed top-0 left-0 h-full w-64 bg-card border-r z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="px-4 py-4 space-y-2">
          <NavLinks />
        </nav>
        <div className="absolute bottom-0 left-0 w-full p-4 border-t bg-card">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r bg-card min-h-screen sticky top-0">
          <div className="p-6">
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <nav className="px-4 space-y-2">
            <NavLinks />
          </nav>
          <div className="absolute bottom-0 left-0 w-64 p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
