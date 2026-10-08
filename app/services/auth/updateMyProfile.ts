"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/getCurrentUser";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

const nullableUrl = z
  .string()
  .trim()
  .max(2048)
  .pipe(
    z.union([
      z.literal(""),
      z.url({
        protocol: /^https?$/,
        error: "Enter a full HTTP or HTTPS URL",
      }),
    ]),
  )
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

    boi: nullableText(500),
    phone: nullableText(30),
    country: nullableText(100),
    website: nullableUrl,
    instagram: nullableText(100),
  })
  .partial();

type UpdateResult = { success: true } | { success: false; message: string };

export async function updateMyProfile(
  formData: FormData,
): Promise<UpdateResult> {
  const user = await getCurrentUser();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!user || !accessToken) {
    return {
      success: false,
      message: "Please log in to update your profile.",
    };
  }

  const rawData = formData.get("data");

  if (typeof rawData !== "string") {
    return {
      success: false,
      message: "Profile data is missing.",
    };
  }

  let input: unknown;

  try {
    input = JSON.parse(rawData);
  } catch {
    return {
      success: false,
      message: "Invalid profile data.",
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

  const image = formData.get("file");

  if (image !== null) {
    if (!(image instanceof File)) {
      return {
        success: false,
        message: "Invalid image upload.",
      };
    }

    if (!IMAGE_TYPES.includes(image.type)) {
      return {
        success: false,
        message: "Please select a JPEG, PNG, or WebP image.",
      };
    }

    if (image.size === 0 || image.size > MAX_IMAGE_SIZE) {
      return {
        success: false,
        message: "Image must not be empty or exceed 2 MB.",
      };
    }
  }

  if (Object.keys(validation.data).length === 0 && image === null) {
    return {
      success: false,
      message: "No changes provided.",
    };
  }

  const backendFormData = new FormData();

  backendFormData.append("data", JSON.stringify(validation.data));

  if (image instanceof File) {
    backendFormData.append("file", image, image.name);
  }

  let response: Response;

  try {
    response = await fetch(
      `http://localhost:5000/api/v1/user/${encodeURIComponent(user.id)}`,
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
              : response.status === 413
                ? "The uploaded image is too large."
                : "Could not update your profile. Check your details.",
    };
  }

  if (response.status !== 204) {
    const result: unknown = await response.json().catch(() => null);

    const successResponse = z.object({
      success: z.literal(true),
    });

    if (!successResponse.safeParse(result).success) {
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
