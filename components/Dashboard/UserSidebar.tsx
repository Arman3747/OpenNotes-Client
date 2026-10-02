"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bookmark,
  BookOpen,
  FilePenLine,
  FileText,
  KeyRound,
  LayoutDashboard,
  MessageSquare,
  Settings,
  SquarePen,
  UserRound,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

const groups = [
  {
    label: "Workspace",
    items: [
      {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "My Posts",
        href: "/dashboard/posts",
        icon: FileText,
      },
      {
        title: "Create Post",
        href: "/dashboard/posts/create",
        icon: SquarePen,
      },
      {
        title: "Drafts",
        href: "/dashboard/posts/drafts",
        icon: FilePenLine,
      },
      {
        title: "Bookmarks",
        href: "/dashboard/bookmarks",
        icon: Bookmark,
      },
      {
        title: "My Comments",
        href: "/dashboard/comments",
        icon: MessageSquare,
      },
      {
        title: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "My Profile",
        href: "/myProfile",
        icon: UserRound,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
      {
        title: "Change Password",
        href: "/change-password",
        icon: KeyRound,
      },
    ],
  },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  // Select the most specific matching link.
  // This prevents My Posts and Create Post being active together.
  const activeHref = groups
    .flatMap((group) => group.items)
    .filter(
      (item) =>
        pathname === item.href ||
        (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const closeMobileSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Open Notes"
              render={<Link href="/blogs" />}
              onClick={closeMobileSidebar}
            >
              <BookOpen />
              <span className="font-semibold">Open Notes</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = activeHref === item.href;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        render={
                          <Link
                            href={item.href}
                            aria-current={isActive ? "page" : undefined}
                          />
                        }
                        onClick={closeMobileSidebar}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
