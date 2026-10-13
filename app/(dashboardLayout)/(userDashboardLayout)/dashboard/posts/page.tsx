import { AllPosts } from "@/components/Dashboard/User/AllPosts";

type MyPostPageProps = {
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

export default async function MyPostPage({ searchParams }: MyPostPageProps) {
  const params = await searchParams;

  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;

  const parsedPage = Number(rawPage);

  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  return (
    <main className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold">My Posts</h1>

      <AllPosts page={page} />
    </main>
  );
}
