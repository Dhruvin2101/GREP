
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, signOut } = useAuth();
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an issue logging you out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // If not authenticated, show loading and redirect
  useEffect(() => {
    if (!user && !session) {
      // Short delay to avoid immediate flicker during auth check
      const timer = setTimeout(() => {
        navigate("/login");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user, session, navigate]);
  
  if (!user || !session) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-grep-500" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex">
      <DashboardSidebar 
        onLogout={handleLogout}
        userName={user?.user_metadata?.full_name || user.email} 
      />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen bg-gray-50 p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
