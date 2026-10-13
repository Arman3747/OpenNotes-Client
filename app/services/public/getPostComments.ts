import "server-only";

import { z } from "zod";

const commentsResponseSchema = z.object({
  success: z.literal(true),

  data: z.object({
    comments: z.array(
      z.object({
        id: z.string(),
        content: z.string(),
        likesCount: z.number(),
        isEdited: z.boolean(),
        postId: z.string(),
        createdAt: z.string(),
        author: z.object({
          id: z.string(),
          name: z.string().nullable(),
          username: z.string().nullable(),
          profilePhoto: z.string().nullable(),
        }),
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

export type PostCommentsData = z.infer<typeof commentsResponseSchema>["data"];

export async function getPostComments(
  postId: string,
  page = 1,
): Promise<PostCommentsData> {
  const url = new URL(
    `http://localhost:5000/api/v1/posts/${encodeURIComponent(postId)}/comments`,
  );

  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", "10");

  // Public read: no login cookie required.
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load comments.");
  }

  const result: unknown = await response.json();
  const validation = commentsResponseSchema.safeParse(result);

  if (!validation.success) {
    throw new Error("The server returned invalid comments data.");
  }

  return validation.data.data;
}
