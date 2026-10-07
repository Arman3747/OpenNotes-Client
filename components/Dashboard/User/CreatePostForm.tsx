"use client";

import { useEffect } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";

import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
// import { Switch } from "@/components/ui/switch";

import EditorToolbar from "./EditorToolbar";

type Category = {
  id: string;
  categoriesName: string;
};

type FormValues = {
  title: string;
  categoryId: string;
  tags: string;
  status: "DRAFT" | "PUBLISHED";
  visibility: "PUBLIC" | "PRIVATE";
  coverImage?: FileList;
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
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      categoryId: "",
      tags: "",
      status: "PUBLISHED",
      visibility: "PUBLIC",
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

  // const onSubmit: SubmitHandler<FormValues> = async (data) => {
  //   const imageFile = data.coverImage?.[0];
  //   clearErrors("root");

  //   if (!editor || !editor.getText().trim()) {
  //     setError("root", {
  //       type: "manual",
  //       message: "Please write some content.",
  //     });
  //     return;
  //   }

  //   // const content = editor.getJSON();
  //   const content = JSON.parse(JSON.stringify(editor.getJSON())) as JSONContent;

  //   console.log("Client first block:", content.content?.[0]);
  //   console.log("Client attrs type:", typeof content.content?.[0]?.attrs);
  //   console.log("Client attrs:", content.content?.[0]?.attrs);

  //   if (JSON.stringify(content).length > 100_000) {
  //     setError("root", {
  //       type: "manual",
  //       message: "Content is too large.",
  //     });
  //     return;
  //   }

  //   try {
  //     const result = await createPost({
  //       title: data.title.trim(),
  //       categoryId: data.categoryId,
  //       tags: parseTags(data.tags),
  //       content,
  //       status: data.status,
  //       visibility: data.visibility,
  //     });

  //     if (result?.success === false) {
  //       setError("root", {
  //         type: "server",
  //         message: result.message,
  //       });
  //     }
  //   } catch {
  //     setError("root", {
  //       type: "server",
  //       message:
  //         "Could not confirm whether your post was saved. Check My Posts before retrying.",
  //     });
  //   }
  // };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    clearErrors("root");

    if (!editor || !editor.getText().trim()) {
      setError("root", {
        type: "manual",
        message: "Please write some content.",
      });
      return;
    }

    const imageFile = data.coverImage?.[0];
    const content = editor.getJSON();

    if (JSON.stringify(content).length > 100_000) {
      setError("root", {
        type: "manual",
        message: "Content is too large.",
      });
      return;
    }

    if (imageFile) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(imageFile.type)) {
        setError("coverImage", {
          type: "manual",
          message: "Please select a JPEG, PNG, or WebP image.",
        });
        return;
      }

      if (imageFile.size > 2 * 1024 * 1024) {
        setError("coverImage", {
          type: "manual",
          message: "Image must be 2 MB or smaller.",
        });
        return;
      }
    }

    try {
      const formData = new FormData();

      formData.append(
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

      if (imageFile) {
        formData.append("file", imageFile, imageFile.name);
      }

      const result = await createPost(formData);

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
        {/* Title  */}
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

        {/* old category */}
        {/* <Field data-invalid={!!errors.categoryId}>
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
        </Field> */}

        {/* new category  */}
        <Controller
          name="categoryId"
          control={control}
          rules={{
            required: "Please select a category",
          }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="categoryId">Category</FieldLabel>

              <Select
                name={field.name}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
                disabled={isSubmitting || categories.length === 0}
                items={categories.map((category) => ({
                  label: category.categoriesName,
                  value: category.id,
                }))}
              >
                <SelectTrigger
                  id="categoryId"
                  ref={field.ref}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.error ? "categoryId-error" : undefined
                  }
                  className="w-full"
                >
                  <SelectValue
                    placeholder={
                      categories.length === 0
                        ? "No categories available"
                        : "Select a category"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.categoriesName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {fieldState.error && (
                <FieldError id="categoryId-error">
                  {fieldState.error.message}
                </FieldError>
              )}
            </Field>
          )}
        />

        {/* tags  */}
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

        {/* <Controller
          name="isFeatured"
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <div className="flex-1 space-y-1">
                <FieldLabel htmlFor="isFeatured">Featured post</FieldLabel>
                <FieldDescription>Mark this post as featured.</FieldDescription>
              </div>

              <Switch
                id="isFeatured"
                name={field.name}
                ref={field.ref}
                checked={field.value}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
                disabled={isSubmitting}
              />
            </Field>
          )}
        /> */}

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>

              <Select
                name={field.name}
                value={field.value}
                onValueChange={(value) => {
                  if (value !== null) field.onChange(value);
                }}
                disabled={isSubmitting}
                items={[
                  { label: "Draft", value: "DRAFT" },
                  { label: "Published", value: "PUBLISHED" },
                ]}
              >
                <SelectTrigger
                  id="status"
                  ref={field.ref}
                  onBlur={field.onBlur}
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>

              <FieldDescription>
                Save as a draft or publish your post.
              </FieldDescription>
            </Field>
          )}
        />

        <Controller
          name="visibility"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="visibility">Visibility</FieldLabel>

              <Select
                name={field.name}
                value={field.value}
                onValueChange={(value) => {
                  if (value !== null) field.onChange(value);
                }}
                disabled={isSubmitting}
                items={[
                  { label: "Public", value: "PUBLIC" },
                  { label: "Private", value: "PRIVATE" },
                ]}
              >
                <SelectTrigger
                  id="visibility"
                  ref={field.ref}
                  onBlur={field.onBlur}
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                </SelectContent>
              </Select>

              <FieldDescription>
                Choose who can view your published post.
              </FieldDescription>
            </Field>
          )}
        />

        <Field data-invalid={!!errors.coverImage}>
          <FieldLabel htmlFor="coverImage">Cover image</FieldLabel>

          <Input
            id="coverImage"
            type="file"
            accept="image/jpg,image/jpeg,image/png,image/webp"
            disabled={isSubmitting}
            aria-invalid={!!errors.coverImage}
            {...register("coverImage", {
              validate: {
                fileType: (files) => {
                  const file = files?.[0];

                  return (
                    !file ||
                    ["image/jpeg", "image/png", "image/webp"].includes(
                      file.type,
                    ) ||
                    "Please select a JPEG, PNG, or WebP image"
                  );
                },

                fileSize: (files) => {
                  const file = files?.[0];

                  return (
                    !file ||
                    file.size <= 2 * 1024 * 1024 ||
                    "Image must be 2 MB or smaller"
                  );
                },
              },
            })}
          />

          <FieldDescription>
            JPG, JPEG, PNG, or WebP, up to 2 MB.
          </FieldDescription>

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
