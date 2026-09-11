"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { format } from "date-fns";
import placeholder from "@/public/placeholder.svg";
import {
  ListVideoIcon,
  LockIcon,
  MoreVerticalIcon,
  PencilIcon,
  PlayIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/user-avatar";
import { trpc } from "@/trpc/client";

interface PlaylistHeaderCardProps {
  playlist: {
    id: string;
    name: string;
    description?: string | null;
    userId: string;
    videoCount: number;
    thumbnailUrl?: string | null;
    firstVideoId?: string | null;
    updatedAt: Date;
    user: {
      id: string;
      name: string;
      imageUrl: string;
    };
  };
}

export const PlaylistHeaderCard = ({ playlist }: PlaylistHeaderCardProps) => {
  const router = useRouter();
  const { userId: clerkUserId } = useAuth();
  const utils = trpc.useUtils();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editName, setEditName] = useState(playlist.name);
  const [editDescription, setEditDescription] = useState(
    playlist.description || ""
  );

  const isOwner = playlist.user.id === clerkUserId; // Or if the caller created it

  const updateMutation = trpc.playlists.update.useMutation({
    onSuccess: () => {
      toast.success("Playlist updated");
      utils.playlists.getOne.invalidate({ id: playlist.id });
      utils.playlists.getMany.invalidate();
      setIsEditOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update playlist");
    },
  });

  const deleteMutation = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist deleted");
      utils.playlists.getMany.invalidate();
      router.push("/playlists");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete playlist");
    },
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateMutation.mutate({
      id: playlist.id,
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    });
  };

  const playHref = playlist.firstVideoId
    ? `/videos/${playlist.firstVideoId}`
    : `/playlists/${playlist.id}`;

  return (
    <>
      <div className="flex w-full flex-col gap-5 rounded-2xl bg-gradient-to-b from-muted/80 to-muted/20 p-5 backdrop-blur-md border border-border/50 lg:w-[360px] xl:w-[380px] lg:sticky lg:top-20">
        {/* Cover thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-md">
          <Image
            src={playlist.thumbnailUrl ?? placeholder}
            alt={playlist.name}
            fill
            className="size-full object-cover"
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-md bg-black/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <ListVideoIcon className="size-3.5" />
            <span>
              {playlist.videoCount}{" "}
              {playlist.videoCount === 1 ? "video" : "videos"}
            </span>
          </div>
        </div>

        {/* Playlist metadata */}
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold tracking-tight">{playlist.name}</h1>

          {playlist.description && (
            <p className="line-clamp-3 text-xs text-muted-foreground whitespace-pre-line">
              {playlist.description}
            </p>
          )}

          <div className="mt-1 flex items-center gap-2">
            <UserAvatar
              imageUrl={playlist.user.imageUrl}
              name={playlist.user.name}
              className="size-6"
            />
            <span className="text-xs font-medium">{playlist.user.name}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <LockIcon className="size-3" />
            <span>Private</span>
            <span>•</span>
            <span>{playlist.videoCount} videos</span>
            <span>•</span>
            <span>Updated {format(new Date(playlist.updatedAt), "PP")}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            asChild
            disabled={playlist.videoCount === 0}
            className="flex-1 rounded-full gap-2 font-medium"
          >
            <Link href={playHref}>
              <PlayIcon className="size-4 fill-current" />
              Play all
            </Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            className="rounded-full shadow-none"
          >
            <ShareIcon className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-none"
              >
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <PencilIcon className="size-4 mr-2" />
                Edit playlist
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2Icon className="size-4 mr-2" />
                Delete playlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit playlist</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Playlist title"
                disabled={updateMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={3}
                disabled={updateMutation.isPending}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={updateMutation.isPending}
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!editName.trim() || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete playlist</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{playlist.name}</strong>?
            This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={deleteMutation.isPending}
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate({ id: playlist.id })}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
