"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type BlogPaginationProps = {
  page: number;
  limit: number;
  total: number;
  shownCount: number;
};

function getPageNumbers(page: number, totalPages: number) {
  const numbers = new Set<number>([1, totalPages, page - 1, page, page + 1]);

  return [...numbers]
    .filter((number) => number >= 1 && number <= totalPages)
    .sort((a, b) => a - b);
}

export default function BlogPagination({
  page,
  limit,
  total,
  shownCount,
}: BlogPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageNumbers = getPageNumbers(page, totalPages);

  const start = shownCount === 0 ? 0 : (page - 1) * limit + 1;
  const end =
    shownCount === 0 ? 0 : Math.min((page - 1) * limit + shownCount, total);

  const navigate = (nextPage: number, nextLimit = limit) => {
    // Preserve any other URL query parameters.
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(nextPage));
    params.set("limit", String(nextLimit));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    });
  };

  return (
    <div className="mt-8 space-y-4 border-dashed border-t pt-5" aria-busy={isPending}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Showing {start}–{end} of {total} posts
        </p>

        <div className="flex items-center gap-2">
          <label htmlFor="posts-per-page" className="text-sm">
            Posts per page
          </label>

          <select
            id="posts-per-page"
            value={limit}
            disabled={isPending}
            onChange={(event) => {
              // Reset to page 1 when changing the page size.
              navigate(1, Number(event.target.value));
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
          >
            {[6, 9, 12, 24].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <nav
        aria-label="Blog pagination"
        className="flex flex-wrap items-center justify-center gap-2"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page === 1 || isPending}
          onClick={() => navigate(1)}
        >
          First
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page === 1 || isPending}
          onClick={() => navigate(page - 1)}
        >
          Previous
        </Button>

        {pageNumbers.map((number, index) => {
          const previous = pageNumbers[index - 1];
          const showEllipsis = index > 0 && number - previous > 1;

          return (
            <div key={number} className="flex items-center gap-2">
              {showEllipsis && (
                <span className="px-1" aria-hidden="true">
                  …
                </span>
              )}

              <Button
                type="button"
                variant={number === page ? "default" : "outline"}
                size="sm"
                aria-label={`Go to page ${number}`}
                aria-current={number === page ? "page" : undefined}
                disabled={number === page || isPending}
                onClick={() => navigate(number)}
              >
                {number}
              </Button>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages || isPending}
          onClick={() => navigate(page + 1)}
        >
          Next
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages || isPending}
          onClick={() => navigate(totalPages)}
        >
          Last
        </Button>
      </nav>

      <p
        role="status"
        aria-live="polite"
        className="text-center text-sm text-muted-foreground"
      >
        {isPending ? "Loading posts..." : `Page ${page} of ${totalPages}`}
      </p>
    </div>
  );
}
