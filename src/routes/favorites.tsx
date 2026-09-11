import { Link, createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/empty-state";
import { TrackRow } from "@/components/track-row";
import { Button } from "@/components/ui/button";
import { getTracks } from "@/lib/needle/catalog";
import { currentTrackFrom, useNeedle } from "@/lib/needle/store";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
  head: () => ({ meta: [{ title: "Favorites · Needle" }] }),
});

function FavoritesPage() {
  const favorites = useNeedle((s) => s.favorites);
  const playNow = useNeedle((s) => s.playNow);
  const togglePlay = useNeedle((s) => s.togglePlay);
  const toggleFavorite = useNeedle((s) => s.toggleFavorite);
  const playTracks = useNeedle((s) => s.playTracks);
  const queue = useNeedle((s) => s.queue);
  const queueIndex = useNeedle((s) => s.queueIndex);
  const playback = useNeedle((s) => s.playback);
  const current = currentTrackFrom({ queue, queueIndex });
  const tracks = getTracks(favorites);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Favorites</h1>
          <p className="mt-1 text-sm text-muted">{tracks.length} saved as favorites</p>
        </div>
        <Button onClick={() => playTracks(favorites)} disabled={tracks.length === 0}>
          Play all
        </Button>
      </header>
      {tracks.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          body="Tap the heart on anything you want to keep close."
          action={
            <Button asChild>
              <Link to="/search">Search</Link>
            </Button>
          }
        />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {tracks.map((track) => {
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
                trailing={
                  <Button
                    variant="quiet"
                    size="sm"
                    onClick={() => toggleFavorite(track.id)}
                  >
                    Remove
                  </Button>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
