"use server";

import { z } from "zod";

const resetPasswordSchema = z
  .object({
    // This is a JWT, not a 64-character hexadecimal token.
    // The backend must verify its signature, expiry, and reset purpose.
    token: z
      .string()
      .trim()
      .min(1, "Reset token is missing. Request a new link."),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long.")
      .max(100, "Password must be at most 100 characters long.")
      .regex(/[A-Z]/, "Add at least one uppercase letter.")
      .regex(/[a-z]/, "Add at least one lowercase letter.")
      .regex(/[0-9]/, "Add at least one number.")
      .regex(/[^A-Za-z0-9\s]/, "Add at least one special character."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
type ResetPasswordResult = { success: boolean; message: string };

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<ResetPasswordResult> {
  const parsed = resetPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  // Set API_BASE_URL in .env.local if your backend uses another URL.
  const baseUrl = (
    process.env.API_BASE_URL ?? "http://localhost:5000/api/v1"
  ).replace(/\/$/, "");

  try {
    const response = await fetch(`${baseUrl}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        token: parsed.data.token,
        newPassword: parsed.data.newPassword,
      }),
    });

    // Handle JSON responses, empty success responses, and non-JSON errors.
    const body: unknown = await response.json().catch(() => null);
    const data =
      typeof body === "object" && body !== null
        ? (body as { success?: unknown; message?: unknown })
        : null;

    if (!response.ok || data?.success === false) {
      return {
        success: false,
        message:
          typeof data?.message === "string"
            ? data.message
            : "Unable to reset your password. The link may be invalid or expired.",
      };
    }

    return {
      success: true,
      message: "Password reset successfully. Please log in.",
    };
  } catch {
    return {
      success: false,
      message: "Unable to reach the server. Please try again.",
    };
  }
}
