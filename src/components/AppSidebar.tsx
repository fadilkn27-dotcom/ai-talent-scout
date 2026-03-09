import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
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
  FileText,
  Users,
  BarChart3,
  Code2,
  CheckCircle,
  LogOut,
  Brain,
  ClipboardList,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const clientNav = [
  { title: "Assessments", url: "/client", icon: ClipboardList },
  { title: "AI Task Generator", url: "/client/generator", icon: Brain },
  { title: "Evaluations", url: "/client/evaluations", icon: BarChart3 },
];

const workerNav = [
  { title: "My Tasks", url: "/worker", icon: FileText },
  { title: "Code Editor", url: "/worker/editor", icon: Code2 },
  { title: "Results", url: "/worker/results", icon: CheckCircle },
];

const hrNav = [
  { title: "Candidates", url: "/hr", icon: Users },
  { title: "Analytics", url: "/hr/analytics", icon: BarChart3 },
  { title: "Manage Users", url: "/hr/users", icon: UserPlus },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  if (!user) return null;

  const navItems = user.role === "client" ? clientNav : user.role === "worker" ? workerNav : hrNav;
  const roleLabel = user.role === "client" ? "Task Creator" : user.role === "worker" ? "Candidate" : "HR Admin";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-5">
            {!collapsed ? (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                  <Brain className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-sidebar-foreground">EvalAI</p>
                  <p className="text-[10px] text-muted-foreground">{roleLabel}</p>
                </div>
              </div>
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Brain className="h-3.5 w-3.5 text-primary-foreground" />
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
                      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      activeClassName="bg-primary/10 text-primary font-medium"
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

      <SidebarFooter className="bg-sidebar border-t p-3">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2.5 rounded-md bg-accent p-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-medium text-foreground">{user.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={() => logout()}
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2 text-sm">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
