import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DownloadIcon,
  ListPlusIcon,
  MoreVerticalIcon,
  SaveIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

interface VideoMenuProps {
  videoId: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
}

export const VideoMenu = ({
  videoId,
  variant = "ghost",
  onRemove,
}: VideoMenuProps) => {
  const onShare = () => {
    const fullUrl = `${process.env.VERCEL_URL || "http://localhost:3000"}/videos/${videoId}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link coppied to clipboard");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="icon" className="rounded-full">
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={onShare}>
          <ShareIcon />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}}>
          <ListPlusIcon />
          Add to Playlist
        </DropdownMenuItem>
        {onRemove && (
          <DropdownMenuItem onClick={() => {}}>
            <Trash2Icon />
            Remove
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {}}>
          <SaveIcon />
          Save video
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}}>
          <DownloadIcon />
          Download video
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
