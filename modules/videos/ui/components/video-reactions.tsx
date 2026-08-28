import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { VideoGetOneOutput } from "../../types";
import { useClerk } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface VideoReactionsProps {
  videoId: string;
  likes: number;
  dislikes: number;
  viewerReaction: VideoGetOneOutput["viewerReaction"];
}

export const VideoReactions = ({
  likes,
  dislikes,
  viewerReaction,
  videoId,
}: VideoReactionsProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const like = trpc.videoReactions.like.useMutation({
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
        return;
      }

      toast.error("Something went wrong");
    },
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
    },
  });
  const dislike = trpc.videoReactions.dislike.useMutation({
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
        return;
      }

      toast.error("Something went wrong");
    },
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
    },
  });

  return (
    <div className="flex flex-none items-center">
      <Button
        onClick={() => like.mutate({ videoId })}
        disabled={like.isPending || dislike.isPending}
        variant="secondary"
        className="gap-2 rounded-l-full rounded-r-none pr-4"
      >
        <ThumbsUpIcon
          className={cn("size-5", viewerReaction === "like" && "fill-black")}
        />
        {likes}
      </Button>
      <Separator orientation="vertical" className="h-7" />
      <Button
        onClick={() => dislike.mutate({ videoId })}
        disabled={like.isPending || dislike.isPending}
        variant="secondary"
        className="rounded-l-none rounded-r-full pl-3"
      >
        <ThumbsDownIcon
          className={cn("size-5", viewerReaction === "dislike" && "fill-black")}
        />
        {dislikes}
      </Button>
    </div>
  );
};
