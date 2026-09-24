"use server";

// import { redirect } from "next/navigation";
import z from "zod";
import { loginUser } from "./login";

type registerInputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  redirect?: string;
};

const registerValidationZodSchema = z
  .object({
    name: z.string().trim().min(5, {
      error: "Name must be at least 5 characters",
    }),
    email: z.email({ message: "Valid email is required" }),
    password: z
      .string()
      .min(6, {
        error: "Password must be at least 6 characters",
      })
      .max(100, {
        error: "Password must be at most 100 characters",
      })
      .regex(/[A-Z]/, {
        error: "Add at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        error: "Add at least one lowercase letter",
      })
      .regex(/[0-9]/, {
        error: "Add at least one number",
      })
      .regex(/[^A-Za-z0-9\s]/, {
        error: "Add at least one special character",
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
  // // pore
  // const redirect = data?.redirect || null;

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

    const result = await response.json();

    if (!response.ok || result.success !== true) {
      return {
        success: false as const,
        errors: [
          {
            field: "form",
            message: "Registration failed. Please check your details.",
          },
        ],
      };
    }

    // else {
    //   const data = { email, password, redirect };

    //   const resultLogin = await loginUser(data);

    //   if (resultLogin?.success === false) {
    //     // Display result.errors or result.message in the form.
    //     console.error(result);
    //   }
    // }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    // console.log(error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === "development" ? error.message : "Login failed. You might have entered incorrect email or password."}`,
    };
  }

  const resultLogin = await loginUser({
    email,
    password,
    redirect: data.redirect,
  });

  if (resultLogin?.success === false) {
    return {
      success: false as const,
      errors: [
        {
          field: "form",
          message:
            "Your account was created, but automatic login failed. Please log in.",
        },
      ],
    };
  }

  return resultLogin;

  // Runs only after a successful response, outside try/catch.
  // redirect("/blogs");
};
