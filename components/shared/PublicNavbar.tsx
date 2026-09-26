import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ModeToggle } from "./ModeToggle";
import { getCookie } from "@/app/services/auth/tokenHeaders";
import ProfileMenu from "./ProfileMenu";

const PublicNavbar = async () => {
  const accessToken = await getCookie("accessToken");

  const navItems = [
    { href: "/blogs", label: "All Blogs" },
    // { href: "/health-plans", label: "Health Plans" },
    // { href: "/medicine", label: "Medicine" },
  ];

  const loginItems = [
    { href: "/register", label: "Register" },
    { href: "/login", label: "Login" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur dark:bg-background/95 px-2">
      <div className="max-w-3xl mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/favicon.ico" width={32} height={32} alt="logo"></Image>
          <span className="text-xl font-bold text-primary">Open Notes</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((link) => (
            <Link key={link.label} href={link.href} prefetch={true}>
              <Button>{link.label}</Button>
            </Link>
          ))}
        </nav>

        {/* <div className="hidden md:flex items-center space-x-2">
          <AISearchDialog />
          <NavbarAuthButtons
            initialHasToken={!!accessToken}
            initialUserInfo={userInfo}
            initialDashboardRoute={dashboardRoute}
          />
        </div> */}

        <div className="flex justify-center items-center gap-2">
          <ModeToggle></ModeToggle>
          {accessToken ? (
            <ProfileMenu />
          ) : (
            loginItems.map((link) => (
              <Button key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))
          )}

          {/* {accessToken ? (
            <LogOut />
          ) : (
            loginItems.map((link) => (
              <Button key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))
          )} */}

          {/* {loginItems.map((link) => (
            <Link key={link.label} href={link.href} prefetch={true}>
              <Button>{link.label}</Button>
            </Link>
          ))} */}
        </div>

        {/* Mobile Menu */}
        {/* <MobileMenu
          navItems={navItems}
          hasAccessToken={!!accessToken}
          userInfo={userInfo}
          dashboardRoute={dashboardRoute}
        /> */}
      </div>
    </header>
  );
};

export default PublicNavbar;
