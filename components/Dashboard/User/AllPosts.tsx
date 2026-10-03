import { getCurrentUser } from "@/lib/getCurrentUser";
import { redirect } from "next/navigation";
import { getAllUsersPosts } from "@/app/services/dashboard/userDashboard/getAllUsersPosts";
import PostsTable from "./PostsTable";


export async function AllPosts() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=%2Fdashboard%2Fposts");
  }

  const result = await getAllUsersPosts({
    authorId: user.id,
    page: 1,
    limit: 20,
  });

  return <PostsTable posts={result.data?.posts ?? []} />;
}
