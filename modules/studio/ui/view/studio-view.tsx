import { VideosSection } from '../sections/videos.section';

export const StuidoView = () => {
  return (
    <div className="flex flex-col gap-y-6 pt-2.5">
      <div className="px-4">
        <h1 className="text-2xl font-bold">Channel content</h1>
        <p className="text-xs text-muted-foreground">
          Manage you channel content and videos
        </p>
      </div>
      <VideosSection />
    </div>
  );
};
