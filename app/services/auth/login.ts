/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { redirect } from "next/navigation";
import z from "zod";
import { parseSetCookie } from "cookie";
import { setCookie } from "./tokenHeaders";
import {
  getDefaultDashboardRoute,
  isValidRedirectForRole,
  UserRole,
} from "@/lib/authUtils";
import jwt, { JwtPayload } from "jsonwebtoken";

type loginInputs = {
  email: string;
  password: string;
  redirect?: string | null;
};

const loginValidationZodSchema = z.object({
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
});

export const loginUser = async (data: loginInputs) => {
  const redirectTo = data?.redirect || null;

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

    const result = await response.json();

    if (!response.ok || result.success !== true) {
      return {
        success: false as const,
        message: "Login failed. Please check your email and password.",
      };
    }

    const parsedCookies = response.headers
      .getSetCookie()
      .map((header) => parseSetCookie(header));

    const accessCookie = parsedCookies.find(
      (cookie) => cookie.name === "accessToken",
    );

    const refreshCookie = parsedCookies.find(
      (cookie) => cookie.name === "refreshToken",
    );

    if (!accessCookie?.value || !refreshCookie?.value) {
      throw new Error("Authentication cookies are missing");
    }

    const accessToken = accessCookie.value;
    const refreshToken = refreshCookie.value;

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET is not configured");
    }

    const verifiedToken: JwtPayload | string = jwt.verify(accessToken, secret);

    if (
      typeof verifiedToken === "string" ||
      !["USER", "ADMIN", "SUPER_ADMIN"].includes(verifiedToken.role)
    ) {
      throw new Error("Invalid access token or role");
    }

    const userRole: UserRole = verifiedToken.role;

    await setCookie("accessToken", accessToken, {
      secure: true,
      httpOnly: true,
      maxAge: accessCookie.maxAge ?? 24 * 60 * 60, // 1 day
      path: accessCookie.path || "/",
      sameSite: accessCookie.sameSite || "none",
    });

    await setCookie("refreshToken", refreshToken, {
      secure: true,
      httpOnly: true,
      maxAge: refreshCookie.maxAge ?? 7 * 24 * 60 * 60, // 7 days
      path: refreshCookie.path || "/",
      sameSite: refreshCookie.sameSite || "none",
    });

    //`${process.env.NODE_ENV === "development" ? result.message : "Login failed. You might have given incorrect email or password."}`

    if (!result.success) {
      throw new Error(result.message || "Login failed");
    }

    if (redirectTo) {
      const requestedPath = redirectTo.toString();
      if (isValidRedirectForRole(requestedPath, userRole)) {
        // redirect(`${requestedPath}?loggedIn=true`);
        redirect(`${requestedPath}`);
      } else {
        // redirect(`${getDefaultDashboardRoute(userRole)}?loggedIn=true`);
        redirect(`${getDefaultDashboardRoute(userRole)}`);
      }
    } else {
      // redirect(`${getDefaultDashboardRoute(userRole)}?loggedIn=true`);
      redirect(`${getDefaultDashboardRoute(userRole)}`);
    }
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
};
