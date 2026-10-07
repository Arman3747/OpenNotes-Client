import type { ReactNode } from "react";
import type { UserProfile } from "@/app/(dashboardLayout)/(userDashboardLayout)/dashboard/myProfile/page";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import EditProfileDialog from "./EditProfileDialog";

type ViewMyProfileProps = {
  me: UserProfile;
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Sydney",
  }).format(date);
}

function getWebsiteUrl(value: string | null): string | null {
  if (!value?.trim()) return null;

  const input = value.trim();
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(input)
    ? input
    : `https://${input}`;

  try {
    const url = new URL(candidate);

    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function getInstagramUrl(value: string | null): string | null {
  if (!value?.trim()) return null;

  const input = value.trim();

  // Accept either a username or an Instagram URL.
  if (/^@?[a-zA-Z0-9._]{1,30}$/.test(input)) {
    return `https://www.instagram.com/${input.replace(/^@/, "")}/`;
  }

  const href = getWebsiteUrl(input);

  if (!href) return null;

  const url = new URL(href);

  return ["instagram.com", "www.instagram.com"].includes(url.hostname)
    ? href
    : null;
}

function ProfileDetail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="wrap-break-words text-sm font-medium">{children}</dd>
    </div>
  );
}

function ProfileLink({
  value,
  href,
}: {
  value: string | null;
  href: string | null;
}) {
  if (!value?.trim()) {
    return <span className="text-muted-foreground">Not added</span>;
  }

  if (!href) return <span>{value}</span>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-primary underline-offset-4 hover:underline"
    >
      {value}
    </a>
  );
}

export default function ViewMyProfile({ me }: ViewMyProfileProps) {
  const displayName = me.name?.trim() || me.email;

  const initials =
    (me.name?.trim()
      ? me.name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
      : me.email.slice(0, 2)
    ).toUpperCase() || "U";

  const stats = [
    { label: "Posts", value: me.postsCount },
    { label: "Followers", value: me.followersCount },
    { label: "Following", value: me.followingCount },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-5">
          {/* <div>
            <CardTitle className="text-xl">My Profile</CardTitle>
            <CardDescription>
              Your personal information and account details.
            </CardDescription>
          </div> */}

          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">My Profile</CardTitle>
              <CardDescription>
                Your personal information and account details.
              </CardDescription>
            </div>

            <EditProfileDialog me={me} />
          </div>

          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <Avatar className="size-24 shrink-0 ring-4 ring-muted">
              <AvatarImage
                src={me.profilePhoto || undefined}
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-2">
              <h1 className="wrap-break-words text-2xl font-semibold">
                {displayName}
              </h1>

              <p className="break-all text-sm text-muted-foreground">
                {me.email}
              </p>

              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge variant="secondary">{formatLabel(me.role)}</Badge>

                <Badge
                  variant="outline"
                  className={
                    me.status === "ACTIVE"
                      ? "border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-400"
                      : ""
                  }
                >
                  {formatLabel(me.status)}
                </Badge>

                <Badge variant={me.isVerified ? "default" : "outline"}>
                  {me.isVerified ? "Verified" : "Not verified"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <dl className="grid grid-cols-3 gap-2 rounded-xl border bg-muted/40 p-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 text-center"
              >
                <dt className="text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </dt>
                <dd className="text-xl font-semibold tabular-nums sm:text-2xl">
                  {stat.value.toLocaleString("en-AU")}
                </dd>
              </div>
            ))}
          </dl>

          <section className="space-y-2">
            <h2 className="font-semibold">About me</h2>
            <p className="whitespace-pre-wrap wrap-break-words text-sm leading-relaxed text-muted-foreground">
              {me.boi?.trim() || "No bio added yet."}
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="font-semibold">Personal details</h2>

            <dl className="grid gap-5 sm:grid-cols-2">
              <ProfileDetail label="Full name">
                {me.name?.trim() || "Not added"}
              </ProfileDetail>

              <ProfileDetail label="Username">
                {me.username
                  ? `@${me.username.replace(/^@/, "")}`
                  : "Not added"}
              </ProfileDetail>

              <ProfileDetail label="Email">
                <span className="break-all">{me.email}</span>
              </ProfileDetail>

              <ProfileDetail label="Phone">
                {me.phone?.trim() || "Not added"}
              </ProfileDetail>

              <ProfileDetail label="Country">
                {me.country?.trim() || "Not added"}
              </ProfileDetail>
            </dl>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="font-semibold">Social links</h2>

            <dl className="grid gap-5 sm:grid-cols-2">
              <ProfileDetail label="Website">
                <ProfileLink
                  value={me.website}
                  href={getWebsiteUrl(me.website)}
                />
              </ProfileDetail>

              <ProfileDetail label="Instagram">
                <ProfileLink
                  value={me.instagram}
                  href={getInstagramUrl(me.instagram)}
                />
              </ProfileDetail>
            </dl>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="font-semibold">Account information</h2>

            <dl className="grid gap-5 sm:grid-cols-2">
              <ProfileDetail label="Joined">
                <time dateTime={me.createdAt}>{formatDate(me.createdAt)}</time>
              </ProfileDetail>

              <ProfileDetail label="Last updated">
                <time dateTime={me.updatedAt}>{formatDate(me.updatedAt)}</time>
              </ProfileDetail>

              <div className="sm:col-span-2">
                <ProfileDetail label="User ID">
                  <span className="break-all font-mono text-xs text-muted-foreground">
                    {me.id}
                  </span>
                </ProfileDetail>
              </div>
            </dl>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
