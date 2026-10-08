"use server";

import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

type ForgotPasswordResult = {
  success: boolean;
  message: string;
};

export async function forgotPassword(
  input: unknown,
): Promise<ForgotPasswordResult> {
  const validation = forgotPasswordSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid email address",
    };
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/v1/auth/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(validation.data),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        success: false,
        message:
          response.status === 429
            ? "Too many requests. Please try again later."
            : "Could not process your request. Please try again.",
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
          message: "Could not confirm your request. Please check your email.",
        };
      }
    }

    return {
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link.",
    };
  } catch {
    return {
      success: false,
      message: "Could not connect to the server. Please try again.",
    };
  }
}
