"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/getCurrentUser";

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

const nullableUrl = z
  .union([
    z.literal(""),
    z.url({
      protocol: /^https?$/,
      error: "Enter a full HTTP or HTTPS URL",
    }),
  ])
  .transform((value) => value || null);

const updateProfileSchema = z
  .strictObject({
    name: z.string().trim().min(1, "Name is required").max(100),

    username: z
      .string()
      .trim()
      .max(30)
      .regex(
        /^[a-zA-Z0-9_]*$/,
        "Username can contain letters, numbers, and underscores",
      )
      .transform((value) => value || null),

    profilePhoto: nullableUrl,
    boi: nullableText(500),
    phone: nullableText(30),
    country: nullableText(100),
    website: nullableUrl,
    instagram: nullableText(100),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No changes provided",
  });

type UpdateResult = { success: true } | { success: false; message: string };

export async function updateMyProfile(input: unknown): Promise<UpdateResult> {
  const user = await getCurrentUser();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!user || !accessToken) {
    return {
      success: false,
      message: "Please log in to update your profile.",
    };
  }

  const validation = updateProfileSchema.safeParse(input);

  if (!validation.success) {
    const issue = validation.error.issues[0];

    return {
      success: false,
      message: issue
        ? `${issue.path.join(".") || "Profile"}: ${issue.message}`
        : "Invalid profile details.",
    };
  }

  let response: Response;

  try {
    response = await fetch(
      `http://localhost:5000/api/v1/user/${encodeURIComponent(user.id)}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Cookie: `accessToken=${encodeURIComponent(accessToken)}`,
        },
        body: JSON.stringify(validation.data),
        cache: "no-store",
      },
    );
  } catch {
    return {
      success: false,
      message:
        "Could not confirm the update. Refresh your profile before retrying.",
    };
  }

  if (!response.ok) {
    return {
      success: false,
      message:
        response.status === 401
          ? "Your session has expired. Please log in again."
          : response.status === 403
            ? "You cannot update this profile."
            : response.status === 409
              ? "That username is already taken."
              : "Could not update your profile. Check your details.",
    };
  }

  // Accept a successful empty response or your usual JSON envelope.
  if (response.status !== 204) {
    const result: unknown = await response.json().catch(() => null);

    if (!z.object({ success: z.literal(true) }).safeParse(result).success) {
      return {
        success: false,
        message:
          "Unexpected server response. Refresh your profile to check the update.",
      };
    }
  }

  revalidatePath("/dashboard/myProfile");

  return { success: true };
}
