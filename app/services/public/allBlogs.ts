"use server";

export const getAllBlogs = async (page = 1, limit = 9) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API?.trim();

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not configured.");
  }

  if (!Number.isSafeInteger(page) || page < 1) {
    throw new Error("Page must be a positive integer.");
  }

  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new Error("Limit must be a positive integer.");
  }

  const url = new URL(`${baseUrl.replace(/\/+$/, "")}/post`);

  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blogs: ${response.status}`);
  }

  const result = await response.json();

  if (result?.success !== true) {
    throw new Error("Failed to fetch blogs.");
  }

  const posts = result.data?.posts;
  const total = result.data?.pagination?.total;

  if (
    !Array.isArray(posts) ||
    typeof total !== "number" ||
    !Number.isSafeInteger(total) ||
    total < 0
  ) {
    throw new Error(
      "Unexpected blog response. Expected data.posts and data.pagination.total.",
    );
  }

  return {
    posts,
    total,
  };
};
