"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "../ui/components/video-row-card";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "../ui/components/video-grid-card";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface SuggestionsSectionProps {
  videoId: string;
}

export const SuggestionsSection = ({ videoId }: SuggestionsSectionProps) => {
  return (
    <Suspense fallback={<SuggestionsSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <SuggestionsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const SuggestionsSectionSkeleton = () => {
  return (
    <>
      <div className="hidden space-y-3 md:block">
        {Array.from({ length: 8 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} size="compact" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {Array.from({ length: 10 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
};

const SuggestionsSectionSuspense = ({ videoId }: SuggestionsSectionProps) => {
  const [suggestions, query] =
    trpc.suggestions.getMany.useSuspenseInfiniteQuery(
      {
        videoId,
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  return (
    <>
      <div className="mt-2 hidden flex-col gap-4 md:flex">
        {suggestions.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoRowCard size="compact" key={video.id} data={video} />
          ))}
        <InfiniteScroll
          isManual
          fetchNextPage={query.fetchNextPage}
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
        />
      </div>
      <div className="mt-2 flex flex-col gap-4 md:hidden">
        {suggestions.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard key={video.id} data={video} />
          ))}
        <InfiniteScroll
          isManual
          fetchNextPage={query.fetchNextPage}
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
        />
      </div>
    </>
  );
};
