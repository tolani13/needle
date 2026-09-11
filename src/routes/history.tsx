import { Link, createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/empty-state";
import { TrackRow } from "@/components/track-row";
import { Button } from "@/components/ui/button";
import { getTrack } from "@/lib/needle/catalog";
import { currentTrackFrom, useNeedle } from "@/lib/needle/store";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "History · Needle" }] }),
});

function HistoryPage() {
  const history = useNeedle((s) => s.history);
  const playNow = useNeedle((s) => s.playNow);
  const togglePlay = useNeedle((s) => s.togglePlay);
  const queue = useNeedle((s) => s.queue);
  const queueIndex = useNeedle((s) => s.queueIndex);
  const playback = useNeedle((s) => s.playback);
  const current = currentTrackFrom({ queue, queueIndex });
  const rows = history
    .map((entry) => {
      const track = getTrack(entry.trackId);
      return track ? { ...entry, track } : null;
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:px-8">
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight">History</h1>
        <p className="mt-1 text-sm text-muted">
          Recently played on this device. Nothing leaves this library.
        </p>
      </header>
      {rows.length === 0 ? (
        <EmptyState
          title="No history yet"
          body="Play something and it will show up here."
          action={
            <Button asChild>
              <Link to="/search">Search</Link>
            </Button>
          }
        />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {rows.map((row) => {
            const isCurrent = current?.id === row.track.id;
            const when = new Date(row.playedAt);
            return (
              <TrackRow
                key={`${row.track.id}-${row.playedAt}`}
                track={row.track}
                current={isCurrent}
                playing={isCurrent && playback.playing}
                onPlay={() => {
                  if (isCurrent) togglePlay();
                  else playNow(row.track.id);
                }}
                trailing={
                  <span className="hidden text-xs text-subtle sm:inline">
                    {when.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
