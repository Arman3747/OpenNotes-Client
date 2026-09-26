"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { refreshAccessToken } from "@/app/services/auth/refresh";

export type AuthUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  name?: string | null;
  profilePhoto?: string | null;
};

// Uses the return type of your existing refresh Server Action.
type RefreshResult = Awaited<ReturnType<typeof refreshAccessToken>>;

type AuthContextValue = {
  user: AuthUser | null;
  restoreSession: () => Promise<RefreshResult>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  user: AuthUser | null;
  children: ReactNode;
};

export function AuthProvider({ user, children }: AuthProviderProps) {
  const router = useRouter();

  // Components within this provider share one refresh attempt.
  const pendingRefresh = useRef<Promise<RefreshResult> | null>(null);

  const restoreSession = useCallback((): Promise<RefreshResult> => {
    // Reuse an existing attempt if refresh is already running.
    if (pendingRefresh.current) {
      return pendingRefresh.current;
    }

    pendingRefresh.current = (async (): Promise<RefreshResult> => {
      try {
        const result = await refreshAccessToken();

        if (result.success) {
          // Reload server-rendered user data.
          router.refresh();

          return result;
        }

        if (result.reason === "UNAUTHENTICATED") {
          const destination = window.location.pathname + window.location.search;

          const query = new URLSearchParams({
            redirect: destination,
          });

          router.replace(`/login?${query.toString()}`);
        }

        // UNAVAILABLE means a temporary failure.
        // Return it so the caller can display an error.
        return result;
      } catch {
        return {
          success: false,
          reason: "UNAVAILABLE",
        };
      } finally {
        pendingRefresh.current = null;
      }
    })();

    return pendingRefresh.current;
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      restoreSession,
    }),
    [user, restoreSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
