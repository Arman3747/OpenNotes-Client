import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { getCurrentUser } from "@/lib/getCurrentUser";

// const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

const fira_Code = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Open Notes",
  description:
    "Open Totes is a vibrant blog offering fresh perspectives, engaging stories, and insightful lifestyle ideas",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", fira_Code.className, "font-sans")}
    >
      <body>
        <AuthProvider user={user}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
