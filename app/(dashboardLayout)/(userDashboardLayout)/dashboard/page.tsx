import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  FileText,
  PenSquare,
  Plus,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { getCurrentUser } from "@/lib/getCurrentUser";
import { getAllUsersPosts } from "@/app/services/dashboard/userDashboard/getAllUsersPosts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const quickLinks = [
  {
    title: "Create post",
    description: "Write and share something new.",
    href: "/dashboard/create",
    icon: Plus,
  },
  {
    title: "My posts",
    description: "View and manage your articles.",
    href: "/dashboard/posts",
    icon: FileText,
  },
  {
    title: "My profile",
    description: "Update your photo and personal details.",
    href: "/dashboard/myProfile",
    icon: UserRound,
  },
];

export default async function UserDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=%2Fdashboard");
  }

  const result = await getAllUsersPosts({
    authorId: user.id,
    page: 1,
    limit: 5,
  });

  const { posts, pagination } = result.data;

  const displayName = user.name?.trim() || user.email;

  const roleLabel = user.role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      {/* Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-muted-foreground">Dashboard overview</p>

          <h1 className="wrap-break-words text-2xl font-bold tracking-tight md:text-3xl">
            Welcome back, {displayName}
          </h1>

          <p className="wrap-break-words text-sm text-muted-foreground">
            {user.email}
          </p>
        </div>

        <Link
          href="/dashboard/posts/create"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="size-4" aria-hidden="true" />
          Create post
        </Link>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total posts</CardTitle>

            <FileText
              className="size-5 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>

          <CardContent className="space-y-1">
            <p className="text-3xl font-bold">
              {pagination.total.toLocaleString("en-AU")}
            </p>

            <p className="text-sm text-muted-foreground">
              Posts in your collection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Account role</CardTitle>

            <ShieldCheck
              className="size-5 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>

          <CardContent className="space-y-1">
            <p className="text-3xl font-bold">{roleLabel}</p>

            <p className="text-sm text-muted-foreground">
              Your current access role
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <section aria-labelledby="quick-links-heading">
        <h2 id="quick-links-heading" className="mb-3 text-lg font-semibold">
          Quick links
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full transition-colors group-hover:bg-muted/50">
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>

                      <ArrowRight
                        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </div>

                    <CardTitle className="text-base">{item.title}</CardTitle>

                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Posts preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Your posts</CardTitle>

            <Link
              href="/dashboard/posts"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <CardDescription>
            Open an article or continue editing.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {posts.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-10 text-center">
              <FileText
                className="mx-auto mb-3 size-8 text-muted-foreground"
                aria-hidden="true"
              />

              <p className="font-medium">No posts yet</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Start by writing your first article.
              </p>

              <Link
                href="/dashboard/posts/create"
                className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4"
              >
                Create your first post
              </Link>
            </div>
          ) : (
            <ul className="divide-y">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0 rounded-lg bg-muted p-2">
                      <FileText
                        className="size-5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>

                    <p className="wrap-break-words text-sm font-medium">
                      {post.title}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    {post.slug && (
                      <Link
                        href={`/blogSlugs/${encodeURIComponent(post.slug)}`}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                        aria-label={`View ${post.title}`}
                      >
                        View
                      </Link>
                    )}

                    <Link
                      href={`/dashboard/edit/${post.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      aria-label={`Edit ${post.title}`}
                    >
                      <PenSquare className="size-4" aria-hidden="true" />
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
