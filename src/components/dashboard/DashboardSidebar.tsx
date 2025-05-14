
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Book, MessageCircle, BookOpen, Calendar, User, LogOut, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Vocabulary Builder",
    icon: Book,
    href: "/dashboard/vocabulary"
  },
  {
    title: "Paraphrase Helper",
    icon: MessageCircle,
    href: "/dashboard/paraphrase"
  },
  {
    title: "Reading Comprehension",
    icon: BookOpen,
    href: "/dashboard/reading"
  },
  {
    title: "Study Plan",
    icon: Calendar,
    href: "/dashboard/study-plan"
  },
  {
    title: "Profile",
    icon: User,
    href: "/dashboard/profile"
  }
];

interface DashboardSidebarProps {
  onLogout: () => void;
  userName?: string | null; // Added userName prop as optional
}

const DashboardSidebar = ({ onLogout, userName }: DashboardSidebarProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  // Open sidebar by default on desktop
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-full"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-gray-200 transition-transform duration-300 flex flex-col",
          isMobile && !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center">
            <Logo />
          </Link>
          {userName && (
            <div className="text-sm font-medium text-sidebar-foreground truncate ml-2">
              {userName}
            </div>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.title}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    location.pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default DashboardSidebar;
