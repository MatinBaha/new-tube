import { useMemo } from "react";
import Link from "next/link";
import { cva, VariantProps } from "class-variance-authority";
import { VideoGetManyOutput } from "../../types";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoThumbnail } from "./video-thumbnail";
import { VideoMenu } from "./video-menu";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import UserAvatar from "@/components/user-avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const videoCardRowVariants = cva("group flex min-w-0", {
  variants: {
    size: {
      default: "gap-4",
      compact: "gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const thumbnailVariants = cva("relative flex-none", {
  variants: {
    size: {
      default: "w-[38%]",
      compact: "w-[168px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface VideoRowCardProps extends VariantProps<typeof videoCardRowVariants> {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoRowCardSkeleton = ({
  size = "default",
}: VariantProps<typeof videoCardRowVariants>) => {
  return (
    <div className={videoCardRowVariants({ size })}>
      <div className={thumbnailVariants({ size })}>
        <div className="relative aspect-video w-full">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton
          className={cn("h-4 w-[90%]", size === "compact" ? "h-3" : "h-4")}
        />
        <Skeleton
          className={cn("h-3 w-[70%]", size === "compact" ? "h-2.5" : "h-3")}
        />
        {size === "default" && (
          <div className="flex items-center gap-2 py-1">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-[120px]" />
          </div>
        )}
      </div>
    </div>
  );
};

export const VideoRowCard = ({
  data,
  size = "default",
  onRemove,
}: VideoRowCardProps) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.viewCount);
  }, [data.viewCount]);

  const compactLikes = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.likeCount);
  }, [data.likeCount]);

  return (
    <div className={videoCardRowVariants({ size })}>
      {/* Thumbnail Link */}
      <Link href={`/videos/${data.id}`} className={thumbnailVariants({ size })}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration ?? 0}
        />
      </Link>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-x-2">
          <Link href={`/videos/${data.id}`} className="min-w-0 flex-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <h3
                  className={cn(
                    "line-clamp-2 font-medium",
                    size === "compact" ? "text-sm" : "text-base"
                  )}
                >
                  {data.title}
                </h3>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                align="start"
                className="bg-black/70"
              >
                <p>{data.title}</p>
              </TooltipContent>
            </Tooltip>

            {size === "default" && (
              <p className="mt-1 text-xs text-muted-foreground">
                {compactViews} views • {compactLikes} likes
              </p>
            )}

            {size === "default" && (
              <>
                <div className="my-2.5 flex items-center gap-2">
                  <UserAvatar
                    size="sm"
                    imageUrl={data.user.imageUrl}
                    name={data.user.name}
                  />
                  <UserInfo size="sm" name={data.user.name} />
                </div>
                {data.description && (
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {data.description}
                  </p>
                )}
              </>
            )}

            {size === "compact" && (
              <>
                <UserInfo size="sm" name={data.user.name} />
                <p className="text-xs text-muted-foreground">
                  {compactViews} views • {compactLikes} likes
                </p>
              </>
            )}
          </Link>

          <div className="flex-none">
            <VideoMenu videoId={data.id} onRemove={onRemove} />
          </div>
        </div>
      </div>
    </div>
  );
};
