"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { Pencil } from "lucide-react";

import type { UserProfile } from "@/app/(dashboardLayout)/(userDashboardLayout)/dashboard/myProfile/page";
import { updateMyProfile } from "@/app/services/auth/updateMyProfile";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

type ProfileTextValues = {
  name: string;
  username: string;
  boi: string;
  phone: string;
  country: string;
  website: string;
  instagram: string;
};

type ProfileFormValues = ProfileTextValues & {
  photo?: FileList;
};

type EditProfileDialogProps = {
  me: UserProfile;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getDefaults(me: UserProfile): ProfileTextValues {
  return {
    name: me.name ?? "",
    username: me.username ?? "",
    boi: me.boi ?? "",
    phone: me.phone ?? "",
    country: me.country ?? "",
    website: me.website ?? "",
    instagram: me.instagram ?? "",
  };
}

const fields = [
  {
    name: "name",
    label: "Full name",
    placeholder: "Your full name",
    maxLength: 100,
  },
  {
    name: "username",
    label: "Username",
    placeholder: "your_username",
    maxLength: 30,
  },
  {
    name: "phone",
    label: "Phone",
    placeholder: "+61...",
    maxLength: 30,
  },
  {
    name: "country",
    label: "Country",
    placeholder: "Australia",
    maxLength: 100,
  },
  {
    name: "website",
    label: "Website",
    placeholder: "https://example.com",
    maxLength: 2048,
  },
  {
    name: "instagram",
    label: "Instagram",
    placeholder: "@username or Instagram URL",
    maxLength: 100,
  },
] as const;

export default function EditProfileDialog({ me }: EditProfileDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    resetField,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    defaultValues: getDefaults(me),
  });

  const selectedFiles = useWatch({
    control,
    name: "photo",
  });

  const selectedImage = selectedFiles?.[0];

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    clearErrors("photo");
    setImagePreview(null);

    if (!file) return;

    // console.log({
    //   name: file.name,
    //   type: file.type,
    //   bytes: file.size,
    //   sizeMiB: (file.size / 1024 / 1024).toFixed(2),
    //   limitBytes: MAX_IMAGE_SIZE,
    //   exceedsLimit: file.size > MAX_IMAGE_SIZE,
    // });

    if (!IMAGE_TYPES.includes(file.type)) {
      setError("photo", {
        type: "manual",
        message: "Please select a JPEG, PNG, or WebP image.",
      });
      return;
    }

    if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
      setError("photo", {
        type: "manual",
        message: "Image must not be empty or exceed 5 MB.",
      });
      return;
    }

    setImagePreview(URL.createObjectURL(file));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;

    reset(getDefaults(me));
    resetField("photo");
    setImagePreview(null);
    setOpen(nextOpen);
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    clearErrors("root");

    const original = getDefaults(me);
    const changes: Partial<ProfileTextValues> = {};

    for (const key of Object.keys(original) as Array<keyof ProfileTextValues>) {
      const value = data[key].trim();

      if (value !== original[key].trim()) {
        changes[key] = value;
      }
    }

    const image = data.photo?.[0];

    // A photo alone is a valid update.
    if (Object.keys(changes).length === 0 && !image) {
      setOpen(false);
      return;
    }

    const formData = new FormData();
    formData.append("data", JSON.stringify(changes));

    if (image) {
      formData.append("file", image, image.name);
    }

    try {
      const result = await updateMyProfile(formData);

      if (!result.success) {
        setError("root", {
          type: "server",
          message: result.message,
        });
        return;
      }

      resetField("photo");
      setImagePreview(null);
      setOpen(false);
      router.refresh();
    } catch {
      setError("root", {
        type: "server",
        message:
          "Could not confirm the update. Refresh your profile before retrying.",
      });
    }
  };

  const previewSrc = imagePreview || me.profilePhoto;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button type="button" variant="outline" size="sm" />}
      >
        <Pencil className="size-4" />
        Edit Profile
      </DialogTrigger>

      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your photo and personal details.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <Field data-invalid={!!errors.photo}>
            <FieldLabel htmlFor="profile-photo">Profile photo</FieldLabel>

            {previewSrc && (
              <div className="overflow-hidden rounded-lg border bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewSrc}
                  alt={
                    imagePreview
                      ? "Selected profile photo preview"
                      : "Current profile photo"
                  }
                  className="max-h-64 w-full object-contain"
                />
              </div>
            )}

            <Input
              id="profile-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isSubmitting}
              aria-invalid={!!errors.photo}
              {...register("photo", {
                onChange: handlePhotoChange,

                validate: {
                  fileType: (files) => {
                    const file = files?.[0];

                    return (
                      !file ||
                      IMAGE_TYPES.includes(file.type) ||
                      "Please select a JPEG, PNG, or WebP image"
                    );
                  },

                  fileSize: (files) => {
                    const file = files?.[0];

                    return (
                      !file ||
                      (file.size > 0 && file.size <= MAX_IMAGE_SIZE) ||
                      "Image must not be empty or exceed 2 MB"
                    );
                  },
                },
              })}
            />

            <FieldDescription>
              JPG, JPEG, PNG, or WebP, up to 2 MB. Your current photo stays
              unchanged unless you select a replacement.
            </FieldDescription>

            {selectedImage && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => {
                  resetField("photo");
                  setImagePreview(null);
                }}
              >
                Cancel photo selection
              </Button>
            )}

            {errors.photo && <FieldError>{errors.photo.message}</FieldError>}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((item) => (
              <Field key={item.name} data-invalid={!!errors[item.name]}>
                <FieldLabel htmlFor={`edit-${item.name}`}>
                  {item.label}
                </FieldLabel>

                <Input
                  id={`edit-${item.name}`}
                  type={
                    item.name === "phone"
                      ? "tel"
                      : item.name === "website"
                        ? "url"
                        : "text"
                  }
                  placeholder={item.placeholder}
                  readOnly={isSubmitting}
                  aria-invalid={!!errors[item.name]}
                  {...register(item.name, {
                    maxLength: {
                      value: item.maxLength,
                      message: `Use no more than ${item.maxLength} characters`,
                    },
                    validate: (value) => {
                      if (item.name === "name" && !value.trim()) {
                        return "Name is required";
                      }

                      if (
                        item.name === "username" &&
                        value.trim() &&
                        !/^[a-zA-Z0-9_]+$/.test(value.trim())
                      ) {
                        return "Use letters, numbers, and underscores";
                      }

                      return true;
                    },
                  })}
                />

                {errors[item.name] && (
                  <FieldError>{errors[item.name]?.message}</FieldError>
                )}
              </Field>
            ))}
          </div>

          <Field data-invalid={!!errors.boi}>
            <FieldLabel htmlFor="edit-boi">Bio</FieldLabel>

            <Textarea
              id="edit-boi"
              rows={4}
              placeholder="Tell readers about yourself"
              readOnly={isSubmitting}
              aria-invalid={!!errors.boi}
              {...register("boi", {
                maxLength: {
                  value: 500,
                  message: "Bio must be 500 characters or fewer",
                },
              })}
            />

            {errors.boi && <FieldError>{errors.boi.message}</FieldError>}
          </Field>

          {errors.root?.message && (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.message}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
