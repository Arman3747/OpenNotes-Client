import "server-only";

import { cookies } from "next/headers";

type GetAllUsersPostsOptions = {
  authorId: string;
  page?: number;
  limit?: number;
};

export const getAllUsersPosts = async ({
  authorId,
  page = 1,
  limit = 10,
}: GetAllUsersPostsOptions) => {
  if (!authorId) {
    throw new Error("Author ID is required");
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    throw new Error("Please log in to view your posts");
  }

  const url = new URL("http://localhost:5000/api/v1/post");

  url.searchParams.set("authorId", authorId);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: `accessToken=${encodeURIComponent(accessToken)}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    throw new Error("Your session has expired. Please log in again");
  }

  if (response.status === 403) {
    throw new Error("You do not have permission to view these posts");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  const result = await response.json();

  if (result.success !== true) {
    throw new Error("Failed to fetch posts");
  }

  return result;
};
