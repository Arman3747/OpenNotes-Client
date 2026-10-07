"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
// import type { JSONContent } from "@tiptap/core";

const tiptapNodeSchema = z.object({
  type: z.string().min(1),

  attrs: z.record(z.string(), z.json()).optional(),

  text: z.string().optional(),

  marks: z
    .array(
      z.object({
        type: z.string().min(1),
        attrs: z.record(z.string(), z.json()).optional(),
      }),
    )
    .optional(),

  get content() {
    return z.array(tiptapNodeSchema).optional();
  },
});

type TextNode = {
  text?: string;
  content?: TextNode[];
};

function hasText(node: TextNode): boolean {
  return Boolean(node.text?.trim()) || Boolean(node.content?.some(hasText));
}

const tiptapDocumentSchema = z
  .object({
    type: z.literal("doc"),
    content: z.array(tiptapNodeSchema).min(1, "Content is required"),
  })
  .refine(hasText, {
    message: "Please write some content.",
  })
  .refine((document) => JSON.stringify(document).length <= 100_000, {
    message: "Content is too large.",
  });

const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Use no more than 200 characters"),

  content: tiptapDocumentSchema,

  categoryId: z.uuid("Please select a valid category"),

  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Tags cannot be empty")
        .max(30, "Each tag must be 30 characters or fewer")
        .transform((tag) => tag.toLowerCase()),
    )
    .max(10, "Use no more than 10 tags")
    .default([])
    .transform((tags) => [...new Set(tags)]),

  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),

  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
});

// type CreatePostInput = {
//   title: string;
//   content: JSONContent;
//   categoryId: string;
//   tags: string[];
//   status: "DRAFT" | "PUBLISHED";
//   visibility: "PUBLIC" | "PRIVATE";
// };

type CreatePostFailure = {
  success: false;
  message: string;
};

// Assumes the API uses your existing { success: true, ... } format.
const apiSuccessSchema = z.object({
  success: z.literal(true),
});

// export async function createPost(
//   input: CreatePostInput,
// ): Promise<CreatePostFailure> {
//   console.log("Server attrs type:", typeof input.content?.content?.[0]?.attrs);
//   console.log("Server attrs:", input.content?.content?.[0]?.attrs);

//   const validation = createPostSchema.safeParse(input);

//   if (!validation.success) {
//     const issue = validation.error.issues[0];
//     const field = issue?.path.join(".");

//     return {
//       success: false,
//       message: issue
//         ? `${field ? `${field}: ` : ""}${issue.message}`
//         : "Invalid post",
//     };
//   }

//   const cookieStore = await cookies();
//   const accessToken = cookieStore.get("accessToken")?.value;

//   if (!accessToken) {
//     return {
//       success: false,
//       message: "Please log in to create a post.",
//     };
//   }

//   let response: Response;

//   try {
//     response = await fetch("http://localhost:5000/api/v1/post", {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//         Cookie: `accessToken=${encodeURIComponent(accessToken)}`,
//       },
//       // body: JSON.stringify({
//       //   ...validation.data,
//       // }),
//       body: JSON.stringify(validation.data),
//       cache: "no-store",
//     });
//   } catch {
//     return {
//       success: false,
//       message:
//         "Could not confirm whether your post was saved. Check My Posts before retrying.",
//     };
//   }

//   if (!response.ok) {
//     if (response.status === 401) {
//       return {
//         success: false,
//         message: "Your session has expired. Please log in again.",
//       };
//     }

//     if (response.status === 403) {
//       return {
//         success: false,
//         message: "You do not have permission to create a post.",
//       };
//     }

//     if (response.status === 400 || response.status === 422) {
//       return {
//         success: false,
//         message:
//           "The backend rejected the post data. Check its create-post validation and required fields.",
//       };
//     }

//     return {
//       success: false,
//       message: "Could not create your post. Please try again.",
//     };
//   }

//   const result: unknown = await response.json().catch(() => null);

//   if (!apiSuccessSchema.safeParse(result).success) {
//     return {
//       success: false,
//       message:
//         "The server returned an unexpected response. Check My Posts before retrying.",
//     };
//   }

//   revalidatePath("/dashboard/posts");

//   redirect("/dashboard/posts");
// }

export async function createPost(
  formData: FormData,
): Promise<CreatePostFailure> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "Please log in to create a post.",
    };
  }

  const rawData = formData.get("data");

  if (typeof rawData !== "string") {
    return {
      success: false,
      message: "Post data is missing.",
    };
  }

  let input: unknown;

  try {
    input = JSON.parse(rawData);
  } catch {
    return {
      success: false,
      message: "Invalid post data.",
    };
  }

  const validation = createPostSchema.safeParse(input);

  if (!validation.success) {
    const issue = validation.error.issues[0];

    return {
      success: false,
      message: issue
        ? `${issue.path.join(".")}: ${issue.message}`
        : "Invalid post data.",
    };
  }

  const image = formData.get("file");

  if (image !== null) {
    if (!(image instanceof File)) {
      return {
        success: false,
        message: "Invalid image upload.",
      };
    }

    const allowedTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(image.type)) {
      return {
        success: false,
        message: "Please select a JPG, JPEG, PNG, or WebP image.",
      };
    }

    if (image.size === 0 || image.size > 2 * 1024 * 1024) {
      return {
        success: false,
        message: "Image must not be empty or exceed 2 MB.",
      };
    }
  }

  // Forward only validated post fields and the selected image.
  const backendFormData = new FormData();

  backendFormData.append("data", JSON.stringify(validation.data));

  if (image instanceof File) {
    backendFormData.append("file", image, image.name);
  }

  let response: Response;

  try {
    response = await fetch("http://localhost:5000/api/v1/post", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Cookie: `accessToken=${encodeURIComponent(accessToken)}`,
      },
      body: backendFormData,
      cache: "no-store",
    });
  } catch {
    return {
      success: false,
      message:
        "Could not confirm whether your post was saved. Check My Posts before retrying.",
    };
  }

  if (!response.ok) {
    return {
      success: false,
      message:
        response.status === 401
          ? "Your session has expired. Please log in again."
          : response.status === 403
            ? "You do not have permission to create this post."
            : "The backend could not create your post.",
    };
  }

  const result: unknown = await response.json().catch(() => null);

  if (!apiSuccessSchema.safeParse(result).success) {
    return {
      success: false,
      message: "Unexpected server response. Check My Posts before retrying.",
    };
  }

  revalidatePath("/dashboard/posts");
  redirect("/dashboard/posts");
}
