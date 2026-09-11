import Image from "next/image";
import Link from "next/link";
import placeholder from "@/public/placeholder.svg";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ListVideoIcon,
  LockIcon,
  MoreVerticalIcon,
  PlayIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PlaylistGridCardProps {
  title: string;
  href: string;
  playHref?: string;
  videoCount: number;
  thumbnailUrl?: string | null;
  updatedAt?: string | null;
  playlistId?: string;
  onRemove?: () => void;
}

export const PlaylistGridCardSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="w-full">
        {/* Stacked layers */}
        <div className="mx-auto h-1 w-[92%] rounded-t-md bg-muted/60" />
        <div className="mx-auto h-1.5 w-[96%] rounded-t-md bg-muted/80" />
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          <Skeleton className="size-full" />
        </div>
      </div>
      <div className="mt-1 space-y-2">
        <Skeleton className="h-4 w-[75%]" />
        <Skeleton className="h-3 w-[50%]" />
        <Skeleton className="h-3 w-[40%]" />
      </div>
    </div>
  );
};

export const PlaylistGridCard = ({
  title,
  href,
  playHref,
  videoCount,
  thumbnailUrl,
  playlistId,
  onRemove,
}: PlaylistGridCardProps) => {
  const watchUrl = playHref || href;

  const onShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullUrl = `${window.location.origin}${href}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="group flex w-full flex-col gap-2">
      {/* Thumbnail with YouTube's iconic stacked-deck look */}
      <div className="relative w-full">
        {/* Stacked top deck layers */}
        <div className="mx-auto h-1 w-[92%] rounded-t-md bg-muted-foreground/15 transition-all group-hover:bg-muted-foreground/25" />
        <div className="mx-auto h-1.5 w-[96%] rounded-t-md bg-muted-foreground/25 transition-all group-hover:bg-muted-foreground/35" />

        <Link
          href={watchUrl}
          className="relative block aspect-video w-full overflow-hidden rounded-xl bg-muted"
        >
          <Image
            src={thumbnailUrl ?? placeholder}
            alt={title}
            fill
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* YouTube Video Count Badge (Bottom-Right) */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-md bg-black/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-opacity group-hover:opacity-0">
            <ListVideoIcon className="size-3.5" />
            <span>
              {videoCount} {videoCount === 1 ? "video" : "videos"}
            </span>
          </div>

          {/* YouTube "PLAY ALL" overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
            <PlayIcon className="size-4 fill-white text-white" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              Play all
            </span>
          </div>
        </Link>
      </div>

      {/* Playlist Details */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link href={href}>
            <h3 className="line-clamp-2 text-sm font-medium transition-colors hover:text-primary">
              {title}
            </h3>
          </Link>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <LockIcon className="size-3" />
            <span>Private</span>
            <span>•</span>
            <span>Playlist</span>
          </div>

          <Link
            href={href}
            className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            View full playlist
          </Link>
        </div>

        {(playlistId || onRemove) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={onShare}>
                <ShareIcon className="size-4 mr-2" />
                Share
              </DropdownMenuItem>
              {onRemove && (
                <DropdownMenuItem onClick={onRemove} className="text-destructive focus:text-destructive">
                  <Trash2Icon className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
