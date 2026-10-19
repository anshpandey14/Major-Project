import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import AppSidebar from "./AppSidebar";
import HeaderUserMenu from "./HeaderUserMenu";
import { Activity } from "lucide-react";

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="ehr-topbar sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 px-4 md:px-6">
            <SidebarTrigger className="rounded-xl" />
            <Separator orientation="vertical" className="h-5 opacity-60" />
            <div className="hidden items-center gap-2 text-sm font-medium text-muted-foreground sm:flex">
              <Activity className="size-4 text-primary" />
              <span>Community Health Workspace</span>
            </div>
            <div className="flex flex-1 items-center justify-end">
              <HeaderUserMenu />
            </div>
          </header>
          <main className="ehr-main flex-1 p-4 md:p-7 lg:p-8">
            <div className="relative mx-auto w-full max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
