"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { PlaylistHeaderCard } from "../components/playlist-header-card";
import {
  PlaylistVideosSection,
  PlaylistVideosSectionSkeleton,
} from "../sections/playlist-videos-section";

interface PlaylistViewProps {
  playlistId: string;
}

export const PlaylistView = ({ playlistId }: PlaylistViewProps) => {
  return (
    <div className="mx-auto mb-10 flex max-w-[2400px] flex-col gap-8 px-4 pt-2.5 lg:flex-row">
      <Suspense fallback={<PlaylistHeaderSkeleton />}>
        <ErrorBoundary fallback={<PlaylistHeaderErrorFallback />}>
          <PlaylistHeaderSuspense playlistId={playlistId} />
        </ErrorBoundary>
      </Suspense>

      <div className="flex-1 min-w-0">
        <PlaylistVideosSection playlistId={playlistId} />
      </div>
    </div>
  );
};

const PlaylistHeaderSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-5 rounded-2xl bg-muted/40 p-5 lg:w-[360px] xl:w-[380px]">
      <div className="relative aspect-video w-full">
        <Skeleton className="size-full rounded-xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  );
};

const PlaylistHeaderErrorFallback = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center p-8 text-center lg:w-[360px]">
      <p className="text-sm text-muted-foreground">Playlist not found.</p>
    </div>
  );
};

const PlaylistHeaderSuspense = ({ playlistId }: { playlistId: string }) => {
  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({
    id: playlistId,
  });

  return <PlaylistHeaderCard playlist={playlist} />;
};
