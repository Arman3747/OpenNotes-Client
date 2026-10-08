import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser } from "@/lib/getCurrentUser";
import EditPostForm from "@/components/Dashboard/User/EditPostForm";
import {
  editablePostSchema,
  categorySchema,
} from "@/lib/editPost";

type EditPostPageProps = {
  params: Promise<{ editId: string }>;
};

export default async function EditPostPage({
  params,
}: EditPostPageProps) {
  const { editId } = await params;

  if (!z.uuid().safeParse(editId).success) {
    notFound();
  }

  const editPath = `/dashboard/edit/${editId}`;
  const loginPath = `/login?redirect=${encodeURIComponent(editPath)}`;

  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!user || !accessToken) {
    redirect(loginPath);
  }

  const headers = {
    Accept: "application/json",
    Cookie: `accessToken=${encodeURIComponent(accessToken)}`,
  };

  const postResponse = await fetch(
    `http://localhost:5000/api/v1/post/${encodeURIComponent(editId)}`,
    {
      headers,
      cache: "no-store",
    },
  );

  if (postResponse.status === 401) {
    redirect(loginPath);
  }

  if (postResponse.status === 404) {
    notFound();
  }

  if (postResponse.status === 403) {
    return (
      <p className="p-6 text-destructive">
        You do not have permission to edit this post.
      </p>
    );
  }

  if (!postResponse.ok) {
    throw new Error("Could not load the post.");
  }

  const rawPost: unknown = await postResponse.json();

  const postResult = z
    .object({
      success: z.literal(true),
      data: editablePostSchema,
    })
    .safeParse(rawPost);

  if (!postResult.success) {
    throw new Error("The server returned invalid post data.");
  }

  const post = postResult.data.data;

  if (post.id !== editId) {
    throw new Error("The returned post does not match the requested ID.");
  }

  // This is the user's own-post editor.
  // The backend must independently enforce ownership on PATCH.
  if (post.authorId !== user.id) {
    return (
      <p className="p-6 text-destructive">
        You can only edit your own posts.
      </p>
    );
  }

  // Change this endpoint if your categories route differs.
  const categoriesResponse = await fetch(
    "http://localhost:5000/api/v1/categories",
    {
      headers,
      cache: "no-store",
    },
  );

  if (categoriesResponse.status === 401) {
    redirect(loginPath);
  }

  if (!categoriesResponse.ok) {
    throw new Error("Could not load categories.");
  }

  const rawCategories: unknown = await categoriesResponse.json();

  const categoriesResult = z
    .object({
      success: z.literal(true),
      data: z.array(categorySchema),
    })
    .safeParse(rawCategories);

  if (!categoriesResult.success) {
    throw new Error("The server returned invalid categories.");
  }

  const categories = categoriesResult.data.data;

  // Keep the existing selection visible if it is absent from this list.
  const categoryOptions = categories.some(
    (category) => category.id === post.categoryId,
  )
    ? categories
    : [post.category, ...categories];

  return (
    <main className="p-4 md:p-6">
      <EditPostForm
        key={post.id}
        post={post}
        categories={categoryOptions}
      />
    </main>
  );
}