import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { TrackCard } from "@/components/track-row";
import { Button } from "@/components/ui/button";
import { getTrack, getTracks, totalDuration } from "@/lib/needle/catalog";
import { formatDurationLong, greetingForHour } from "@/lib/needle/format";
import { currentTrackFrom, useNeedle } from "@/lib/needle/store";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({ meta: [{ title: "Home · Needle" }] }),
});

function HomePage() {
  const navigate = useNavigate();
  const queue = useNeedle((s) => s.queue);
  const queueIndex = useNeedle((s) => s.queueIndex);
  const history = useNeedle((s) => s.history);
  const playlists = useNeedle((s) => s.playlists);
  const playlistOrder = useNeedle((s) => s.playlistOrder);
  const favorites = useNeedle((s) => s.favorites);
  const playback = useNeedle((s) => s.playback);
  const playNow = useNeedle((s) => s.playNow);
  const togglePlay = useNeedle((s) => s.togglePlay);
  const playTracks = useNeedle((s) => s.playTracks);
  const current = currentTrackFrom({ queue, queueIndex });
  const continueTrack = current ?? (history[0] ? getTrack(history[0].trackId) : undefined);
  const recentPlaylists = playlistOrder
    .map((id) => playlists.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);
  const favoriteTracks = getTracks(favorites).slice(0, 8);
  const hour = new Date().getHours();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm tracking-wide text-muted">{greetingForHour(hour)}</p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-tight md:text-5xl">
            Needle
          </h1>
        </div>
        <Button
          variant="secondary"
          className="h-12 justify-start gap-3 rounded-lg px-4 text-muted md:min-w-80"
          onClick={() => void navigate({ to: "/search" })}
        >
          <Search className="size-4" />
          Search the catalog
        </Button>
      </header>

      {continueTrack && (
        <section>
          <h2 className="mb-3 text-sm text-muted">Continue listening</h2>
          <div className="flex flex-col gap-4 rounded-xl bg-surface p-4 sm:flex-row sm:items-center">
            <CoverArt
              track={continueTrack}
              className="aspect-square w-full max-w-40 rounded-md sm:w-40"
              spinning={playback.playing && current?.id === continueTrack.id}
            />
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl">{continueTrack.title}</p>
              <p className="mt-1 text-muted">{continueTrack.channel}</p>
              <p className="mt-2 text-sm text-subtle">{continueTrack.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    if (current?.id === continueTrack.id) togglePlay();
                    else playNow(continueTrack.id);
                  }}
                >
                  {current?.id === continueTrack.id && playback.playing
                    ? "Pause"
                    : "Play"}
                </Button>
                <Button variant="secondary" asChild>
                  <Link to="/search">Find more</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-sm text-muted">Recent playlists</h2>
          <Link to="/playlists" className="text-sm text-accent">
            All playlists
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {recentPlaylists.map((pl) => {
            const cover = pl.trackIds[0] ? getTrack(pl.trackIds[0]) : undefined;
            return (
              <div
                key={pl.id}
                className="rounded-lg bg-surface p-3 hover:bg-elevated"
              >
                <Link to="/playlists/$id" params={{ id: pl.id }} className="block">
                  {cover ? (
                    <CoverArt track={cover} className="mb-3 aspect-square w-full rounded-md" />
                  ) : (
                    <div className="mb-3 aspect-square w-full rounded-md bg-elevated" />
                  )}
                  <p className="truncate text-sm">{pl.name}</p>
                  <p className="text-xs text-muted">
                    {pl.trackIds.length} · {formatDurationLong(totalDuration(pl.trackIds))}
                  </p>
                </Link>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => playTracks(pl.trackIds)}
                >
                  Play
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-sm text-muted">Favorites</h2>
          <Link to="/favorites" className="text-sm text-accent">
            See all
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {favoriteTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onPlay={() => playNow(track.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
