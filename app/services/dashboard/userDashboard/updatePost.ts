"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { editPostSchema, validateImage } from "@/lib/editPost";

type UpdatePostResult = { success: true } | { success: false; message: string };

export async function updatePost(
  postId: string,
  formData: FormData,
): Promise<UpdatePostResult> {
  if (!z.uuid().safeParse(postId).success) {
    return { success: false, message: "Invalid post ID." };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "Please log in to edit your post.",
    };
  }

  const rawData = formData.get("data");

  if (typeof rawData !== "string") {
    return { success: false, message: "Post data is missing." };
  }

  // Check before parsing. Includes content and the other form fields.
  if (rawData.length > 200_000) {
    return { success: false, message: "Post data is too large." };
  }

  let input: unknown;

  try {
    input = JSON.parse(rawData);
  } catch {
    return { success: false, message: "Invalid post data." };
  }

  const validation = editPostSchema.safeParse(input);

  if (!validation.success) {
    const issue = validation.error.issues[0];

    return {
      success: false,
      message: issue
        ? `${issue.path.join(".") || "Post"}: ${issue.message}`
        : "Invalid post details.",
    };
  }

  const fileEntry = formData.get("file");

  if (fileEntry !== null && !(fileEntry instanceof File)) {
    return { success: false, message: "Invalid image upload." };
  }

  const image = fileEntry instanceof File ? fileEntry : undefined;
  const imageValidation = validateImage(image);

  if (imageValidation !== true) {
    return { success: false, message: imageValidation };
  }

  // Rebuild FormData with validated fields only.
  const backendFormData = new FormData();

  backendFormData.set("data", JSON.stringify(validation.data));

  if (image) {
    backendFormData.set("file", image, image.name);
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/v1/post/${encodeURIComponent(postId)}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${encodeURIComponent(accessToken)}`,
        },
        body: backendFormData,
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
              ? "You do not have permission to edit this post."
              : response.status === 404
                ? "This post no longer exists."
                : response.status === 413
                  ? "The uploaded image is too large."
                  : "Could not update your post. Check your details.",
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
            "Could not confirm the update. Check My Posts before retrying.",
        };
      }
    }
  } catch {
    return {
      success: false,
      message: "Could not confirm the update. Check My Posts before retrying.",
    };
  }

  revalidatePath("/dashboard/posts");
  revalidatePath(`/dashboard/edit/${postId}`);
  revalidatePath("/blogSlugs");

  // Invalidate individual blog pages, whether they use an ID or slug.
//   revalidatePath("/blogs/[blogId]", "page");

  return { success: true };
}
