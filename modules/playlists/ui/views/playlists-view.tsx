"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaylistsSection } from "../sections/playlists-section";
import { PlaylistCreateModal } from "../components/playlist-create-modal";
import { useAuth, useClerk } from "@clerk/nextjs";

export const PlaylistsView = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const clerk = useClerk();

  const handleCreateClick = () => {
    if (!isSignedIn) {
      return clerk.openSignIn();
    }
    setCreateOpen(true);
  };

  return (
    <>
      <PlaylistCreateModal open={createOpen} onOpenChange={setCreateOpen} />
      <div className="mx-auto mb-10 flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Playlists</h1>
            <p className="text-xs text-muted-foreground">
              Playlists you created or saved
            </p>
          </div>
          <Button
            onClick={handleCreateClick}
            size="sm"
            className="rounded-full gap-2 text-xs font-semibold"
          >
            <PlusIcon className="size-4" />
            New playlist
          </Button>
        </div>
        <PlaylistsSection />
      </div>
    </>
  );
};
