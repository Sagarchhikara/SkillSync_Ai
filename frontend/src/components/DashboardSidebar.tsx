import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Upload, Briefcase, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

import { Target, BookmarkCheck } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Upload Resume", icon: Upload, path: "/dashboard/upload" },
  { label: "Jobs", icon: Briefcase, path: "/dashboard/jobs" },
  { label: "Job Matching", icon: Target, path: "/dashboard/match" },
  { label: "Saved Jobs", icon: BookmarkCheck, path: "/dashboard/saved-jobs" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filteredNavItems = navItems.filter((item) => {
    if (user?.role === "recruiter") {
      return item.path === "/dashboard" || item.path === "/dashboard/jobs";
    }
    return true;
  });

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
          <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="text-sm font-bold text-foreground">SkillSync AI</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredNavItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
