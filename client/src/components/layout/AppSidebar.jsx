import { Link, useLocation } from "react-router-dom";
import {
  HeartPulse,
  LayoutDashboard,
  Users,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
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
    { title: "Patients", url: "/phc/patients", icon: Users },
    { title: "Register ASHA", url: "/phc/register-asha", icon: UserPlus },
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
      url === "/asha/dashboard" ||
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
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate  text-sm font-semibold">
              Rural Health
            </span>
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

      </SidebarContent>


    </Sidebar>
  );
};

export default AppSidebar;
