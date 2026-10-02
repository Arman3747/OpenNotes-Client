import DashboardNavbar from "@/components/Dashboard/DashboardNavbar";
import DashboardSideNavigation from "@/components/Dashboard/DashboardSideNavigation";
import UserSidebar from "@/components/Dashboard/UserSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const CommonDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <DashboardNavbar></DashboardNavbar>

      {/* <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center gap-2 ">
          <DashboardSideNavigation></DashboardSideNavigation>

          <div className="border-2">{children}</div>
        </div>
      </div> */}

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

      {/* <PublicNavbar></PublicNavbar> */}

      {/* <PublicFooter></PublicFooter> */}
    </>
  );
};

export default CommonDashboardLayout;
