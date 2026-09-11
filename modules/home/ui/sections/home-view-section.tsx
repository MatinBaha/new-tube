"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
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

interface HomeVideosSectionProps {
  categoryId?: string;
}

export const HomeViewSection = (props: HomeVideosSectionProps) => {
  return (
    <Suspense
      key={props.categoryId}
      fallback={<HomeViewSectionSkeleton />}
    >
      <ErrorBoundary fallback={<p>Error...</p>}>
        <HomeVideosSectionSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const HomeVideosSection = HomeViewSection;

export const HomeViewSectionSkeleton = () => {
  return (
    <div>
      <div className="hidden gap-4 gap-y-10 sm:grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 [@media(min-width:1920px)]:grid-cols-4">
        {Array.from({ length: 18 }).map((_, index) => (
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

export const HomeVideosSectionSkeleton = HomeViewSectionSkeleton;

const HomeVideosSectionSuspense = ({ categoryId }: HomeVideosSectionProps) => {
  const [videos, query] = trpc.videos.getMany.useSuspenseInfiniteQuery(
    {
      categoryId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <>
      <div className="flex flex-col gap-4 sm:hidden">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoRowCard key={video.id} data={video} size="default" />
          ))}
      </div>
      <div className="hidden gap-4 gap-y-10 sm:grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 [@media(min-width:1920px)]:grid-cols-4">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
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
