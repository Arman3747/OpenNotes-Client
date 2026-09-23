"use server";

import { redirect } from "next/navigation";
import z from "zod";

type registerInputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const registerValidationZodSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.email({ message: "Valid email is required" }),
    password: z
      .string()
      .min(6, {
        error: "Password is required and must be at least 6 characters long",
      })
      .max(100, {
        error: "Password must be at most 100 characters long",
      }),
    confirmPassword: z.string().min(6, {
      error:
        "Confirm Password is required and must be at least 6 characters long",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerUser = async (data: registerInputs) => {

  const validatedFields = registerValidationZodSchema.safeParse(data);

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

  const { name, email, password } = validatedFields.data;

  try {
    const response = await fetch("http://localhost:5000/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      return {
        success: false,
        errors: [
          {
            field: "form",
            message: "Registration failed. Please try again.",
          },
        ],
      };
    }
  } catch (error) {
    console.error("Registration request failed:", error);

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
