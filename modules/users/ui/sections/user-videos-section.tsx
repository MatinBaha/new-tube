"use client";

import { useState, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Button } from "@/components/ui/button";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";

type VideoSort = "latest" | "popular" | "oldest";

interface UserVideosSectionProps {
  userId: string;
}

export const UserVideosSection = ({ userId }: UserVideosSectionProps) => {
  const [sort, setSort] = useState<VideoSort>("latest");

  return (
    <div className="space-y-6">
      {/* YouTube-style sorting filter chips */}
      <div className="flex items-center gap-2">
        <Button
          variant={sort === "latest" ? "default" : "secondary"}
          size="sm"
          className={cn("rounded-lg text-xs font-medium h-8 px-3")}
          onClick={() => setSort("latest")}
        >
          Latest
        </Button>
        <Button
          variant={sort === "popular" ? "default" : "secondary"}
          size="sm"
          className={cn("rounded-lg text-xs font-medium h-8 px-3")}
          onClick={() => setSort("popular")}
        >
          Popular
        </Button>
        <Button
          variant={sort === "oldest" ? "default" : "secondary"}
          size="sm"
          className={cn("rounded-lg text-xs font-medium h-8 px-3")}
          onClick={() => setSort("oldest")}
        >
          Oldest
        </Button>
      </div>

      <Suspense key={`${userId}-${sort}`} fallback={<UserVideosSectionSkeleton />}>
        <ErrorBoundary fallback={<p className="text-sm text-muted-foreground">Failed to load videos.</p>}>
          <UserVideosSectionSuspense userId={userId} sort={sort} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};

export const UserVideosSectionSkeleton = () => {
  return (
    <div>
      <div className="hidden gap-4 gap-y-10 sm:grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
      <div className="flex flex-col gap-4 sm:hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

const UserVideosSectionSuspense = ({
  userId,
  sort,
}: {
  userId: string;
  sort: VideoSort;
}) => {
  const [videos, query] = trpc.videos.getMany.useSuspenseInfiniteQuery(
    {
      userId,
      sort,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const allVideos = videos.pages.flatMap((page) => page.items);

  if (allVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-base font-medium text-foreground">This channel has no videos.</p>
        <p className="mt-1 text-sm text-muted-foreground">Uploads from this creator will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:hidden">
        {allVideos.map((video) => (
          <VideoRowCard key={video.id} data={video} size="default" />
        ))}
      </div>
      <div className="hidden gap-4 gap-y-10 sm:grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {allVideos.map((video) => (
          <VideoGridCard key={video.id} data={video} />
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
