import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { TrackRow } from "@/components/track-row";
import { Input } from "@/components/ui/input";
import { getMediaProvider } from "@/lib/needle/provider";
import type { Track } from "@/lib/needle/types";
import { currentTrackFrom, useNeedle } from "@/lib/needle/store";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  head: () => ({ meta: [{ title: "Search · Needle" }] }),
});

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const playNow = useNeedle((s) => s.playNow);
  const togglePlay = useNeedle((s) => s.togglePlay);
  const queue = useNeedle((s) => s.queue);
  const queueIndex = useNeedle((s) => s.queueIndex);
  const playback = useNeedle((s) => s.playback);
  const current = currentTrackFrom({ queue, queueIndex });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getMediaProvider()
      .search(query)
      .then((tracks) => {
        if (!cancelled) setResults(tracks);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const label = useMemo(() => {
    if (!query.trim()) return "Suggested";
    return `${results.length} result${results.length === 1 ? "" : "s"}`;
  }, [query, results.length]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:px-8">
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight">Search</h1>
        <p className="mt-1 text-sm text-muted">
          Instant results from the offline catalog.
        </p>
      </header>
      <Input
        ref={inputRef}
        id="catalog-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Titles, names, rooms…"
        aria-label="Search the catalog"
      />
      <p className="text-xs tracking-wide text-subtle uppercase">{label}</p>
      {results.length === 0 ? (
        <EmptyState
          title="No matches"
          body="Try a title or a name from the demo catalog — Copper, Harbor, Quiet."
        />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {results.map((track) => {
            const isCurrent = current?.id === track.id;
            return (
              <TrackRow
                key={track.id}
                track={track}
                current={isCurrent}
                playing={isCurrent && playback.playing}
                onPlay={() => {
                  if (isCurrent) togglePlay();
                  else playNow(track.id);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
