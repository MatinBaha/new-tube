"use client";

import { cn } from "@/lib/utils";

export type UserPageTab = "videos" | "playlists" | "about";

interface UserPageTabsProps {
  activeTab: UserPageTab;
  onChange: (tab: UserPageTab) => void;
}

const tabs: { id: UserPageTab; label: string }[] = [
  { id: "videos", label: "Videos" },
  { id: "playlists", label: "Playlists" },
  { id: "about", label: "About" },
];

export const UserPageTabs = ({ activeTab, onChange }: UserPageTabsProps) => {
  return (
    <div className="border-b border-border/70">
      <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Channel Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "whitespace-nowrap py-3.5 px-2 text-sm font-medium border-b-2 transition-colors",
                isActive
                  ? "border-foreground text-foreground font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
