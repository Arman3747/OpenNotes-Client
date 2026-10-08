// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { getAllBlogs } from "@/app/services/public/allBlog.service";
// import BlogCard from "@/components/shared/BlogCard";

// const AllBlogsSlugsPage = async () => {
//   const allBlogs = await getAllBlogs();

//   return (
//     <main className="min-h-screen">
//       <section>
//         <div className="max-w-3xl m-2 mx-auto">
//           <h3 className="text-3xl my-4">Latest</h3>
//           <div className="grid grid-cols-3 gap-4 space-y-4 *:h-full">
//             {allBlogs?.data?.posts.map((blog: any) => (
//               <BlogCard key={blog?.id} blog={blog}></BlogCard>
//             ))}
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// };

// export default AllBlogsSlugsPage;

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Suspense } from "react";
import { redirect } from "next/navigation";
// import { getAllBlogs } from "@/app/services/public/allBlog.service";
import BlogCard from "@/components/shared/BlogCard";
import BlogPagination from "@/components/shared/BlogPagination";
import { getAllBlogs } from "@/app/services/public/allBlogs";

type QueryParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AllBlogsSlugsPage({
  searchParams,
}: {
  searchParams: Promise<QueryParams>;
}) {
  const query = await searchParams;

  const pageValue = firstValue(query.page);
  const limitValue = firstValue(query.limit);

  const requestedPage = Number(pageValue ?? "1");
  const requestedLimit = Number(limitValue ?? "9");

  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const limit = [6, 9, 12, 24].includes(requestedLimit) ? requestedLimit : 9;

  // Preserve unrelated query parameters when correcting the URL.
  const buildUrl = (nextPage: number) => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else if (value !== undefined) {
        params.set(key, value);
      }
    }

    params.set("page", String(nextPage));
    params.set("limit", String(limit));

    return `/blogSlugs?${params.toString()}`;
  };

  // Normalize invalid values before calling the backend.
  if (
    (pageValue !== undefined && pageValue !== String(page)) ||
    (limitValue !== undefined && limitValue !== String(limit))
  ) {
    redirect(buildUrl(page));
  }

  const { posts, total } = await getAllBlogs(page, limit);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // For example, redirect page 100 to page 5 when only 5 pages exist.
  if (page > totalPages) {
    redirect(buildUrl(totalPages));
  }

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-5xl px-4 py-6">
        {/* <h1 className="mb-6 text-3xl font-semibold">Latest</h1> */}

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 *:h-full">
            {posts.map((blog: any) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            No blog posts found.
          </p>
        )}

        <Suspense
          fallback={<p className="mt-8 text-center">Loading pagination...</p>}
        >
          <BlogPagination
            page={page}
            limit={limit}
            total={total}
            shownCount={posts.length}
          />
        </Suspense>
      </section>
    </main>
  );
}
