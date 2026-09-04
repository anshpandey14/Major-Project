import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import AppSidebar from "./AppSidebar";
import HeaderUserMenu from "./HeaderUserMenu";

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger />

            <Separator orientation="vertical" className="mr-2 h-4" />

            <div className="flex flex-1 items-center justify-end">
              <HeaderUserMenu />
            </div>
          </header>

          <main className="flex-1 bg-muted/40 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
