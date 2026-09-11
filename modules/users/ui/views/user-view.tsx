"use client";

import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { trpc } from "@/trpc/client";
import { UserPageBanner, UserPageBannerSkeleton } from "../components/user-page-banner";
import {
  UserPageHeader,
  UserPageHeaderSkeleton,
} from "../components/user-page-header";
import { UserPageTab, UserPageTabs } from "../components/user-page-tabs";
import { UserVideosSection } from "../sections/user-videos-section";
import { UserPlaylistsSection } from "../sections/user-playlists-section";
import { UserAboutSection } from "../sections/user-about-section";

interface UserViewProps {
  userId: string;
}

export const UserView = ({ userId }: UserViewProps) => {
  return (
    <div className="mx-auto mb-10 flex max-w-[2400px] flex-col gap-6 px-4 md:px-8 pt-2.5">
      <Suspense fallback={<UserViewSkeleton />}>
        <ErrorBoundary fallback={<UserViewErrorFallback />}>
          <UserViewSuspense userId={userId} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};

const UserViewErrorFallback = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-xl font-bold text-foreground">User not found</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This channel does not exist or may have been removed.
      </p>
    </div>
  );
};

const UserViewSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      <UserPageBannerSkeleton />
      <UserPageHeaderSkeleton />
    </div>
  );
};

const UserViewSuspense = ({ userId }: { userId: string }) => {
  const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });
  const [activeTab, setActiveTab] = useState<UserPageTab>("videos");

  return (
    <div className="flex flex-col gap-6">
      {/* YouTube Banner Placeholder */}
      <UserPageBanner />

      {/* Channel Header (Avatar, Name, Handle, Subscriber count, Actions) */}
      <UserPageHeader user={user} onSelectAbout={() => setActiveTab("about")} />

      {/* Navigation Tabs (Videos, Playlists, About) */}
      <UserPageTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* Active Tab Panel */}
      <div className="mt-2">
        {activeTab === "videos" && <UserVideosSection userId={user.id} />}
        {activeTab === "playlists" && <UserPlaylistsSection userId={user.id} />}
        {activeTab === "about" && <UserAboutSection user={user} />}
      </div>
    </div>
  );
};
