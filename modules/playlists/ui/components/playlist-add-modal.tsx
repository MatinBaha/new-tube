"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckIcon, ListPlusIcon, Loader2Icon, LockIcon, PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/client";
import { useAuth, useClerk } from "@clerk/nextjs";

interface PlaylistAddModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlaylistAddModal = ({
  videoId,
  open,
  onOpenChange,
}: PlaylistAddModalProps) => {
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const { data: playlists, isLoading } = trpc.playlists.getManyForVideo.useQuery(
    { videoId },
    { enabled: open && !!isSignedIn }
  );

  const addVideoMutation = trpc.playlists.addVideo.useMutation({
    onSuccess: (_, variables) => {
      utils.playlists.getManyForVideo.invalidate({ videoId });
      utils.playlists.getMany.invalidate();
      const playlist = playlists?.find((p) => p.id === variables.playlistId);
      toast.success(`Saved to ${playlist?.name ?? "playlist"}`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add video");
    },
  });

  const removeVideoMutation = trpc.playlists.removeVideo.useMutation({
    onSuccess: (_, variables) => {
      utils.playlists.getManyForVideo.invalidate({ videoId });
      utils.playlists.getMany.invalidate();
      const playlist = playlists?.find((p) => p.id === variables.playlistId);
      toast.success(`Removed from ${playlist?.name ?? "playlist"}`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove video");
    },
  });

  const createMutation = trpc.playlists.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Created & saved to ${data.name}`);
      utils.playlists.getManyForVideo.invalidate({ videoId });
      utils.playlists.getMany.invalidate();
      setNewTitle("");
      setIsCreating(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create playlist");
    },
  });

  const handleToggle = (playlistId: string, currentlyContains: boolean) => {
    if (currentlyContains) {
      removeVideoMutation.mutate({ playlistId, videoId });
    } else {
      addVideoMutation.mutate({ playlistId, videoId });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createMutation.mutate({
      name: newTitle.trim(),
      videoId,
    });
  };

  if (!isSignedIn) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Save video</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Sign in to add this video to a playlist.
            </p>
            <Button
              onClick={() => {
                onOpenChange(false);
                clerk.openSignIn();
              }}
            >
              Sign in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-5">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="text-base font-semibold">
            Save video to...
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : playlists && playlists.length > 0 ? (
            playlists.map((playlist) => {
              const isChecked = playlist.containsVideo;
              const isPending =
                addVideoMutation.isPending || removeVideoMutation.isPending;

              return (
                <button
                  key={playlist.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleToggle(playlist.id, isChecked)}
                  className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-muted/80 text-left transition-colors"
                >
                  <div
                    className={`size-4 rounded flex items-center justify-center border transition-colors ${
                      isChecked
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/40 bg-transparent"
                    }`}
                  >
                    {isChecked && <CheckIcon className="size-3" />}
                  </div>
                  <span className="text-sm font-medium flex-1 truncate">
                    {playlist.name}
                  </span>
                  <LockIcon className="size-3.5 text-muted-foreground" />
                </button>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground py-2 text-center">
              No playlists yet
            </p>
          )}
        </div>

        {/* Create playlist inline form / button */}
        <div className="border-t pt-3">
          {isCreating ? (
            <form onSubmit={handleCreate} className="space-y-3">
              <Input
                placeholder="Enter playlist title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                disabled={createMutation.isPending}
                className="h-9 text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setNewTitle("");
                  }}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newTitle.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="w-full justify-start gap-2 text-sm font-medium"
            >
              <PlusIcon className="size-4" />
              Create new playlist
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
