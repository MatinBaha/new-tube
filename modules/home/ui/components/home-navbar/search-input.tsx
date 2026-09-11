"use client";

import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export const SearchInput = () => {
  const router = useRouter();
  const [value, setValue] = useState("");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = new URL(
      "/search",
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : window.location.origin
    );
    const newQuery = value.trim();
    url.searchParams.set("query", encodeURIComponent(newQuery));

    if (newQuery === "") {
      url.searchParams.delete("query");
    }

    setValue(newQuery);
    router.push(url.toString());
  };

  return (
    <form className="flex w-full max-w-[600px]" onSubmit={handleSearch}>
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-l-full border border-border bg-background py-2 pl-4 pr-12 text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setValue("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-4" />
          </Button>
        )}
      </div>
      <button
        disabled={!value.trim()}
        type="submit"
        className="flex items-center justify-center rounded-r-full border border-l-0 border-border bg-muted px-5 py-2.5 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SearchIcon className="size-5" />
      </button>
    </form>
  );
};
