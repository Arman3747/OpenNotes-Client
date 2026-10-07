"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Pencil } from "lucide-react";

import type { UserProfile } from "@/app/(dashboardLayout)/(userDashboardLayout)/dashboard/myProfile/page";
// import { updateMyProfile } from "@/app/services/auth/updateMyProfile";

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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { updateMyProfile } from "@/app/services/auth/updateMyProfile";

type EditProfileDialogProps = {
  me: UserProfile;
};

type ProfileFormValues = {
  name: string;
  username: string;
  profilePhoto: string;
  boi: string;
  phone: string;
  country: string;
  website: string;
  instagram: string;
};

function getDefaults(me: UserProfile): ProfileFormValues {
  return {
    name: me.name ?? "",
    username: me.username ?? "",
    profilePhoto: me.profilePhoto ?? "",
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
    name: "profilePhoto",
    label: "Profile photo URL",
    placeholder: "https://example.com/photo.jpg",
    maxLength: 2048,
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

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    defaultValues: getDefaults(me),
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;

    if (nextOpen) {
      reset(getDefaults(me));
    }

    setOpen(nextOpen);
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    clearErrors();

    // Send only fields the user changed.
    const original = getDefaults(me);
    const changes: Partial<ProfileFormValues> = {};

    for (const key of Object.keys(original) as Array<keyof ProfileFormValues>) {
      if (data[key].trim() !== original[key].trim()) {
        changes[key] = data[key].trim();
      }
    }

    if (Object.keys(changes).length === 0) {
      setOpen(false);
      return;
    }

    try {
      const result = await updateMyProfile(changes);

      if (!result.success) {
        setError("root", {
          type: "server",
          message: result.message,
        });
        return;
      }

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
            Update your personal details. Email and account permissions cannot
            be changed here.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((item) => (
              <Field
                key={item.name}
                data-invalid={!!errors[item.name]}
                className={item.name === "profilePhoto" ? "sm:col-span-2" : ""}
              >
                <FieldLabel htmlFor={`edit-${item.name}`}>
                  {item.label}
                </FieldLabel>

                <Input
                  id={`edit-${item.name}`}
                  type={
                    item.name === "phone"
                      ? "tel"
                      : item.name === "website" || item.name === "profilePhoto"
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
              placeholder="Tell readers about yourself"
              rows={4}
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
