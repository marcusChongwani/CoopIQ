import { useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, LogOut, LayoutDashboard, Home } from 'lucide-react';

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="p-6">
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        </div>
        <nav className="px-4 space-y-2">
          <Link to="/admin">
            <Button
              variant={isActive('/admin') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/admin/books">
            <Button
              variant={isActive('/admin/books') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Books
            </Button>
          </Link>
          <Link to="/admin/videos">
            <Button
              variant={isActive('/admin/videos') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Video className="mr-2 h-4 w-4" />
              Videos
            </Button>
          </Link>
          
          <div className="pt-4 border-t border-border mt-4">
            <Link to="/">
              <Button
                variant="ghost"
                className="w-full justify-start"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Main Site
              </Button>
            </Link>
          </div>
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
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
