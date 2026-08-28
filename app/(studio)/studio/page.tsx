import { StuidoView } from '@/modules/studio/ui/view/studio-view';
import { trpc } from '@/trpc/server';
import { HydrateClient } from '@/trpc/server';
import { DEFAULT_LIMIT } from '@/constants';

export const dynamic = 'force-dynamic';

const StudioPage = async () => {
  void trpc.studio.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  }).catch(() => {});

  return (
    <HydrateClient>
      <StuidoView />
    </HydrateClient>
  );
};

export default StudioPage;
