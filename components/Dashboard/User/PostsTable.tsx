"use client";

import Image from "next/image";
import Link from "next/link";
import { MoreHorizontalIcon } from "lucide-react";

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

type Post = {
  id: string;
  title: string;
  coverImage: string | null;
};

type PostsTableProps = {
  posts: Post[];
};

export default function PostsTable({ posts }: PostsTableProps) {
  return (
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
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                      >
                        <MoreHorizontalIcon />
                        <span className="sr-only">
                          Actions for {post.title}
                        </span>
                      </Button>
                    }
                  />

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      render={<Link href={`/blogs/${post.id}`} />}
                    >
                      View
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      render={
                        <Link href={`/dashboard/posts/${post.id}/edit`} />
                      }
                    >
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Enable after connecting your delete action. */}
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
  );
}
