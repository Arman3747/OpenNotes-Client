"use server";

import { redirect } from "next/navigation";
import z from "zod";

type loginInputs = {
  email: string;
  password: string;
};

const loginValidationZodSchema = z.object({
  email: z.email({ message: "Valid email is required" }),
  password: z
    .string()
    .min(6, {
      error: "Password is required and must be at least 6 characters long",
    })
    .max(100, {
      error: "Password must be at most 100 characters long",
    }),
});

export const loginUser = async (data: loginInputs) => {
  const validatedFields = loginValidationZodSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.issues.map((issue) => {
        return {
          field: String(issue.path[0] ?? "form"),
          message: issue.message,
        };
      }),
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const response = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return {
        success: false,
        errors: [
          {
            field: "form",
            message: "Login failed. Please try again.",
          },
        ],
      };
    }
  } catch (error) {
    console.error("Login request failed:", error);

    return {
      success: false,
      errors: [
        {
          field: "form",
          message: "Could not connect to the registration service.",
        },
      ],
    };
  }

  // Runs only after a successful response, outside try/catch.
  redirect("/blogs");
};
