"use client";

import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
    playerbackId?: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
    autoPlay?: boolean;
    onPlay?: () => void;
}

export const VideoPlayer = ({
    playerbackId,
    thumbnailUrl,
    autoPlay,
    onPlay
}: VideoPlayerProps) => {
    if (!playerbackId) return null;

    return <MuxPlayer
        playbackId={playerbackId}
        poster={thumbnailUrl || "placeholder.svg"}
        thumbnailTime={0}
        playInitTime={0}
        autoPlay={autoPlay}
        className="w-full h-full object-contain"
        accentColor="#FF2056"
        onPlay={onPlay}
    />
}