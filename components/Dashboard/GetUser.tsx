"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const GetUser = () => {
  const { user } = useAuth();

  if (!user) {
    return <Link href="/login">Login</Link>;
  }
  return (
    <div>
      <p className="text-2xl font-thin text-primary capitalize">
        {user?.role?.toLowerCase().replace(/_/g, " ")} Dashboard
      </p>
    </div>
  );
};

export default GetUser;
