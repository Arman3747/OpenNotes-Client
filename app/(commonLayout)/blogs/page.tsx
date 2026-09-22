/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAllBlogs } from "@/app/services/public/allBlog.service";
import BlogCard from "@/components/shared/BlogCard";

const AllBlogsPage = async () => {
  const allBlogs = await getAllBlogs();

  return (
    <main className="min-h-screen">
      <section>
        <div className="max-w-3xl m-2 mx-auto">
          <h3 className="text-3xl my-4">Latest</h3>
          <div className="grid grid-cols-3 gap-4 space-y-4 *:h-full">
            {allBlogs?.data?.posts.map((blog: any) => (
              <BlogCard key={blog?.id} blog={blog}></BlogCard>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AllBlogsPage;
