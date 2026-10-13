import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/getCurrentUser";
import { getAllUsersPosts } from "@/app/services/dashboard/userDashboard/getAllUsersPosts";
import PostsTable from "./PostsTable";

type AllPostsProps = {
  page: number;
};

export async function AllPosts({ page }: AllPostsProps) {
  const user = await getCurrentUser();

  if (!user) {
    const destination = `/dashboard/posts?page=${page}`;

    redirect(`/login?redirect=${encodeURIComponent(destination)}`);
  }

  const result = await getAllUsersPosts({
    authorId: user.id,
    page,
    limit: 10,
  });

  const { posts, pagination } = result.data;

  // An empty collection still displays page 1.
  const lastPage = Math.max(1, pagination.totalPages);

  // Handles URLs such as ?page=999 and pages emptied by deletion.
  if (page > lastPage) {
    redirect(`/dashboard/posts?page=${lastPage}`);
  }

  return <PostsTable posts={posts} pagination={pagination} />;
}
