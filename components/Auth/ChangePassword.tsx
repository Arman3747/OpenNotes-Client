"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { changePassword } from "@/app/services/auth/changePassword";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type FormValues = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordForm() {
  const router = useRouter();
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
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  //   const onSubmit: SubmitHandler<FormValues> = async (data) => {
  //     clearErrors("root");
  //     setSuccessMessage("");

  //     try {
  //       const result = await changePassword({
  //         oldPassword: data.oldPassword,
  //         newPassword: data.newPassword,
  //       });

  //       if (!result.success) {
  //         setError("root", {
  //           type: "server",
  //           message: result.message,
  //         });
  //         return;
  //       }

  //       reset();
  //       router.replace("/dashboard/myProfile");
  //       router.refresh();

  //     } catch {
  //       setError("root", {
  //         type: "server",
  //         message:
  //           "Could not confirm the password change. Try signing in with your new password before retrying.",
  //       });
  //     }
  //   };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    clearErrors("root");
    setSuccessMessage("");

    try {
      const result = await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      // Log only the result status—not passwords.
      console.log("Password change success:", result?.success);

      if (result?.success !== true) {
        setError("root", {
          type: "server",
          message: result?.message || "Could not change your password.",
        });
        return;
      }

      console.log("Navigating to profile");

      reset();
      router.replace("/dashboard/myProfile");
    } catch {
      setError("root", {
        type: "server",
        message:
          "Could not confirm the password change. Try signing in with your new password before retrying.",
      });
    }
  };
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Change password</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.oldPassword}>
              <FieldLabel htmlFor="oldPassword">Current password</FieldLabel>

              <Input
                id="oldPassword"
                type="password"
                autoComplete="current-password"
                disabled={isSubmitting}
                aria-invalid={!!errors.oldPassword}
                {...register("oldPassword", {
                  required: "Current password is required",
                  deps: ["newPassword"],
                })}
              />

              {errors.oldPassword && (
                <FieldError>{errors.oldPassword.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.newPassword}>
              <FieldLabel htmlFor="newPassword">New password</FieldLabel>

              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={!!errors.newPassword}
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  maxLength: {
                    value: 100,
                    message: "Password must be at most 100 characters",
                  },
                  deps: ["confirmPassword"],
                  validate: {
                    uppercase: (value) =>
                      /[A-Z]/.test(value) ||
                      "Add at least one uppercase letter",
                    lowercase: (value) =>
                      /[a-z]/.test(value) ||
                      "Add at least one lowercase letter",
                    number: (value) =>
                      /[0-9]/.test(value) || "Add at least one number",
                    special: (value) =>
                      /[^A-Za-z0-9\s]/.test(value) ||
                      "Add at least one special character",
                    different: (value) =>
                      value !== getValues("oldPassword") ||
                      "New password must differ from your current password",
                  },
                })}
              />

              <FieldDescription>
                Use 6+ characters with uppercase, lowercase, a number, and a
                symbol.
              </FieldDescription>

              {errors.newPassword?.types
                ? Object.entries(errors.newPassword.types).map(
                    ([rule, message]) =>
                      typeof message === "string" ? (
                        <FieldError key={rule}>{message}</FieldError>
                      ) : null,
                  )
                : errors.newPassword?.message && (
                    <FieldError>{errors.newPassword.message}</FieldError>
                  )}
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm new password
              </FieldLabel>

              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword", {
                  required: "Please confirm your new password",
                  validate: (value) =>
                    value === getValues("newPassword") ||
                    "Passwords do not match",
                })}
              />

              {errors.confirmPassword && (
                <FieldError>{errors.confirmPassword.message}</FieldError>
              )}
            </Field>

            {errors.root?.message && (
              <p role="alert" className="text-sm text-destructive">
                {errors.root.message}
              </p>
            )}

            {successMessage && (
              <p
                role="status"
                className="text-sm text-green-600 dark:text-green-400"
              >
                {successMessage}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Change password"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
