"use client";

import { logoutUser } from "@/app/services/auth/logout";
import { Button } from "../ui/button";

const LogOut = () => {
  const handleLogout = async () => {
    await logoutUser();
  };
  return (
    <Button variant={"destructive"} onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogOut;
