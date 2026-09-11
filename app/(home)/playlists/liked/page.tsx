import { DEFAULT_LIMIT } from "@/constants";
import { LikedView } from "@/modules/home/ui/views/liked-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const Page = async () => {
  void trpc.videos.getManyLiked
    .prefetchInfinite({
      limit: DEFAULT_LIMIT,
    })
    .catch(() => {});

  return (
    <HydrateClient>
      <LikedView />
    </HydrateClient>
  );
};

export default Page;
