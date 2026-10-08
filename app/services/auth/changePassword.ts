"use server";

import { cookies } from "next/headers";
import { z } from "zod";

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be at most 100 characters")
      .regex(/[A-Z]/, "Add at least one uppercase letter")
      .regex(/[a-z]/, "Add at least one lowercase letter")
      .regex(/[0-9]/, "Add at least one number")
      .regex(/[^A-Za-z0-9\s]/, "Add at least one special character"),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must differ from your current password",
    path: ["newPassword"],
  });

type ChangePasswordResult = {
  success: boolean;
  message: string;
};

export async function changePassword(
  input: unknown,
): Promise<ChangePasswordResult> {
  const validation = changePasswordSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "Please log in to change your password.",
    };
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/v1/auth/change-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Cookie: `accessToken=${encodeURIComponent(accessToken)}`,
        },
        body: JSON.stringify(validation.data),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        success: false,
        message:
          response.status === 401
            ? "Your session expired or your current password is incorrect."
            : response.status === 403
              ? "You do not have permission to change this password."
              : response.status === 429
                ? "Too many attempts. Please try again later."
                : "Could not change your password. Check your current password.",
      };
    }

    // Support an empty successful response.
    if (response.status === 204) {
      return {
        success: true,
        message: "Password changed successfully.",
      };
    }

    const result: unknown = await response.json().catch(() => null);

    const confirmation = z
      .object({ success: z.literal(true) })
      .safeParse(result);

    if (!confirmation.success) {
      return {
        success: false,
        message:
          "Could not confirm the password change. Try signing in with your new password before retrying.",
      };
    }

    return {
      success: true,
      message: "Password changed successfully.",
    };
  } catch {
    return {
      success: false,
      message:
        "Could not confirm the password change. Try signing in with your new password before retrying.",
    };
  }
}
