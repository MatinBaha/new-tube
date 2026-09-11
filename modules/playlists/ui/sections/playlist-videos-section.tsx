"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import { ListVideoIcon } from "lucide-react";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";

interface PlaylistVideosSectionProps {
  playlistId: string;
}

export const PlaylistVideosSection = ({
  playlistId,
}: PlaylistVideosSectionProps) => {
  return (
    <Suspense fallback={<PlaylistVideosSectionSkeleton />}>
      <ErrorBoundary fallback={<PlaylistVideosSectionErrorFallback />}>
        <PlaylistVideosSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const PlaylistVideosSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <VideoRowCardSkeleton key={i} size="default" />
      ))}
    </div>
  );
};

export const PlaylistVideosSectionErrorFallback = () => {
  return (
    <div className="flex min-h-[30vh] items-center justify-center text-center">
      <p className="text-sm text-muted-foreground">Error loading playlist videos.</p>
    </div>
  );
};

const PlaylistVideosSectionSuspense = ({
  playlistId,
}: PlaylistVideosSectionProps) => {
  const utils = trpc.useUtils();

  const [videos, query] = trpc.playlists.getVideos.useSuspenseInfiniteQuery(
    {
      playlistId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const removeVideoMutation = trpc.playlists.removeVideo.useMutation({
    onSuccess: () => {
      toast.success("Video removed from playlist");
      utils.playlists.getVideos.invalidate({ playlistId });
      utils.playlists.getOne.invalidate({ id: playlistId });
      utils.playlists.getMany.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove video");
    },
  });

  const allVideos = videos.pages.flatMap((page) => page.items);

  if (allVideos.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center px-4">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
          <ListVideoIcon className="size-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No videos in this playlist</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">
          Add videos by clicking the 3-dot menu on any video and selecting &quot;Add to Playlist&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {allVideos.map((video) => (
        <VideoRowCard
          key={video.id}
          data={video}
          size="default"
          onRemove={() =>
            removeVideoMutation.mutate({ playlistId, videoId: video.id })
          }
        />
      ))}
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};
