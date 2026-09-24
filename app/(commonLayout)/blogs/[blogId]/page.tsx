import { getBlogById } from "@/app/services/public/allBlog.service";
import BlogDetailsCard from "@/components/shared/BlogDetailsCard";

const BlogDetailsPage = async ({
  params,
}: {
  params: Promise<{ blogId: number }>;
}) => {
  const { blogId } = await params;

  const singleBlog = await getBlogById(blogId);
  const blog = singleBlog?.data;
  // console.log(blog);

  return (
    <main className="min-h-screen">
      <section>
        <div className="max-w-3xl m-2 mx-auto">
          <BlogDetailsCard blog={blog}></BlogDetailsCard>
        </div>
      </section>
    </main>
  );
};

export default BlogDetailsPage;
// {JSON.stringify(blog)}
