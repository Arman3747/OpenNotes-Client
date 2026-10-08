"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";

import { forgotPassword } from "@/app/services/auth/forgotPassword";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ForgotPasswordValues = {
  email: string;
};

export default function ForgotPassword() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<ForgotPasswordValues> = async (data) => {
    clearErrors("root");

    try {
      const result = await forgotPassword({
        email: data.email.trim(),
      });

      if (!result.success) {
        setError("root", {
          type: "server",
          message: result.message || "Could not process your request.",
        });
        return;
      }

      router.replace("/login");
    } catch {
      setError("root", {
        type: "server",
        message: "Could not process your request. Please try again later.",
      });
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot password?</CardTitle>
        <CardDescription>
          Enter your email to request a password reset link. If an account
          exists, you will receive an email.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="forgot-password-email">Email</FieldLabel>

              <Input
                id="forgot-password-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
                aria-describedby={
                  errors.email ? "forgot-password-email-error" : undefined
                }
                {...register("email", {
                  setValueAs: (value: string) => value.trim(),
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />

              {errors.email && (
                <FieldError id="forgot-password-email-error">
                  {errors.email.message}
                </FieldError>
              )}
            </Field>

            {errors.root?.message && (
              <p role="alert" className="text-sm text-destructive">
                {errors.root.message}
              </p>
            )}

            <Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>

              <FieldDescription className="text-center">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Login
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
