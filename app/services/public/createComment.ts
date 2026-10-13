"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createCommentSchema = z.object({
  postId: z.uuid("Invalid post ID"),
  content: z
    .string()
    .trim()
    .min(1, "Please write a comment")
    .max(2000, "Comment must be at most 2,000 characters"),
});

type CreateCommentResult =
  | { success: true }
  | { success: false; message: string };

export async function createComment(
  input: unknown,
): Promise<CreateCommentResult> {
  const validation = createCommentSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid comment.",
    };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "Please log in to add a comment.",
    };
  }

  const { postId, content } = validation.data;

  try {
    const response = await fetch(
      `http://localhost:5000/api/v1/posts/${encodeURIComponent(postId)}/comments`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Cookie: `accessToken=${encodeURIComponent(accessToken)}`,
        },
        body: JSON.stringify({ content }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        success: false,
        message:
          response.status === 401
            ? "Your session expired. Please log in again."
            : response.status === 403
              ? "You cannot comment on this post."
              : response.status === 404
                ? "This post is no longer available."
                : response.status === 429
                  ? "Too many requests. Please try again later."
                  : "Could not add your comment. Please check your input.",
      };
    }

    if (response.status !== 204) {
      const result: unknown = await response.json().catch(() => null);

      const confirmation = z
        .object({ success: z.literal(true) })
        .safeParse(result);

      if (!confirmation.success) {
        return {
          success: false,
          message:
            "Could not confirm whether your comment was saved. Check the comments before retrying.",
        };
      }
    }
  } catch {
    return {
      success: false,
      message:
        "Could not confirm whether your comment was saved. Check the comments before retrying.",
    };
  }

  revalidatePath("/blogSlugs/[slugId]", "page");

  return { success: true };
}
