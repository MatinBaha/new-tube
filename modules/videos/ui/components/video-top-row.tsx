import { useMemo } from "react";
import { VideoGetOneOutput } from "../../types";
import { VideoDescription } from "./video-description";
import { VideoMenu } from "./video-menu";
import { VideoOwner } from "./video-owner";
import { VideoReactions } from "./video-reactions";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoTopRowProps {
  video: VideoGetOneOutput;
}

export const VideoTopRowSkeleton = () => {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="mdw-2/5 h-6 w-4/5" />
      </div>
      <div className="flex items-center justify-center">
        <div className="flex w-[70%] items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex w-full flex-col gap-2">
            <Skeleton className="h-5 w-4/5 md:w-2/6" />
            <Skeleton className="h-5 w-3/5 md:w-1/5" />
          </div>
        </div>
        <Skeleton className="md:1/6 h-9 w-2/6 rounded-full" />
      </div>
      <div className="h-[120px] w-full" />
    </div>
  );
};

export const VideoTopRow = ({ video }: VideoTopRowProps) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(video.viewCount);
  }, []);
  const expandedViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "standard",
    }).format(video.viewCount);
  }, []);

  const compactDate = useMemo(() => {
    return formatDistanceToNow(video.createdAt, { addSuffix: true });
  }, []);
  const expandedDate = useMemo(() => {
    return format(video.createdAt, "dd mmm yyyy");
  }, []);

  return (
    <div className="mt-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{video.title}</h1>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <VideoOwner user={video.user} videoId={video.id} />
        <div className="mb-2 flex gap-2 overflow-x-auto pb-2 sm:mb-0 sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible sm:pb-0">
          <VideoReactions
            videoId={video.id}
            likes={video.likeCount}
            dislikes={video.dislikeCount}
            viewerReaction={video.viewerReaction}
          />
          <VideoMenu videoId={video.id} variant="secondary" />
        </div>
      </div>
      <VideoDescription
        compactViews={compactViews}
        expandedViews={expandedViews}
        compactDate={compactDate}
        expandedDate={expandedDate}
        description={video.description}
      />
    </div>
  );
};
