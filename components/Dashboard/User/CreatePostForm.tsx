"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { useForm, type SubmitHandler } from "react-hook-form";

import { createPost } from "@/app/services/dashboard/userDashboard/createPost";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import EditorToolbar from "./EditorToolbar";

type Category = {
  id: string;
  categoriesName: string;
};

type FormValues = {
  title: string;
  categoryId: string;
  tags: string;
};

type CreatePostFormProps = {
  categories: Category[];
};

function parseTags(value: string): string[] {
  return [
    ...new Set(
      value
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

export default function CreatePostForm({ categories }: CreatePostFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      categoryId: "",
      tags: "",
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: {
          openOnClick: false,
          defaultProtocol: "https",
          HTMLAttributes: {
            target: "_blank",
            rel: "noopener noreferrer",
          },
        },
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),

      TextStyle,
      Color,

      Highlight.configure({
        multicolor: true,
      }),
    ],

    immediatelyRender: false,
    content: "",

    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": "Post content",
        "aria-multiline": "true",
        class: [
          "min-h-72 p-4 outline-none",
          "[&_p]:mb-3",
          "[&_h1]:my-4 [&_h1]:text-3xl [&_h1]:font-bold",
          "[&_h2]:my-4 [&_h2]:text-2xl [&_h2]:font-bold",
          "[&_h3]:my-3 [&_h3]:text-xl [&_h3]:font-semibold",
          "[&_ul]:list-disc [&_ul]:pl-6",
          "[&_ol]:list-decimal [&_ol]:pl-6",
          "[&_a]:text-blue-600 [&_a]:underline",
          "[&_blockquote]:my-4 [&_blockquote]:border-l-4",
          "[&_blockquote]:border-primary [&_blockquote]:pl-4",
          "[&_blockquote]:italic",
          "[&_pre]:my-4 [&_pre]:overflow-x-auto",
          "[&_pre]:rounded-md [&_pre]:bg-zinc-900",
          "[&_pre]:p-4 [&_pre]:text-zinc-100",
          "[&_pre_code]:font-mono [&_pre_code]:text-sm",
          "[&_mark]:rounded-sm [&_mark]:px-0.5",
        ].join(" "),
      },
    },
  });

  // Prevent editing while the submitted post is being saved.
  useEffect(() => {
    editor?.setEditable(!isSubmitting);
  }, [editor, isSubmitting]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    clearErrors("root");

    if (!editor || !editor.getText().trim()) {
      setError("root", {
        type: "manual",
        message: "Please write some content.",
      });
      return;
    }

    // const content = editor.getJSON();
    const content = JSON.parse(JSON.stringify(editor.getJSON())) as JSONContent;

    console.log("Client first block:", content.content?.[0]);
    console.log("Client attrs type:", typeof content.content?.[0]?.attrs);
    console.log("Client attrs:", content.content?.[0]?.attrs);

    if (JSON.stringify(content).length > 100_000) {
      setError("root", {
        type: "manual",
        message: "Content is too large.",
      });
      return;
    }

    try {
      const result = await createPost({
        title: data.title.trim(),
        categoryId: data.categoryId,
        tags: parseTags(data.tags),
        content,
      });

      if (result?.success === false) {
        setError("root", {
          type: "server",
          message: result.message,
        });
      }
    } catch {
      setError("root", {
        type: "server",
        message:
          "Could not confirm whether your post was saved. Check My Posts before retrying.",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-3xl space-y-6"
      aria-busy={isSubmitting}
      noValidate
    >
      <h1 className="text-2xl font-semibold">Create Post</h1>

      <FieldGroup>
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Title</FieldLabel>

          <Input
            id="title"
            placeholder="Enter your post title"
            readOnly={isSubmitting}
            aria-invalid={!!errors.title}
            {...register("title", {
              required: "Title is required",
              validate: (value) =>
                value.trim().length > 0 || "Title is required",
              maxLength: {
                value: 200,
                message: "Use no more than 200 characters",
              },
            })}
          />

          {errors.title && <FieldError>{errors.title.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.categoryId}>
          <FieldLabel htmlFor="categoryId">Category</FieldLabel>

          <select
            id="categoryId"
            aria-invalid={!!errors.categoryId}
            disabled={isSubmitting || categories.length === 0}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            {...register("categoryId", {
              required: "Please select a category",
            })}
          >
            <option value="" disabled>
              {categories.length === 0
                ? "No categories available"
                : "Select a category"}
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.categoriesName}
              </option>
            ))}
          </select>

          {errors.categoryId && (
            <FieldError>{errors.categoryId.message}</FieldError>
          )}
        </Field>

        <Field data-invalid={!!errors.tags}>
          <FieldLabel htmlFor="tags">Tags</FieldLabel>

          <Input
            id="tags"
            placeholder="nextjs, react, typescript"
            readOnly={isSubmitting}
            aria-invalid={!!errors.tags}
            {...register("tags", {
              validate: {
                count: (value) =>
                  parseTags(value).length <= 10 || "Use no more than 10 tags",
                length: (value) =>
                  parseTags(value).every((tag) => tag.length <= 30) ||
                  "Each tag must be 30 characters or fewer",
              },
            })}
          />

          <FieldDescription>
            Separate tags with commas. Maximum 10 tags.
          </FieldDescription>

          {errors.tags && <FieldError>{errors.tags.message}</FieldError>}
        </Field>

        <div className="space-y-2">
          <p className="text-sm font-medium">Content</p>

          <div className="overflow-hidden rounded-md border">
            {editor ? (
              <>
                <EditorToolbar editor={editor} disabled={isSubmitting} />
                <EditorContent editor={editor} />
              </>
            ) : (
              <p className="p-4 text-sm text-muted-foreground">
                Loading editor…
              </p>
            )}
          </div>
        </div>

        {errors.root?.message && (
          <p role="alert" className="text-sm text-destructive">
            {errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={!editor || isSubmitting || categories.length === 0}
        >
          {isSubmitting ? "Creating..." : "Create Post"}
        </Button>
      </FieldGroup>
    </form>
  );
}
