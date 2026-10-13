import { notFound, redirect } from "next/navigation";

import { getBlogBySlug } from "@/app/services/public/allBlog.service";
import { getPostComments } from "@/app/services/public/getPostComments";
import { getCurrentUser } from "@/lib/getCurrentUser";

import BlogDetailsCard from "@/components/shared/BlogDetailsCard";
import BlogComments from "@/components/shared/BlogComments";

type BlogSlugDetailsPageProps = {
  params: Promise<{ slugId: string }>;

  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

export default async function BlogSlugDetailsPage({
  params,
  searchParams,
}: BlogSlugDetailsPageProps) {
  const { slugId } = await params;
  const query = await searchParams;

  const rawPage = Array.isArray(query.commentsPage)
    ? query.commentsPage[0]
    : query.commentsPage;

  const parsedPage = Number(rawPage);

  const commentsPage =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const singleBlog = await getBlogBySlug(slugId);
  const blog = singleBlog?.data;

  if (!blog?.id) {
    notFound();
  }

  // Always use this blog's real ID, not a hard-coded example ID.
  const [commentsData, user] = await Promise.all([
    getPostComments(blog.id, commentsPage),
    getCurrentUser(),
  ]);

  const lastPage = Math.max(1, commentsData.pagination.totalPages);

  if (commentsPage > lastPage) {
    const correctedQuery = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          correctedQuery.append(key, item);
        }
      } else if (value !== undefined) {
        correctedQuery.set(key, value);
      }
    }

    correctedQuery.set("commentsPage", String(lastPage));

    redirect(
      `/blogSlugs/${encodeURIComponent(slugId)}?${correctedQuery.toString()}#comments`,
    );
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <BlogDetailsCard blog={blog} />

        <BlogComments
          key={blog.id}
          postId={blog.id}
          canComment={!!user}
          data={commentsData}
        />
      </div>
    </main>
  );
}
// // {JSON.stringify(blog)}
