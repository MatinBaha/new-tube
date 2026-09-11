// i did not outsourced the video info section and it's currently in use in both the video-row-card and video-grid-card components.
// so this is just a skeleton to use

import { Skeleton } from "@/components/ui/skeleton";

export const VideoInfoSkeleton = () => {
  return (
    <div className="flex gap-3">
      <Skeleton className="size-10 flex-shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-[90%]" />
        <Skeleton className="h-5 w-[70%]" />
      </div>
    </div>
  );
};
