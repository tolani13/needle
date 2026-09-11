import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { TrackRow } from "@/components/track-row";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getTracks, totalDuration } from "@/lib/needle/catalog";
import { formatDurationLong } from "@/lib/needle/format";
import { currentTrackFrom, useNeedle } from "@/lib/needle/store";

export const Route = createFileRoute("/playlists/$id")({
  component: PlaylistDetailPage,
  head: () => ({ meta: [{ title: "Playlist · Needle" }] }),
});

function PlaylistDetailPage() {
  const { id } = Route.useParams();
  const playlists = useNeedle((s) => s.playlists);
  const playlist = playlists.find((p) => p.id === id);
  const renamePlaylist = useNeedle((s) => s.renamePlaylist);
  const duplicatePlaylist = useNeedle((s) => s.duplicatePlaylist);
  const deletePlaylist = useNeedle((s) => s.deletePlaylist);
  const removeFromPlaylist = useNeedle((s) => s.removeFromPlaylist);
  const reorderPlaylistTracks = useNeedle((s) => s.reorderPlaylistTracks);
  const playTracks = useNeedle((s) => s.playTracks);
  const playNow = useNeedle((s) => s.playNow);
  const togglePlay = useNeedle((s) => s.togglePlay);
  const queue = useNeedle((s) => s.queue);
  const queueIndex = useNeedle((s) => s.queueIndex);
  const playback = useNeedle((s) => s.playback);
  const current = currentTrackFrom({ queue, queueIndex });
  const navigate = useNavigate();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(playlist?.name ?? "");
  const [pendingDelete, setPendingDelete] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  if (!playlist) {
    return (
      <div className="px-4 py-8 md:px-8">
        <EmptyState
          title="Playlist missing"
          body="It may have been deleted."
          action={
            <Button asChild>
              <Link to="/playlists">Back to playlists</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const tracks = getTracks(playlist.trackIds);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:px-8">
      <p className="text-sm text-muted">
        <Link to="/playlists">Playlists</Link>
        <span className="text-subtle"> / </span>
        {playlist.name}
      </p>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">
            {playlist.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {tracks.length} items · {formatDurationLong(totalDuration(playlist.trackIds))}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => playTracks(playlist.trackIds)} disabled={tracks.length === 0}>
            Play all
          </Button>
          <Button variant="secondary" onClick={() => setRenaming(true)}>
            Rename
          </Button>
          <Button variant="secondary" onClick={() => duplicatePlaylist(playlist.id)}>
            Duplicate
          </Button>
          <Button variant="quiet" onClick={() => setPendingDelete(true)}>
            Delete
          </Button>
        </div>
      </header>
      {tracks.length === 0 ? (
        <EmptyState
          title="Empty playlist"
          body="Add items from Search or Library."
          action={
            <Button asChild>
              <Link to="/search">Search</Link>
            </Button>
          }
        />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {tracks.map((track, index) => {
            const isCurrent = current?.id === track.id;
            return (
              <TrackRow
                key={`${track.id}-${index}`}
                track={track}
                index={index}
                current={isCurrent}
                playing={isCurrent && playback.playing}
                onPlay={() => {
                  if (isCurrent) togglePlay();
                  else playNow(track.id);
                }}
                draggable
                onDragStart={() => setDragFrom(index)}
                onDrop={() => {
                  if (dragFrom !== null) {
                    reorderPlaylistTracks(playlist.id, dragFrom, index);
                  }
                  setDragFrom(null);
                }}
                trailing={
                  <Button
                    variant="quiet"
                    size="sm"
                    onClick={() => removeFromPlaylist(playlist.id, index)}
                  >
                    Remove
                  </Button>
                }
              />
            );
          })}
        </div>
      )}

      <Dialog open={renaming} onOpenChange={setRenaming}>
        <DialogContent title="Rename playlist">
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              renamePlaylist(playlist.id, name);
              setRenaming(false);
            }}
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Playlist name"
              autoFocus
            />
            <Button type="submit" disabled={!name.trim()}>
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDelete} onOpenChange={setPendingDelete}>
        <DialogContent title="Delete playlist?">
          <p className="mb-4 text-sm text-muted">
            {playlist.name} will be removed from this device.
          </p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={() => {
                deletePlaylist(playlist.id);
                void navigate({ to: "/playlists" });
              }}
            >
              Delete
            </Button>
            <Button variant="secondary" onClick={() => setPendingDelete(false)}>
              Keep it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
