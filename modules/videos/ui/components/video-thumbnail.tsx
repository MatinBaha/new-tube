import Image from "next/image";
import placeholder from "@/public/placeholder.svg";
import { formatDuration } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoThumbnailProps {
  imageUrl?: string | null;
  title: string;
  previewUrl?: string | null;
  duration: number;
}

export const VideoThumbnailSkeleton = () => {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
      <Skeleton className="size-full" />
    </div>
  );
};

export const VideoThumbnail = ({
  imageUrl,
  previewUrl,
  title,
  duration,
}: VideoThumbnailProps) => {
  return (
    <div className="group relative">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        <Image
          src={imageUrl ?? placeholder}
          alt={title}
          fill
          className="h-full w-full object-cover group-hover:opacity-0"
        />
        <Image
          src={previewUrl ?? placeholder}
          alt={title}
          fill
          className="h-full w-full object-cover opacity-0 group-hover:opacity-100"
        />
      </div>

      <div className="absolute bottom-2 right-2 rounded bg-black px-1 py-0.5 text-xs font-medium text-white">
        {formatDuration(duration)}
      </div>
    </div>
  );
};
