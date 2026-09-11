"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { EyeIcon, GlobeIcon, InfoIcon, Share2Icon, UserCheckIcon, VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserGetOneOutput } from "../../types";

interface UserAboutSectionProps {
  user: UserGetOneOutput;
}

export const UserAboutSection = ({ user }: UserAboutSectionProps) => {
  const formattedJoinedDate = useMemo(() => {
    try {
      return format(new Date(user.createdAt), "MMMM d, yyyy");
    } catch {
      return "Unknown";
    }
  }, [user.createdAt]);

  const formattedViews = useMemo(() => {
    return Intl.NumberFormat("en").format(user.viewCount);
  }, [user.viewCount]);

  const formattedSubscribers = useMemo(() => {
    return Intl.NumberFormat("en").format(user.subscriberCount);
  }, [user.subscriberCount]);

  const onShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Channel link copied to clipboard");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      {/* Left Column: Description & About details */}
      <div className="space-y-6 lg:col-span-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Description</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            Welcome to {user.name}&apos;s channel! Explore videos, playlists, and updates directly from the creator.
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Details</h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <GlobeIcon className="size-4 shrink-0 text-foreground" />
            <span>
              Channel link:{" "}
              <span className="font-mono text-xs text-foreground/80">
                /users/{user.id}
              </span>
            </span>
          </div>
        </div>

        <div>
          <Button
            variant="secondary"
            className="rounded-full gap-2 text-sm font-medium"
            onClick={onShare}
          >
            <Share2Icon className="size-4" />
            Share channel
          </Button>
        </div>
      </div>

      {/* Right Column: Stats Card */}
      <div className="rounded-2xl border border-border/80 bg-muted/30 p-6 space-y-4 h-fit">
        <h3 className="text-base font-semibold text-foreground">Stats</h3>
        <Separator />

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <InfoIcon className="size-4 shrink-0 text-foreground" />
            <span>Joined {formattedJoinedDate}</span>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground">
            <EyeIcon className="size-4 shrink-0 text-foreground" />
            <span>{formattedViews} views</span>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground">
            <UserCheckIcon className="size-4 shrink-0 text-foreground" />
            <span>
              {formattedSubscribers}{" "}
              {user.subscriberCount === 1 ? "subscriber" : "subscribers"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground">
            <VideoIcon className="size-4 shrink-0 text-foreground" />
            <span>
              {user.videoCount} {user.videoCount === 1 ? "video" : "videos"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
