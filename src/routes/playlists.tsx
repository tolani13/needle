import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CoverArt } from "@/components/cover-art";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getTrack, totalDuration } from "@/lib/needle/catalog";
import { formatDurationLong } from "@/lib/needle/format";
import { useNeedle } from "@/lib/needle/store";

export const Route = createFileRoute("/playlists")({
  component: PlaylistsPage,
  head: () => ({ meta: [{ title: "Playlists · Needle" }] }),
});

function PlaylistsPage() {
  const playlists = useNeedle((s) => s.playlists);
  const playlistOrder = useNeedle((s) => s.playlistOrder);
  const createPlaylist = useNeedle((s) => s.createPlaylist);
  const duplicatePlaylist = useNeedle((s) => s.duplicatePlaylist);
  const deletePlaylist = useNeedle((s) => s.deletePlaylist);
  const reorderPlaylists = useNeedle((s) => s.reorderPlaylists);
  const playTracks = useNeedle((s) => s.playTracks);
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const ordered = playlistOrder
    .map((id) => playlists.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Playlists</h1>
          <p className="mt-1 text-sm text-muted">
            Yours, on this device. Drag to reorder.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>New playlist</Button>
      </header>
      {ordered.length === 0 ? (
        <EmptyState
          title="No playlists yet"
          body="Make one for evenings, drives, or whatever you keep coming back to."
          action={<Button onClick={() => setCreateOpen(true)}>Create a playlist</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {ordered.map((pl, index) => {
            const cover = pl.trackIds[0] ? getTrack(pl.trackIds[0]) : undefined;
            return (
              <div
                key={pl.id}
                className="flex flex-col rounded-lg bg-surface p-3"
                draggable
                onDragStart={() => setDragFrom(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragFrom !== null) reorderPlaylists(dragFrom, index);
                  setDragFrom(null);
                }}
              >
                <Link to="/playlists/$id" params={{ id: pl.id }} className="min-w-0">
                  {cover ? (
                    <CoverArt track={cover} className="mb-3 aspect-square w-full rounded-md" />
                  ) : (
                    <div className="mb-3 aspect-square w-full rounded-md bg-elevated" />
                  )}
                  <p className="truncate font-medium">{pl.name}</p>
                  <p className="text-xs text-muted">
                    {pl.trackIds.length} items ·{" "}
                    {formatDurationLong(totalDuration(pl.trackIds))}
                  </p>
                </Link>
                <div className="mt-3 flex flex-wrap gap-1">
                  <Button size="sm" onClick={() => playTracks(pl.trackIds)}>
                    Play
                  </Button>
                  <Button
                    size="sm"
                    variant="quiet"
                    onClick={() => duplicatePlaylist(pl.id)}
                  >
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="quiet"
                    onClick={() => setPendingDelete(pl.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent title="New playlist">
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const id = createPlaylist(name);
              if (id) {
                setName("");
                setCreateOpen(false);
                void navigate({ to: "/playlists/$id", params: { id } });
              }
            }}
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Evening Desk"
              aria-label="Playlist name"
              autoFocus
            />
            <Button type="submit" disabled={!name.trim()}>
              Create
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent title="Delete playlist?">
          <p className="mb-4 text-sm text-muted">
            This removes the playlist from this device. The items stay in your library.
          </p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={() => {
                if (pendingDelete) deletePlaylist(pendingDelete);
                setPendingDelete(null);
              }}
            >
              Delete
            </Button>
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Keep it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
