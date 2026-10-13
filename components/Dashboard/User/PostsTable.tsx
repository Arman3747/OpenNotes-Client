"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Type-only imports do not import the server-side fetch function.
import type {
  UserPost,
  PostsPagination,
} from "@/app/services/dashboard/userDashboard/getAllUsersPosts";

type PostsTableProps = {
  posts: UserPost[];
  pagination: PostsPagination;
};

type PageItem = number | "ellipsis-left" | "ellipsis-right";

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-right", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-left",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis-left",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-right",
    totalPages,
  ];
}

export default function PostsTable({ posts, pagination }: PostsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentPage = pagination.page;
  const totalPages = Math.max(1, pagination.totalPages);

  const firstPost =
    posts.length === 0 ? 0 : (currentPage - 1) * pagination.limit + 1;

  const lastPost =
    posts.length === 0
      ? 0
      : Math.min(firstPost + posts.length - 1, pagination.total);

  const pageItems = getPageItems(currentPage, totalPages);

  function goToPage(nextPage: number) {
    if (
      isPending ||
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === currentPage
    ) {
      return;
    }

    // Preserve any other URL query parameters.
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    });
  }

  return (
    <div className="space-y-4" aria-busy={isPending}>
      <div
        className={`overflow-hidden rounded-md border ${
          isPending ? "opacity-60" : ""
        }`}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  No posts found.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="relative h-14 w-24 overflow-hidden rounded-md bg-muted">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-normal font-medium">
                    {post.title}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        disabled={isPending}
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          />
                        }
                      >
                        <MoreHorizontalIcon />
                        <span className="sr-only">
                          Actions for {post.title}
                        </span>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        {post.slug ? (
                          <DropdownMenuItem
                            render={
                              <Link
                                href={`/blogSlugs/${encodeURIComponent(
                                  post.slug,
                                )}`}
                              />
                            }
                          >
                            View
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>View</DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          render={<Link href={`/dashboard/edit/${post.id}`} />}
                        >
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem variant="destructive" disabled>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <p role="status" className="text-sm text-muted-foreground">
          {isPending
            ? "Loading posts..."
            : `Showing ${firstPost}–${lastPost} of ${pagination.total} posts`}
        </p>

        {totalPages > 1 && (
          <nav
            aria-label="Posts pagination"
            className="flex flex-wrap items-center gap-1"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending || currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>

            {pageItems.map((item) =>
              typeof item === "number" ? (
                <Button
                  key={item}
                  type="button"
                  variant={item === currentPage ? "default" : "outline"}
                  size="icon"
                  className="size-8"
                  aria-label={`Page ${item}`}
                  aria-current={item === currentPage ? "page" : undefined}
                  disabled={isPending || item === currentPage}
                  onClick={() => goToPage(item)}
                >
                  {item}
                </Button>
              ) : (
                <span
                  key={item}
                  aria-hidden="true"
                  className="px-2 text-muted-foreground"
                >
                  …
                </span>
              ),
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending || currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </nav>
        )}
      </div>
    </div>
  );
}
