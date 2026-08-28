import Link from "next/link";
import { CommentsGetManyOutput } from "../../types";
import UserAvatar from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { trpc } from "@/trpc/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MessageSquareIcon,
  MoreVerticalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CommentItemProps {
  comment: CommentsGetManyOutput["items"][number];
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const { userId } = useAuth();
  const clerk = useClerk();
  const utils = trpc.useUtils();
  const remove = trpc.comments.remove.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted");
      utils.comments.getMany.invalidate();
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  const like = trpc.commentReactions.like.useMutation({
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
        return;
      }

      toast.error("Something went wrong");
    },
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
  });
  const dislike = trpc.commentReactions.dislike.useMutation({
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
        return;
      }

      toast.error("Something went wrong");
    },
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
  });
  return (
    <div>
      <div className="flex gap-4">
        <Link href={`/users/${comment.users.id}`}>
          <UserAvatar
            size="lg"
            imageUrl={comment.users.imageUrl}
            name={comment.users.name}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/users/${comment.users.id}`} className="">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="pb-0.5 text-sm font-medium">
                {comment.users.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="text-sm font-medium">{comment.comment}</p>
          </Link>
          <div className="itemms-center mt-1 flex gap-2">
            <div className="flex items-center">
              <Button
                disabled={like.isPending}
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => like.mutate({ commentId: comment.id })}
              >
                <ThumbsUpIcon
                  className={cn(
                    comment.viewerReaction === "like" && "fill-black"
                  )}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.likeCount}
              </span>
              <Button
                disabled={dislike.isPending}
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => dislike.mutate({ commentId: comment.id })}
              >
                <ThumbsDownIcon
                  className={cn(
                    comment.viewerReaction === "dislike" && "fill-black"
                  )}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.dislikeCount}
              </span>
            </div>
          </div>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {}}>
              <MessageSquareIcon className="mr-2 size-4" />
              Reply
            </DropdownMenuItem>
            {userId === comment.users.clerkId && (
              <DropdownMenuItem
                onClick={() => remove.mutate({ id: comment.id })}
              >
                <Trash2Icon className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
