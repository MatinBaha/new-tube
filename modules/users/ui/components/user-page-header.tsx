"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/user-avatar";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { useSubscroption } from "@/modules/subscriptions/hooks/use-subscription";
import { UserGetOneOutput } from "../../types";

interface UserPageHeaderProps {
  user: UserGetOneOutput;
  onSelectAbout?: () => void;
}

export const UserPageHeader = ({
  user,
  onSelectAbout,
}: UserPageHeaderProps) => {
  const { isLoaded } = useAuth();
  const { onClick, isPending } = useSubscroption({
    userId: user.id,
    isSubscribed: user.isSubscribed,
  });

  const formattedSubscribers = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(user.subscriberCount);
  }, [user.subscriberCount]);

  const formattedVideos = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(user.videoCount);
  }, [user.videoCount]);

  const handle = useMemo(() => {
    return `@${user.name.toLowerCase().replace(/[^a-z0-9_]/g, "") || "user"}`;
  }, [user.name]);

  const joinedDate = useMemo(() => {
    try {
      return format(new Date(user.createdAt), "MMMM yyyy");
    } catch {
      return "";
    }
  }, [user.createdAt]);

  return (
    <div className="flex flex-col gap-6 pt-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="shrink-0">
        <UserAvatar
          imageUrl={user.imageUrl}
          name={user.name}
          className="size-20 sm:size-32 md:size-40 border-4 border-background shadow-md"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <h1 className="truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          {user.name}
        </h1>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground font-normal">
          <span className="font-medium text-foreground">{handle}</span>
          <span>•</span>
          <span>
            {formattedSubscribers}{" "}
            {user.subscriberCount === 1 ? "subscriber" : "subscribers"}
          </span>
          <span>•</span>
          <span>
            {formattedVideos} {user.videoCount === 1 ? "video" : "videos"}
          </span>
        </div>

        {joinedDate && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            Joined {joinedDate}
            {onSelectAbout && (
              <button
                type="button"
                onClick={onSelectAbout}
                className="ml-2 font-medium text-foreground hover:underline"
              >
                ...more
              </button>
            )}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3">
          {user.isOwner ? (
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="rounded-full px-5 font-medium"
                asChild
              >
                <Link href="/studio">Customize channel</Link>
              </Button>
              <Button
                variant="secondary"
                className="rounded-full px-5 font-medium"
                asChild
              >
                <Link href="/studio">Manage videos</Link>
              </Button>
            </div>
          ) : (
            <SubscriptionButton
              onClick={onClick}
              disabled={isPending || !isLoaded}
              isSubscribed={user.isSubscribed}
              className="h-10 px-6 font-medium text-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const UserPageHeaderSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 pt-4 sm:flex-row sm:items-center sm:gap-8">
      <Skeleton className="size-20 sm:size-32 md:size-40 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-3">
        <Skeleton className="h-8 w-48 sm:w-64" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-36 rounded-full mt-2" />
      </div>
    </div>
  );
};
