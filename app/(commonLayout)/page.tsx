/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import { getAllBlogs } from "../services/public/allBlog.service";
import BlogCard from "@/components/shared/BlogCard";

export default async function Home() {
  const allBlogs = await getAllBlogs();
  // const singlePost = allBlogs?.data?.posts[1];
  // console.log(singlePost);

  return (
    <main className="min-h-screen">
      <section className="border-b">
        <div className="max-w-3xl mx-auto flex justify-between items-center gap-2 my-8">
          <div className="flex flex-col justify-start items-start">
            <h3 className="text-5xl my-2">Open Notes</h3>
            <p>
              Open Totes is a vibrant blog offering fresh perspectives, engaging
              stories, and insightful lifestyle ideas.
            </p>
          </div>
          <div>
            <Image
              src="/Hero_image.png"
              width={512}
              height={512}
              alt="logo"
            ></Image>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-3xl m-2 mx-auto">
          <h3 className="text-3xl my-4">Latest</h3>

          <div className="grid grid-cols-3 gap-4 space-y-4 *:h-full">
            {allBlogs?.data?.posts.slice(0, 6).map((blog: any) => (
              <BlogCard key={blog?.id} blog={blog}></BlogCard>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
