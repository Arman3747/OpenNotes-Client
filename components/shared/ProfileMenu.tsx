"use client";

import Link from "next/link";
import { logoutUser } from "@/app/services/auth/logout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { getDefaultDashboardRoute } from "@/lib/authUtils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

export default function ProfileMenu() {
  const { user } = useAuth();

  if (!user) {
    return <Link href="/login">Login</Link>;
  }

  const initials =
    (user?.name?.trim() || user?.email?.trim() || "")
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex justify-center items-center">
        <button
          type="button"
          aria-label="Open account menu"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <HoverCard>
            <HoverCardTrigger delay={10} closeDelay={10}>
              <Avatar className="size-8">
                <AvatarImage
                  src={
                    user.profilePhoto || undefined
                    // || "https://i.ibb.co/WRfzKKY/person-avater.png"
                  }
                  alt={user?.name || user?.email}
                  className="object-cover"
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </HoverCardTrigger>

            <HoverCardContent
              className="w-auto max-w-xs px-3 py-2 text-sm"
              side="left"
              align="start"
            >
              <p className="wrap-break-words">{user?.name || user?.email}</p>
            </HoverCardContent>
          </HoverCard>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem render={<Link href="/" />}>
          Home
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          render={<Link href={getDefaultDashboardRoute(user.role)} />}
        >
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant={"destructive"} onClick={handleLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
