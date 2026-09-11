"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { ListVideoIcon, UserCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import {
  PlaylistGridCard,
  PlaylistGridCardSkeleton,
} from "../components/playlist-grid-card";

export const PlaylistsSection = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <PlaylistsSectionSkeleton />;
  }

  if (!isSignedIn) {
    return <PlaylistsNotSignedInFallback />;
  }

  return (
    <Suspense fallback={<PlaylistsSectionSkeleton />}>
      <ErrorBoundary fallback={<PlaylistsErrorFallback />}>
        <PlaylistsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

export const PlaylistsNotSignedInFallback = () => {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
        <ListVideoIcon className="size-8 text-muted-foreground" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">Keep track of your playlists</h2>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Playlists aren&apos;t viewable when signed out.
      </p>
      <SignInButton mode="modal">
        <Button
          variant="outline"
          className="rounded-full px-4 py-2 text-sm font-medium text-blue-600 shadow-none hover:text-blue-500"
        >
          <UserCircleIcon className="mr-2 size-4" />
          Sign in
        </Button>
      </SignInButton>
    </div>
  );
};

export const PlaylistsErrorFallback = () => {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm text-muted-foreground">Error loading playlists.</p>
    </div>
  );
};

export const PlaylistsSectionSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <PlaylistGridCardSkeleton key={index} />
      ))}
    </div>
  );
};

const PlaylistsSectionSuspense = () => {
  const utils = trpc.useUtils();

  const [historyVideos] = trpc.videos.getManyHistory.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const [likedVideos] = trpc.videos.getManyLiked.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const [customPlaylists] = trpc.playlists.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const removePlaylistMutation = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist deleted");
      utils.playlists.getMany.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete playlist");
    },
  });

  const historyItems = historyVideos.pages.flatMap((page) => page.items);
  const likedItems = likedVideos.pages.flatMap((page) => page.items);
  const userPlaylists = customPlaylists.pages.flatMap((page) => page.items);

  const systemPlaylists = [
    {
      title: "Liked videos",
      href: "/playlists/liked",
      playHref: likedItems[0] ? `/videos/${likedItems[0].id}` : "/playlists/liked",
      videoCount: likedItems.length,
      thumbnailUrl: likedItems[0]?.thumbnailUrl,
    },
    {
      title: "Watch history",
      href: "/playlists/history",
      playHref: historyItems[0] ? `/videos/${historyItems[0].id}` : "/playlists/history",
      videoCount: historyItems.length,
      thumbnailUrl: historyItems[0]?.thumbnailUrl,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
      {systemPlaylists.map((playlist) => (
        <PlaylistGridCard
          key={playlist.href}
          title={playlist.title}
          href={playlist.href}
          playHref={playlist.playHref}
          videoCount={playlist.videoCount}
          thumbnailUrl={playlist.thumbnailUrl}
        />
      ))}
      {userPlaylists.map((playlist) => (
        <PlaylistGridCard
          key={playlist.id}
          playlistId={playlist.id}
          title={playlist.name}
          href={`/playlists/${playlist.id}`}
          playHref={
            playlist.firstVideoId
              ? `/videos/${playlist.firstVideoId}`
              : `/playlists/${playlist.id}`
          }
          videoCount={playlist.videoCount}
          thumbnailUrl={playlist.thumbnailUrl}
          onRemove={() => removePlaylistMutation.mutate({ id: playlist.id })}
        />
      ))}
    </div>
  );
};
