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
import { loginUser } from "@/app/services/auth/login";

type loginInputs = {
  email: string;
  password: string;
  // redirect?: string;
};

const Login = ({ redirect }: { redirect?: string | undefined }) => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<loginInputs>({
    criteriaMode: "all",
  });

  const onSubmit: SubmitHandler<loginInputs> = async (data) => {
    clearErrors("root");

    const result = await loginUser({ ...data, redirect });

    if (result?.success === false) {
      const message =
        "errors" in result && result.errors
          ? result.errors.map((error) => error.message).join(" ")
          : result.message || "Login failed. Please try again.";

      setError("root.server", {
        type: "server",
        message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in to your account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            {/* {redirect && (
              <input type="hidden" name="redirect" value={redirect} />
            )} */}
            {/* email  */}
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

            {/* password  */}
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
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

            <Field>
              {errors.root?.server?.message && (
                <FieldError>{errors.root.server.message}</FieldError>
              )}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
              {/* <Button variant="outline" type="button">
                  Sign up with Google
                </Button> */}
              <FieldDescription className="px-6 text-center">
                Do not have an account?{" "}
                {/* <Link href="/register" prefetch={true}>
                  Register
                </Link> */}
                <Link
                  href={{
                    pathname: "/register",
                    query: redirect ? { redirect } : {},
                  }}
                >
                  Register
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};

export default Login;
