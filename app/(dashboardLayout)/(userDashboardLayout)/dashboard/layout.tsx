import DashboardNavbar from "@/components/Dashboard/DashboardNavbar";
import UserSidebar from "@/components/Dashboard/UserSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React from "react";

const userDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <DashboardNavbar></DashboardNavbar>

      <SidebarProvider>
        <UserSidebar />

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
            <SidebarTrigger />

            <span className="text-sm font-medium">User Dashboard</span>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default userDashboardLayout;
