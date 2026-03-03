import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Code2,
  CheckCircle,
  Bell,
  LogOut,
  Brain,
  ClipboardList,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const clientNav = [
  { title: "Dashboard", url: "/client", icon: LayoutDashboard },
  { title: "AI Task Generator", url: "/client/generate", icon: Brain },
  { title: "Assessments", url: "/client/assessments", icon: ClipboardList },
  { title: "Evaluations", url: "/client/evaluations", icon: BarChart3 },
];

const workerNav = [
  { title: "Dashboard", url: "/worker", icon: LayoutDashboard },
  { title: "My Tasks", url: "/worker/tasks", icon: FileText },
  { title: "Code Editor", url: "/worker/editor", icon: Code2 },
  { title: "Results", url: "/worker/results", icon: CheckCircle },
];

const hrNav = [
  { title: "Dashboard", url: "/hr", icon: LayoutDashboard },
  { title: "Candidates", url: "/hr/candidates", icon: Users },
  { title: "Analytics", url: "/hr/analytics", icon: BarChart3 },
  { title: "Notifications", url: "/hr/notifications", icon: Bell },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  if (!user) return null;

  const navItems = user.role === "client" ? clientNav : user.role === "worker" ? workerNav : hrNav;
  const roleLabel = user.role === "client" ? "Task Creator" : user.role === "worker" ? "Candidate" : "HR Admin";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6">
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <Brain className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-sidebar-foreground">EvalAI</p>
                  <p className="text-xs text-sidebar-foreground/60">{roleLabel}</p>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-3 rounded-lg bg-sidebar-accent p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={logout}
          className="w-full justify-start text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
