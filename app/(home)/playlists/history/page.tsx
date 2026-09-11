import { DEFAULT_LIMIT } from "@/constants";
import { HistoryView } from "@/modules/home/ui/views/history-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const Page = async () => {
  void trpc.videos.getManyHistory
    .prefetchInfinite({
      limit: DEFAULT_LIMIT,
    })
    .catch(() => {});

  return (
    <HydrateClient>
      <HistoryView />
    </HydrateClient>
  );
};

export default Page;
