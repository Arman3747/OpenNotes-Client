import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const postsResponseSchema = z.object({
  success: z.literal(true),

  data: z.object({
    posts: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string().nullable(),
        coverImage: z.string().nullable(),
      }),
    ),

    pagination: z.object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(0),
    }),
  }),
});

export type UserPostsResponse = z.infer<typeof postsResponseSchema>;

export type UserPost = UserPostsResponse["data"]["posts"][number];

export type PostsPagination = UserPostsResponse["data"]["pagination"];

type GetAllUsersPostsOptions = {
  authorId: string;
  page?: number;
  limit?: number;
};

export async function getAllUsersPosts({
  authorId,
  page = 1,
  limit = 10,
}: GetAllUsersPostsOptions): Promise<UserPostsResponse> {
  if (!authorId) {
    throw new Error("Author ID is required.");
  }

  if (!Number.isSafeInteger(page) || page < 1) {
    throw new Error("Invalid page number.");
  }

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("Invalid page size.");
  }

  const destination = `/dashboard/posts?page=${page}`;
  const loginPath = `/login?redirect=${encodeURIComponent(destination)}`;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    redirect(loginPath);
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
    redirect(loginPath);
  }

  if (response.status === 403) {
    throw new Error("You do not have permission to view these posts.");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch posts.");
  }

  const result: unknown = await response.json();
  const validation = postsResponseSchema.safeParse(result);

  if (!validation.success) {
    throw new Error("The server returned an invalid posts response.");
  }

  return validation.data;
}
