"use client";

import { Skeleton } from "@/components/ui/skeleton";
import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
  playbackId?: string | null | undefined;
  thumbnailUrl?: string | null | undefined;
  autoPlay?: boolean;
  onPlay?: () => void;
}

export const VideoPlayerSkeleton = () => {
  return <div className="aspect-video rounded-xl bg-black" />;
};

export const VideoPlayer = ({
  playbackId,
  thumbnailUrl,
  autoPlay,
  onPlay,
}: VideoPlayerProps) => {
  if (!playbackId) return null;

  return (
    <MuxPlayer
      playbackId={playbackId}
      poster={thumbnailUrl || "placeholder.svg"}
      thumbnailTime={0}
      playerInitTime={0}
      autoPlay={autoPlay}
      className="h-full w-full object-contain"
      accentColor="#FF2056"
      onPlay={onPlay}
    />
  );
};
