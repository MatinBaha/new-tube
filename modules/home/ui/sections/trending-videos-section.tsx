"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const TrendingVideosSection = () => {
  return (
    <Suspense fallback={<TrendingVideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <TrendingVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

export const TrendingVideosSectionSkeleton = () => {
  return (
    <div>
      <div className="hidden gap-4 gap-y-10 md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
        {Array.from({ length: 18 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
      <div className="flex flex-col gap-4 md:hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

const TrendingVideosSectionSuspense = () => {
  const isMobile = useIsMobile();
  const [videos, query] = trpc.videos.getManyTrending.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <>
      {isMobile ? (
        <div className="flex flex-col gap-4">
          {videos.pages
            .flatMap((page) => page.items)
            .map((video) => (
              <VideoRowCard key={video.id} data={video} size="default" />
            ))}
        </div>
      ) : (
        <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
          {videos.pages
            .flatMap((page) => page.items)
            .map((video) => (
              <VideoGridCard key={video.id} data={video} />
            ))}
        </div>
      )}
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};
