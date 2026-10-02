"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

const DashboardSideNavigation = () => {
  const { user } = useAuth();

  if (!user) {
    return <Link href="/login">Login</Link>;
  }

  const WorkspaceItems = [
    { href: "/", label: "Main Page" },
    { href: "/dashboard", label: "My Dashboard" },
    // { href: "/health-plans", label: "Health Plans" },
    // { href: "/medicine", label: "Medicine" },
  ];



  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <nav className="flex flex-col items-center space-x-6 text-sm font-medium">
        {WorkspaceItems.map((link) => (
          <Link key={link.label} href={link.href} prefetch={true}>
            <Button>{link.label}</Button>
          </Link>
        ))}
      </nav>
      
    </div>
  );
};

export default DashboardSideNavigation;
