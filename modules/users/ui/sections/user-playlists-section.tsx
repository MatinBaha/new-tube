"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { formatDistanceToNow } from "date-fns";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import {
  PlaylistGridCard,
  PlaylistGridCardSkeleton,
} from "@/modules/playlists/ui/components/playlist-grid-card";
import { trpc } from "@/trpc/client";

interface UserPlaylistsSectionProps {
  userId: string;
}

export const UserPlaylistsSection = ({ userId }: UserPlaylistsSectionProps) => {
  return (
    <Suspense fallback={<UserPlaylistsSectionSkeleton />}>
      <ErrorBoundary fallback={<p className="text-sm text-muted-foreground">Failed to load playlists.</p>}>
        <UserPlaylistsSectionSuspense userId={userId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const UserPlaylistsSectionSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <PlaylistGridCardSkeleton key={index} />
      ))}
    </div>
  );
};

const UserPlaylistsSectionSuspense = ({ userId }: { userId: string }) => {
  const [playlists, query] = trpc.playlists.getManyByUserId.useSuspenseInfiniteQuery(
    {
      userId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const allPlaylists = playlists.pages.flatMap((page) => page.items);

  if (allPlaylists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-base font-medium text-foreground">This channel has no playlists.</p>
        <p className="mt-1 text-sm text-muted-foreground">Playlists created by this user will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {allPlaylists.map((playlist) => (
          <PlaylistGridCard
            key={playlist.id}
            title={playlist.name}
            href={`/playlists/${playlist.id}`}
            playHref={
              playlist.firstVideoId
                ? `/videos/${playlist.firstVideoId}?playlistId=${playlist.id}`
                : undefined
            }
            videoCount={playlist.videoCount}
            thumbnailUrl={playlist.thumbnailUrl}
            playlistId={playlist.id}
            updatedAt={
              playlist.updatedAt
                ? formatDistanceToNow(new Date(playlist.updatedAt), { addSuffix: true })
                : null
            }
          />
        ))}
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};
