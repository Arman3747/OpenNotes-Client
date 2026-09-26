import DashboardNavbar from "@/components/Dashboard/DashboardNavbar";

const CommonDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <DashboardNavbar></DashboardNavbar>
      this is a dashboard
      {/* <PublicNavbar></PublicNavbar> */}
      {children}
      {/* <PublicFooter></PublicFooter> */}
    </>
  );
};

export default CommonDashboardLayout;
