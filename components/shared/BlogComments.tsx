"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { PostCommentsData } from "@/app/services/public/getPostComments";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { createComment } from "@/app/services/public/createComment";
import { FormattedDate } from "./FormattedDate";
import CommentDateFormat from "./commentdateformate";

type BlogCommentsProps = {
  postId: string;
  canComment: boolean;
  data: PostCommentsData;
};

type CommentFormValues = {
  content: string;
};

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function BlogComments({
  postId,
  canComment,
  data,
}: BlogCommentsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    defaultValues: {
      content: "",
    },
  });

  const { comments, pagination } = data;
  const currentPage = pagination.page;
  const totalPages = Math.max(1, pagination.totalPages);
  const busy = isSubmitting || isPending;

  const query = searchParams.toString();
  const returnPath = `${pathname}${query ? `?${query}` : ""}#comments`;

  const onSubmit: SubmitHandler<CommentFormValues> = async (values) => {
    clearErrors("root");
    setSuccessMessage("");

    try {
      const result = await createComment({
        postId,
        content: values.content.trim(),
      });

      if (!result.success) {
        setError("root", {
          type: "server",
          message: result.message,
        });
        return;
      }

      reset();
      setSuccessMessage("Your comment was added.");

      // Refresh the current comments page and its total count.
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("root", {
        type: "server",
        message:
          "Could not confirm whether your comment was saved. Check the comments before retrying.",
      });
    }
  };

  function goToPage(page: number) {
    if (busy || page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("commentsPage", String(page));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}#comments`, {
        scroll: false,
      });
    });
  }

  return (
    <section
      id="comments"
      aria-labelledby="comments-heading"
      className="scroll-mt-24"
    >
      <Card>
        <CardHeader>
          <CardTitle id="comments-heading">
            Comments ({pagination.total})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {canComment ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3"
              noValidate
            >
              <Field data-invalid={!!errors.content}>
                <FieldLabel htmlFor="comment-content">Add a comment</FieldLabel>

                <Textarea
                  id="comment-content"
                  placeholder="Share your thoughts..."
                  className="min-h-28"
                  disabled={busy}
                  aria-invalid={!!errors.content}
                  aria-describedby={
                    errors.content ? "comment-content-error" : undefined
                  }
                  {...register("content", {
                    required: "Please write a comment",
                    validate: (value) =>
                      value.trim().length > 0 || "Comment cannot be empty",
                    maxLength: {
                      value: 2000,
                      message: "Comment must be at most 2,000 characters",
                    },
                  })}
                />

                {errors.content && (
                  <FieldError id="comment-content-error">
                    {errors.content.message}
                  </FieldError>
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

              <Button type="submit" disabled={busy}>
                {isSubmitting ? "Posting..." : "Post comment"}
              </Button>
            </form>
          ) : (
            <p className="rounded-md bg-muted p-4 text-sm">
              <Link
                href={{
                  pathname: "/login",
                  query: { redirect: returnPath },
                }}
                className="font-medium text-primary underline underline-offset-4"
              >
                Log in
              </Link>{" "}
              to add a comment.
            </p>
          )}

          <div
            aria-busy={isPending}
            className={isPending ? "space-y-5 opacity-60" : "space-y-5"}
          >
            {comments.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No comments yet.
              </p>
            ) : (
              comments.map((comment) => {
                const name =
                  comment.author.name?.trim() ||
                  comment.author.username ||
                  "User";

                return (
                  <article
                    key={comment.id}
                    className="flex gap-3 border-t pt-5"
                  >
                    <Avatar className="size-9 shrink-0">
                      <AvatarImage
                        src={comment.author.profilePhoto || undefined}
                        alt={name}
                        className="object-cover"
                      />
                      <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-sm font-semibold">{name}</p>

                        {/* <time
                          dateTime={comment.createdAt}
                          className="text-xs text-muted-foreground"
                        >
                          {formatDate(comment.createdAt)}
                        </time> */}
                        {/* <div className="text-xs text-muted-foreground">
                          <FormattedDate
                            dateString={comment?.createdAt}
                          ></FormattedDate>
                        </div> */}

                        <CommentDateFormat
                          dateString={comment?.createdAt}
                          className="text-xs text-muted-foreground"
                        />

                        {comment.isEdited && (
                          <span className="text-xs text-muted-foreground">
                            (edited)
                          </span>
                        )}
                      </div>

                      <p className="whitespace-pre-wrap wrap-break-words text-sm leading-6">
                        {comment.content}
                      </p>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Comments pagination"
              className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy || currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>

              <p role="status" className="text-sm text-muted-foreground">
                {isPending
                  ? "Loading comments..."
                  : `Page ${currentPage} of ${totalPages}`}
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy || currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </nav>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
