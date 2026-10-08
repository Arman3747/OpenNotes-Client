"use server";

export const getAllBlogs = async (page = 1, limit = 9) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not configured.");
  }

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const res = await fetch(
    `${baseUrl.replace(/\/$/, "")}/post?${query.toString()}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch blogs: ${res.status}`);
  }

  const result = await res.json();

  if (result.success === false) {
    throw new Error(result.message || "Failed to fetch blogs.");
  }

  // Change these mappings if your API returns a different structure.
  const posts = result.data?.posts;
  const total = result.data?.pagination?.total;

  if (!Array.isArray(posts) || !Number.isSafeInteger(total) || total < 0) {
    throw new Error(
      "Unexpected blog response. Expected data.posts and data.meta.total.",
    );
  }

  return {
    posts,
    total: total as number,
  };
};
