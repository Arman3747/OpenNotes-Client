"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { registerUser } from "@/app/services/auth/register";

type registerInputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Register = ({ redirect }: { redirect?: string | undefined }) => {
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<registerInputs>({
    criteriaMode: "all",
  });

  // const onSubmit: SubmitHandler<registerInputs> = (data) => {
  //   // console.log(data);
  //   // console.log({
  //   //   name: data?.name,
  //   //   email: data?.email,
  //   //   password: data?.password,
  //   //   confirmPassword: data?.confirmPassword,
  //   // });

  //   registerUser(data);
  // };

  const onSubmit: SubmitHandler<registerInputs> = async (data) => {
    clearErrors("root");

    const result = await registerUser({ ...data, redirect });

    if (result?.success === false) {
      const message =
        "errors" in result && result.errors
          ? result.errors.map((error) => error.message).join(" ")
          : "Registration could not be completed.";

      setError("root.server", {
        type: "server",
        message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        {/* <CardDescription>
          Enter your information below to create your account
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            {/* Name  */}
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                aria-invalid={!!errors.name}
                {...register("name", {
                  required: "Full name is required !",
                  minLength: {
                    value: 5,
                    message: "Name should be more than 5 characters!",
                  },
                })}
                placeholder="John Doe"
                required
              />
              {errors.name && <FieldError>{errors?.name?.message}</FieldError>}
            </Field>

            {/* Email  */}
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email", {
                  required: "Email is required !",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please provide a CORRECT email address !",
                  },
                })}
                required
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            {/* Password  */}
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
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
                  },
                })}
                required
              />
              <FieldDescription>
                Use 6+ characters, including uppercase, lowercase, a number, and
                a symbol.
              </FieldDescription>
              {errors.password?.types
                ? Object.entries(errors.password.types).map(
                    ([rule, message]) =>
                      typeof message === "string" ? (
                        <FieldError key={rule}>{message}</FieldError>
                      ) : null,
                  )
                : errors.password?.message && (
                    <FieldError>{errors.password.message}</FieldError>
                  )}
            </Field>

            {/* Confirm Password  */}
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === getValues("password") || "Passwords do not match",
                })}
                required
              />
              {errors.confirmPassword && (
                <FieldError>{errors.confirmPassword.message}</FieldError>
              )}
            </Field>

            <Field>
              {errors.root?.server?.message && (
                <FieldError>{errors.root.server.message}</FieldError>
              )}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>

              {/* <Button variant="outline" type="button">
                  Sign up with Google
                </Button> */}
              <FieldDescription className="px-6 text-center">
                Already have an account?
                <Link
                  href={{
                    pathname: "/login",
                    query: redirect ? { redirect } : {},
                  }}
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
};

export default Register;
