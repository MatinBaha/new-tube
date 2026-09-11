import { cn } from "@/lib/utils";

interface UserPageBannerProps {
  className?: string;
}

export const UserPageBanner = ({ className }: UserPageBannerProps) => {
  return (
    <div
      className={cn(
        "relative w-full h-32 sm:h-44 md:h-52 lg:h-64 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-800 via-neutral-900 to-stone-900 select-none",
        className
      )}
    >
      {/* Visual background accents for modern YouTube aesthetic */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(239,68,68,0.25),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.2),transparent_40%)]" />
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:24px_24px]" />
    </div>
  );
};

export const UserPageBannerSkeleton = () => {
  return (
    <div className="w-full h-32 sm:h-44 md:h-52 lg:h-64 rounded-xl sm:rounded-2xl bg-muted animate-pulse" />
  );
};
