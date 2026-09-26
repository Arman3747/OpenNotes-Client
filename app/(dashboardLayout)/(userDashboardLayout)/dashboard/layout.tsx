import React from "react";

const userDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {/* <PublicNavbar></PublicNavbar> */}
      {children}
      {/* <PublicFooter></PublicFooter> */}
    </>
  );
};

export default userDashboardLayout;
