"use server";

import { cookies } from "next/headers";
import { parseSetCookie } from "cookie";

type RefreshResult =
  | { success: true }
  | {
      success: false;
      reason: "UNAUTHENTICATED" | "UNAVAILABLE";
    };

export async function refreshAccessToken(): Promise<RefreshResult> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return {
      success: false,
      reason: "UNAUTHENTICATED",
    };
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/v1/auth/refresh-token",
      {
        method: "POST",
        headers: {
          Cookie: `refreshToken=${encodeURIComponent(refreshToken)}`,
        },
        cache: "no-store",
      },
    );

    if (response.status === 401 || response.status === 403) {
      // Assumes your backend uses these statuses for a rejected session.
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");

      return {
        success: false,
        reason: "UNAUTHENTICATED",
      };
    }

    if (!response.ok) {
      return {
        success: false,
        reason: "UNAVAILABLE",
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

    if (!accessCookie?.value) {
      return {
        success: false,
        reason: "UNAVAILABLE",
      };
    }

    // Save the access token and any rotated refresh token.
    for (const cookie of [accessCookie, refreshCookie]) {
      if (!cookie?.value) continue;

      cookieStore.set(cookie.name, cookie.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: cookie.maxAge,
        expires: cookie.expires,
      });
    }

    return { success: true };
  } catch {
    // A temporary network problem should not delete the session.
    return {
      success: false,
      reason: "UNAVAILABLE",
    };
  }
}
