"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { Button } from "@/components/ui/button";
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
import { SignInButton, useAuth } from "@clerk/nextjs";
import { HistoryIcon, UserCircleIcon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const HistoryVideosSection = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <HistoryVideosSectionSkeleton />;
  }

  if (!isSignedIn) {
    return <HistoryVideosNotSignedInFallback />;
  }

  return (
    <Suspense fallback={<HistoryVideosSectionSkeleton />}>
      <ErrorBoundary fallback={<HistoryVideosErrorFallback />}>
        <HistoryVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

export const HistoryVideosNotSignedInFallback = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <HistoryIcon className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Keep track of what you watch</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Watch history isn&apos;t viewable when signed out.
      </p>
      <SignInButton mode="modal">
        <Button
          variant="outline"
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 rounded-full shadow-none"
        >
          <UserCircleIcon className="size-4 mr-2" />
          Sign in
        </Button>
      </SignInButton>
    </div>
  );
};

export const HistoryVideosErrorFallback = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <p className="text-sm text-muted-foreground">Error loading watch history.</p>
    </div>
  );
};

export const HistoryVideosSectionSkeleton = () => {
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

const HistoryVideosSectionSuspense = () => {
  const isMobile = useIsMobile();
  const [videos, query] =
    trpc.videos.getManyHistory.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const allVideos = videos.pages.flatMap((page) => page.items);

  if (allVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <HistoryIcon className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No watch history yet</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Videos you watch will show up here.
        </p>
      </div>
    );
  }

  return (
    <>
      {isMobile ? (
        <div className="flex flex-col gap-4">
          {allVideos.map((video) => (
            <VideoRowCard key={video.id} data={video} size="default" />
          ))}
        </div>
      ) : (
        <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
          {allVideos.map((video) => (
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
