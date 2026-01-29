import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Video, CreditCard } from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/books", icon: BookOpen, label: "Books" },
  { to: "/admin/videos", icon: Video, label: "Videos" },
  { to: "/admin/payments", icon: CreditCard, label: "Payments" },
];

export default function AdminBottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs transition-colors ${
              isActive(item.to)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
