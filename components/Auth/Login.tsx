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
};

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<loginInputs>();

  const onSubmit: SubmitHandler<loginInputs> = (data) => {
    console.log(data);
    console.log({
      email: data?.email,
      password: data?.password,
    });

    loginUser(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in to your account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
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
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z]).+$/,
                    message:
                      "Must include at least one uppercase and one lowercase letter",
                  },
                })}
                required
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
              {errors.password && (
                <FieldError>{errors.password.message}</FieldError>
              )}
            </Field>

            <Field>
              <Button type="submit" disabled={isSubmitting}>
                Login
              </Button>
              {/* <Button variant="outline" type="button">
                  Sign up with Google
                </Button> */}
              <FieldDescription className="px-6 text-center">
                Do not have an account?{" "}
                <Link href="/register" prefetch={true}>
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
