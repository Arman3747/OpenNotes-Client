import "server-only";

import { cookies } from "next/headers";
import { z } from "zod";
import type { AuthUser } from "@/context/AuthContext";

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
  name: z.string().nullish(),
  profilePhoto: z.string().nullish(),
});

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) return null;

  const response = await fetch("http://localhost:5000/api/v1/user/me", {
    headers: {
      Cookie: `accessToken=${encodeURIComponent(accessToken)}`,
    },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Could not load the current user");
  }

  const result = await response.json();

  if (result.success !== true) {
    throw new Error("Could not load the current user");
  }

  // Return only the fields defined above.
  return userSchema.parse(result.data);
}
