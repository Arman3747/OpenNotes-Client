"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";

import { updatePost } from "@/app/services/dashboard/userDashboard/updatePost";
import {
  MAX_CONTENT_LENGTH,
  validateImage,
  type Category,
  type EditablePost,
} from "@/lib/editPost";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import EditorToolbar from "./EditorToolbar";

type FormValues = {
  title: string;
  categoryId: string;
  tags: string;
  status: "DRAFT" | "PUBLISHED";
  visibility: "PUBLIC" | "PRIVATE";
  coverImage?: FileList;
};

type EditPostFormProps = {
  post: EditablePost;
  categories: Category[];
};

function parseTags(value: string): string[] {
  // Preserve the capitalization of existing tags.
  return [
    ...new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}

export default function EditPostForm({ post, categories }: EditPostFormProps) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: post.title,
      categoryId: post.categoryId,
      tags: post.tags.join(", "),
      status: post.status,
      visibility: post.visibility,
    },
  });

  // Only release resources here; update preview state in onChange.
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
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
      Highlight.configure({ multicolor: true }),
    ],

    immediatelyRender: false,
    content: post.content,

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

    const content = editor.getJSON();

    if (JSON.stringify(content).length > MAX_CONTENT_LENGTH) {
      setError("root", {
        type: "manual",
        message: "Content is too large.",
      });
      return;
    }

    const image = data.coverImage?.[0];
    const imageValidation = validateImage(image);

    if (imageValidation !== true) {
      setError("coverImage", {
        type: "manual",
        message: imageValidation,
      });
      return;
    }

    const formData = new FormData();

    formData.set(
      "data",
      JSON.stringify({
        title: data.title.trim(),
        categoryId: data.categoryId,
        tags: parseTags(data.tags),
        content,
        status: data.status,
        visibility: data.visibility,
      }),
    );

    // No new file means the backend keeps the existing cover image.
    if (image) {
      formData.set("file", image, image.name);
    }

    try {
      const result = await updatePost(post.id, formData);

      if (!result.success) {
        setError("root", {
          type: "server",
          message: result.message,
        });
        return;
      }
    } catch {
      setError("root", {
        type: "server",
        message:
          "Could not confirm the update. Check My Posts before retrying.",
      });
      return;
    }

    router.replace("/dashboard/posts");
  };

  const previewSource = imagePreview || post.coverImage;

  // These three fields share the same Select UI.
  const selectFields: {
    name: "categoryId" | "status" | "visibility";
    label: string;
    items: { label: string; value: string }[];
  }[] = [
    {
      name: "categoryId",
      label: "Category",
      items: categories.map((category) => ({
        label: category.categoriesName,
        value: category.id,
      })),
    },
    {
      name: "status",
      label: "Status",
      items: [
        { label: "Draft", value: "DRAFT" },
        { label: "Published", value: "PUBLISHED" },
      ],
    },
    {
      name: "visibility",
      label: "Visibility",
      items: [
        { label: "Public", value: "PUBLIC" },
        { label: "Private", value: "PRIVATE" },
      ],
    },
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-3xl space-y-6"
      aria-busy={isSubmitting}
      noValidate
    >
      <h1 className="text-2xl font-semibold">Edit post</h1>

      <FieldGroup>
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Title</FieldLabel>

          <Input
            id="title"
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

        {selectFields.map(({ name, label, items }) => (
          <Controller
            key={name}
            name={name}
            control={control}
            rules={{ required: `Please select ${label.toLowerCase()}` }}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={name}>{label}</FieldLabel>

                <Select
                  name={field.name}
                  value={field.value || null}
                  onValueChange={(value) => {
                    if (value !== null) field.onChange(value);
                  }}
                  items={items}
                  disabled={isSubmitting || items.length === 0}
                >
                  <SelectTrigger
                    id={name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.error ? `${name}-error` : undefined
                    }
                    className="w-full"
                  >
                    <SelectValue
                      placeholder={`Select ${label.toLowerCase()}`}
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {fieldState.error && (
                  <FieldError id={`${name}-error`}>
                    {fieldState.error.message}
                  </FieldError>
                )}
              </Field>
            )}
          />
        ))}

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

        <Field data-invalid={!!errors.coverImage}>
          <FieldLabel htmlFor="coverImage">Cover image</FieldLabel>

          {previewSource && (
            <div className="overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSource}
                alt={
                  imagePreview
                    ? "Replacement cover image preview"
                    : `Current cover for ${post.title}`
                }
                className="max-h-72 w-full object-contain"
              />
            </div>
          )}

          <Input
            id="coverImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isSubmitting}
            aria-invalid={!!errors.coverImage}
            {...register("coverImage", {
              validate: (files) => validateImage(files?.[0]),

              onChange: (event) => {
                const input = event.target as HTMLInputElement;
                const file = input.files?.[0];
                const validation = validateImage(file);

                clearErrors("coverImage");

                if (validation !== true) {
                  setImagePreview(null);
                  setError("coverImage", {
                    type: "manual",
                    message: validation,
                  });
                  return;
                }

                setImagePreview(file ? URL.createObjectURL(file) : null);
              },
            })}
          />

          <FieldDescription>
            JPEG, PNG, or WebP, up to 2 MB. Leave empty to keep the current
            image.
          </FieldDescription>

          {(imagePreview || errors.coverImage) && (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                resetField("coverImage");
                clearErrors("coverImage");
                setImagePreview(null);
              }}
            >
              Cancel image replacement
            </Button>
          )}

          {errors.coverImage && (
            <FieldError>{errors.coverImage.message}</FieldError>
          )}
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

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={!editor || isSubmitting || categories.length === 0}
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => router.push("/dashboard/posts")}
          >
            Cancel
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
