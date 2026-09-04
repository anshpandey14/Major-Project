import { Link, useLocation } from "react-router-dom";
import {
  Baby,
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Syringe,
  Users,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const AppSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const role = user?.role;

  const commonItems = [
    {
      title: "Dashboard",
      url:
        role === "asha"
          ? "/asha/dashboard"
          : role === "phc"
            ? "/phc/dashboard"
            : "/admin/dashboard",
      icon: LayoutDashboard,
    },
  ];

  const ashaItems = [
    {
      title: "Patients",
      url: "/asha/patients",
      icon: Users,
    },
  ];

  const phcItems = [
    {
      title: "Patients",
      url: "/phc/dashboard",
      icon: Users,
    },
  ];

  const adminItems = [
    {
      title: "Register PHC",
      url: "/admin/register-phc",
      icon: UserPlus,
    },
  ];

  const getItems = () => {
    switch (role) {
      case "asha":
        return [...commonItems, ...ashaItems];
      case "phc":
        return [...commonItems, ...phcItems];
      case "it_admin":
        return [...commonItems, ...adminItems];
      default:
        return commonItems;
    }
  };

  const items = getItems();

  const isActive = (url) => {
    if (
      url === "asha/dashboard" ||
      url === "/phc/dashboard" ||
      url === "/admin/dashboard"
    ) {
      return location.pathname === url;
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-12 items-center gap-2 px-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulse className="size-5" />
          </div>
          <div className="felx flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="turncate text-sm font-semibold">Rural Health</span>
            <span className="truncate text-xs text-muted-foreground">
              Management System
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(role === "asha" || role === "phc") && (
          <SidebarGroup>
            <SidebarGroupLabel>Healthcare</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Visits">
                    <Link to={role === "asha" ? "/asha/visits" : "/phc/visits"}>
                      <ClipboardList />
                      <span>Visits</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Vaccinations">
                    <Link
                      to={
                        role === "asha"
                          ? "/asha/Vaccinations"
                          : "/phc/Vaccinations"
                      }
                    >
                      <Syringe />
                      <span>Vaccinations</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="ANC">
                    <Link to={role === "asha" ? "/asha/anc" : "/phc/anc"}>
                      <Baby />
                      <span>ANC</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {role === "it_admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="System Management">
                    <Link to="/admin/system">
                      <ShieldCheck />
                      <span>System Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link to="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
