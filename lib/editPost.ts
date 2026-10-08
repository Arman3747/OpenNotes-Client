import { z } from "zod";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_CONTENT_LENGTH = 100_000;

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

const documentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(tiptapNodeSchema),
});

function hasText(node: {
  text?: string;
  content?: { text?: string; content?: unknown[] }[];
}): boolean {
  if (node.text?.trim()) return true;

  return (node.content ?? []).some((child) =>
    hasText(child as Parameters<typeof hasText>[0]),
  );
}

export const editPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),

  content: documentSchema
    .refine(hasText, "Please write some content")
    .refine(
      (document) => JSON.stringify(document).length <= MAX_CONTENT_LENGTH,
      "Content is too large",
    ),

  categoryId: z.uuid("Please select a valid category"),

  tags: z
    .array(z.string().trim().min(1).max(30))
    .max(10, "Use no more than 10 tags"),

  status: z.enum(["DRAFT", "PUBLISHED"]),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
});

// Validate only the response fields needed by this editor.
// Other response fields are omitted from the parsed result.
export const editablePostSchema = z.object({
  id: z.uuid(),
  authorId: z.uuid(),
  title: z.string(),
  content: documentSchema,
  coverImage: z.string().nullable(),
  categoryId: z.uuid(),
  tags: z.array(z.string()),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  category: z.object({
    id: z.uuid(),
    categoriesName: z.string(),
  }),
});

export const categorySchema = z.object({
  id: z.uuid(),
  categoriesName: z.string(),
});

export type EditablePost = z.infer<typeof editablePostSchema>;
export type Category = z.infer<typeof categorySchema>;

export function validateImage(file?: File): true | string {
  if (!file) return true;

  if (!IMAGE_TYPES.includes(file.type)) {
    return "Please select a JPEG, PNG, or WebP image";
  }

  if (file.size === 0) {
    return "The selected image is empty";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image must be 5 MB or smaller";
  }

  return true;
}
