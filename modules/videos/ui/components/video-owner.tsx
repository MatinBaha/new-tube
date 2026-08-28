import Link from "next/link";
import { VideoGetOneOutput } from "../../types";
import UserAvatar from "@/components/user-avatar";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { useSubscroption } from "@/modules/subscriptions/hooks/use-subscription";
import { on } from "node:stream";

interface VideoOwnerProps {
  user: VideoGetOneOutput["user"];
  videoId: string;
}

export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
  const { userId, isLoaded } = useAuth();
  const { onClick, isPending } = useSubscroption({
    userId: user.id,
    isSubscribed: user.isSubscribed,
    fromVideoId: videoId,
  });

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 sm:items-start sm:justify-start">
      <Link href={`/users/${user.id}`}>
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar size="lg" name={user.name} imageUrl={user.imageUrl} />
          <div className="flex min-w-0 flex-col gap-1">
            <UserInfo name={user.name} size="lg" />
            <span className="line-clamp-1 text-sm text-muted-foreground">
              {user.subscriberCount} subscribers
            </span>
          </div>
        </div>
      </Link>
      {userId === user.clerkId ? (
        <Button variant="secondary" className="rounded-full" asChild>
          <Link href={`/studio/videos/${videoId}`}>Edit Video</Link>
        </Button>
      ) : (
        <SubscriptionButton
          onClick={onClick}
          disabled={isPending || !isLoaded}
          isSubscribed={user.isSubscribed}
          className="flex-none"
        />
      )}
    </div>
  );
};
