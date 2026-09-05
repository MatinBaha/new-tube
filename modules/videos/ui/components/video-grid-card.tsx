import { useMemo } from "react";
import Link from "next/link";
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

interface VideoGridCardProps {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoGridCardSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="relative aspect-video w-full">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-3 w-[70%]" />
        </div>
      </div>
    </div>
  );
};

export const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
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
    <div className="group flex w-full flex-col gap-2">
      <Link href={`/videos/${data.id}`}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration ?? 0}
        />
      </Link>

      <div className="flex gap-3">
        <Link href={`/users/${data.user.id}`}>
          <UserAvatar
            imageUrl={data.user.imageUrl}
            name={data.user.name}
            className="size-9 shrink-0"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex justify-between gap-x-2">
            <Link href={`/videos/${data.id}`} className="min-w-0 flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="line-clamp-2 text-sm font-medium">
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

              <div className="mt-1">
                <UserInfo size="sm" name={data.user.name} />
              </div>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {compactViews} views • {compactLikes} likes
              </p>
            </Link>

            <div className="flex-none">
              <VideoMenu videoId={data.id} onRemove={onRemove} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
