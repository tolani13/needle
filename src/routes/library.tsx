import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { TrackRow } from "@/components/track-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTrack } from "@/lib/needle/catalog";
import { currentTrackFrom, useNeedle } from "@/lib/needle/store";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
  head: () => ({ meta: [{ title: "Library · Needle" }] }),
});

type SortKey = "recent" | "title" | "channel" | "duration";

function LibraryPage() {
  const library = useNeedle((s) => s.library);
  const favorites = useNeedle((s) => s.favorites);
  const playNow = useNeedle((s) => s.playNow);
  const togglePlay = useNeedle((s) => s.togglePlay);
  const removeFromLibrary = useNeedle((s) => s.removeFromLibrary);
  const addToPlaylist = useNeedle((s) => s.addToPlaylist);
  const playlists = useNeedle((s) => s.playlists);
  const playlistOrder = useNeedle((s) => s.playlistOrder);
  const queue = useNeedle((s) => s.queue);
  const queueIndex = useNeedle((s) => s.queueIndex);
  const playback = useNeedle((s) => s.playback);
  const current = currentTrackFrom({ queue, queueIndex });
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [favOnly, setFavOnly] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const items = library
      .map((item) => {
        const track = getTrack(item.trackId);
        return track ? { ...item, track } : null;
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .filter((row) => (favOnly ? favorites.includes(row.track.id) : true))
      .filter((row) => {
        if (!q) return true;
        return (
          row.track.title.toLowerCase().includes(q) ||
          row.track.channel.toLowerCase().includes(q)
        );
      });
    items.sort((a, b) => {
      if (sort === "title") return a.track.title.localeCompare(b.track.title);
      if (sort === "channel") return a.track.channel.localeCompare(b.track.channel);
      if (sort === "duration") return a.track.durationSec - b.track.durationSec;
      return b.addedAt - a.addedAt;
    });
    return items;
  }, [library, filter, sort, favOnly, favorites]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Library</h1>
          <p className="mt-1 text-sm text-muted">{library.length} saved items</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSelecting((v) => !v);
            setSelected([]);
          }}
        >
          {selecting ? "Done" : "Select"}
        </Button>
      </header>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter saved items"
          aria-label="Filter library"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort library"
          className="h-11 rounded-md border border-border bg-elevated px-3 text-sm text-fg md:h-10"
        >
          <option value="recent">Recently saved</option>
          <option value="title">Title</option>
          <option value="channel">Name</option>
          <option value="duration">Duration</option>
        </select>
        <Button
          variant={favOnly ? "primary" : "secondary"}
          onClick={() => setFavOnly((v) => !v)}
        >
          Favorites
        </Button>
      </div>
      {selecting && selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
          <span className="text-sm">{selected.length} selected</span>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              removeFromLibrary(selected);
              setSelected([]);
            }}
          >
            Remove
          </Button>
          {playlistOrder[0] && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const id = playlistOrder[0]!;
                addToPlaylist(id, selected);
                setSelected([]);
              }}
            >
              Add to {playlists.find((p) => p.id === playlistOrder[0])?.name}
            </Button>
          )}
        </div>
      )}
      {rows.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          body="Save items from Search and they will live here, on this device."
          action={
            <Button asChild>
              <Link to="/search">Search the catalog</Link>
            </Button>
          }
        />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {rows.map((row) => {
            const isCurrent = current?.id === row.track.id;
            return (
              <TrackRow
                key={row.track.id}
                track={row.track}
                current={isCurrent}
                playing={isCurrent && playback.playing}
                selecting={selecting}
                selected={selected.includes(row.track.id)}
                onToggleSelect={() => toggleSelect(row.track.id)}
                onPlay={() => {
                  if (isCurrent) togglePlay();
                  else playNow(row.track.id);
                }}
                trailing={
                  selecting ? null : (
                    <Button
                      variant="quiet"
                      size="sm"
                      onClick={() => removeFromLibrary([row.track.id])}
                    >
                      Remove
                    </Button>
                  )
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
