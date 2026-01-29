import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import AdminBottomNav from "@/components/AdminBottomNav";

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/admin/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user && !isAdmin) navigate("/");
  }, [isAdmin, loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground/60" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      
      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
        <Outlet />
      </main>

      {/* Mobile bottom nav for admin */}
      <AdminBottomNav />
    </div>
  );
}
