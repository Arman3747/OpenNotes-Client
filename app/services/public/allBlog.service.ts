"use server";

export const getAllBlogs = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/post`);
  return await res.json();
};

// export const getBlogById = async (blogId: number) => {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/post/${blogId}`);
//   return await res.json();
// };

export const getBlogBySlug = async (blogSlug: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API}/post/slug/${blogSlug}`,
  );
  return await res.json();
};
