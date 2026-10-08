import { getBlogBySlug } from "@/app/services/public/allBlog.service";
import BlogDetailsCard from "@/components/shared/BlogDetailsCard";

const BlogSlugDetailsPage = async ({
  params,
}: {
  params: Promise<{ slugId: string }>;
}) => {
  const { slugId } = await params;

  const singleBlog = await getBlogBySlug(slugId);
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

export default BlogSlugDetailsPage;
// {JSON.stringify(blog)}
