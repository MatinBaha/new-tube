import { DEFAULT_LIMIT } from "@/constants";
import { PlaylistsView } from "@/modules/playlists/ui/views/playlists-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const Page = async () => {
  void trpc.videos.getManyHistory
    .prefetchInfinite({
      limit: DEFAULT_LIMIT,
    })
    .catch(() => {});

  void trpc.videos.getManyLiked
    .prefetchInfinite({
      limit: DEFAULT_LIMIT,
    })
    .catch(() => {});

  void trpc.playlists.getMany
    .prefetchInfinite({
      limit: DEFAULT_LIMIT,
    })
    .catch(() => {});

  return (
    <HydrateClient>
      <PlaylistsView />
    </HydrateClient>
  );
};

export default Page;
