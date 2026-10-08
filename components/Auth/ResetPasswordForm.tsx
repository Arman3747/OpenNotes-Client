"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resetPassword } from "@/app/services/auth/resetPassword";

type FormValues = { newPassword: string; confirmPassword: string };

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    criteriaMode: "all",
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    clearErrors("root");
    try {
      const result = await resetPassword({ token, ...values });
      if (!result.success) {
        setError("root", { type: "server", message: result.message });
        return;
      }
      reset();
      setSuccessMessage(result.message);
      router.replace("/login");
    } catch {
      setError("root", {
        type: "server",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  const passwordErrors = errors.newPassword?.types
    ? Object.values(errors.newPassword.types).flat().filter(Boolean)
    : errors.newPassword?.message
      ? [errors.newPassword.message]
      : [];

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            Enter and confirm your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <p role="alert" className="text-sm text-destructive">
              Your reset link is missing its token. Please request a new
              password reset link.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              <fieldset
                disabled={isSubmitting || !!successMessage}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    New password
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.newPassword}
                    aria-describedby="password-help password-errors"
                    {...register("newPassword", {
                      required: "New password is required.",
                      minLength: {
                        value: 6,
                        message: "Must be at least 6 characters long.",
                      },
                      maxLength: {
                        value: 100,
                        message: "Must be at most 100 characters long.",
                      },
                      validate: {
                        uppercase: (v) =>
                          /[A-Z]/.test(v) ||
                          "Add at least one uppercase letter.",
                        lowercase: (v) =>
                          /[a-z]/.test(v) ||
                          "Add at least one lowercase letter.",
                        number: (v) =>
                          /[0-9]/.test(v) || "Add at least one number.",
                        special: (v) =>
                          /[^A-Za-z0-9\s]/.test(v) ||
                          "Add at least one special character.",
                      },
                      deps: ["confirmPassword"],
                    })}
                  />
                  <p
                    id="password-help"
                    className="text-xs text-muted-foreground"
                  >
                    Must be at least 6 characters long.
                  </p>
                  <div
                    id="password-errors"
                    aria-live="polite"
                    className="text-sm text-destructive"
                  >
                    {passwordErrors.map((message, index) => (
                      <p key={index}>{message}</p>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Confirm password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby="confirm-error"
                    {...register("confirmPassword", {
                      required: "Please confirm your password.",
                      validate: (v) =>
                        v === getValues("newPassword") ||
                        "Passwords do not match.",
                    })}
                  />
                  <p
                    id="confirm-error"
                    aria-live="polite"
                    className="text-sm text-destructive"
                  >
                    {errors.confirmPassword?.message}
                  </p>
                </div>
                {errors.root?.message && (
                  <p role="alert" className="text-sm text-destructive">
                    {errors.root.message}
                  </p>
                )}
                {successMessage && (
                  <p role="status" className="text-sm text-green-600">
                    {successMessage}
                  </p>
                )}
                <Button type="submit" className="w-full">
                  {isSubmitting
                    ? "Resetting password..."
                    : successMessage
                      ? "Redirecting..."
                      : "Reset password"}
                </Button>
              </fieldset>
            </form>
          )}
          <p className="mt-5 text-center text-sm">
            <Link href="/login" className="underline underline-offset-4">
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordForm;
