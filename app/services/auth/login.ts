/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { redirect } from "next/navigation";
import z from "zod";
import { parseCookie } from "cookie";
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
  redirect?: string;
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
  const redirectTo = data?.redirect || null;

  const validatedFields = loginValidationZodSchema.safeParse(data);

  let accessTokenObject: null | any = null;
  let refreshTokenObject: null | any = null;

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

    const result = await response.json();
    const setCookieHeaders = response.headers.getSetCookie();

    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie: string) => {
        const parsedCookie = parseCookie(cookie);

        if (parsedCookie["accessToken"]) {
          accessTokenObject = parsedCookie;
        }
        if (parsedCookie["refreshToken"]) {
          refreshTokenObject = parsedCookie;
        }
      });
    } else {
      throw new Error("No Set-Cookie header found!");
    }

    if (!accessTokenObject) {
      throw new Error("accessTokenObject not found in cookies");
    }
    if (!refreshTokenObject) {
      throw new Error("refreshTokenObject not found in cookies");
    }

    await setCookie("accessToken", accessTokenObject.accessToken, {
      secure: true,
      httpOnly: true,
      maxAge: parseInt(accessTokenObject["Max-Age"]) || 12 * 1000 * 60 * 60,
      path: accessTokenObject.Path || "/",
      sameSite: accessTokenObject["SameSite"] || "none",
    });

    await setCookie("refreshToken", refreshTokenObject.refreshToken, {
      secure: true,
      httpOnly: true,
      maxAge: parseInt(refreshTokenObject["Max-Age"]) || 24 * 1000 * 60 * 60,
      path: refreshTokenObject.Path || "/",
      sameSite: accessTokenObject["SameSite"] || "none",
    });

    const verifiedToken: JwtPayload | string = jwt.verify(
      accessTokenObject.accessToken,
      process.env.JWT_ACCESS_SECRET as string,
    );

    if (typeof verifiedToken === "string") {
      throw new Error("Invalid token");
    }

    //`${process.env.NODE_ENV === "development" ? result.message : "Login failed. You might have given incorrect email or password."}`

    const userRole: UserRole = verifiedToken.role;

    if (!result.success) {
      throw new Error(result.message || "Login failed");
    }

    if (redirectTo) {
      const requestedPath = redirectTo.toString();
      if (isValidRedirectForRole(requestedPath, userRole)) {
        redirect(`${requestedPath}?loggedIn=true`);
      } else {
        redirect(`${getDefaultDashboardRoute(userRole)}?loggedIn=true`);
      }
    } else {
      redirect(`${getDefaultDashboardRoute(userRole)}?loggedIn=true`);
    }
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.log(error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === "development" ? error.message : "Login failed. You might have entered incorrect email or password."}`,
    };
  }

  // Runs only after a successful response, outside try/catch.
  redirect("/blogs");
};
