import { ChevronDown, Heart, ListMusic, Pause, Play, SkipBack, SkipForward, EyeOff, Eye } from "lucide-react";
import { MockPlayer } from "@/components/mock-player";
import { TrackRow } from "@/components/track-row";
import { Button } from "@/components/ui/button";
import { getTracks } from "@/lib/needle/catalog";
import { formatDuration } from "@/lib/needle/format";
import { HIDDEN_PAUSE_MESSAGE } from "@/lib/needle/types";
import { currentTrackFrom, useNeedle } from "@/lib/needle/store";
import { cn } from "@/lib/utils";

export function NowPlaying() {
  const open = useNeedle((s) => s.nowPlayingOpen);
  const queue = useNeedle((s) => s.queue);
  const queueIndex = useNeedle((s) => s.queueIndex);
  const playback = useNeedle((s) => s.playback);
  const favorites = useNeedle((s) => s.favorites);
  const setNowPlayingOpen = useNeedle((s) => s.setNowPlayingOpen);
  const togglePlay = useNeedle((s) => s.togglePlay);
  const next = useNeedle((s) => s.next);
  const prev = useNeedle((s) => s.prev);
  const seek = useNeedle((s) => s.seek);
  const toggleFavorite = useNeedle((s) => s.toggleFavorite);
  const playNow = useNeedle((s) => s.playNow);
  const setVisible = useNeedle((s) => s.setVisible);
  const setQueueOpen = useNeedle((s) => s.setQueueOpen);
  const track = currentTrackFrom({ queue, queueIndex });
  const upcoming = getTracks(queue.slice(queueIndex + 1, queueIndex + 6));
  const liked = track ? favorites.includes(track.id) : false;
  const duration = track?.durationSec ?? 0;

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-bg">
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          variant="quiet"
          size="icon"
          aria-label="Close now playing"
          onClick={() => setNowPlayingOpen(false)}
        >
          <ChevronDown />
        </Button>
        <p className="font-display text-sm tracking-wide text-muted">Now playing</p>
        <Button
          variant="quiet"
          size="icon"
          aria-label="Open queue"
          onClick={() => setQueueOpen(true)}
        >
          <ListMusic />
        </Button>
      </div>
      <div className="scroll-thin mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 overflow-y-auto px-4 pb-8">
        <MockPlayer
          track={track}
          playing={playback.playing}
          visible={playback.playerVisible}
        />
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">
            {track?.title ?? "Nothing playing"}
          </h1>
          <p className="mt-1 text-muted">{track?.channel ?? "Your queue is empty"}</p>
          {track && (
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-subtle">
              {track.description}
            </p>
          )}
        </div>
        <div>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.25}
            value={Math.min(playback.positionSec, duration)}
            onChange={(e) => seek(Number(e.target.value))}
            disabled={!track}
            aria-label="Seek"
            className="h-1.5 w-full cursor-pointer appearance-none accent-accent"
          />
          <div className="mt-1 flex justify-between text-xs tabular-nums text-subtle">
            <span>{formatDuration(playback.positionSec)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="quiet"
            size="icon"
            aria-label={liked ? "Unfavorite" : "Favorite"}
            onClick={() => track && toggleFavorite(track.id)}
            disabled={!track}
          >
            <Heart className={cn(liked && "fill-fg")} />
          </Button>
          <Button variant="quiet" size="icon" aria-label="Previous" onClick={prev}>
            <SkipBack className="fill-fg" />
          </Button>
          <Button
            variant="primary"
            size="icon"
            className="size-14 rounded-full"
            aria-label={playback.playing ? "Pause" : "Play"}
            onClick={togglePlay}
            disabled={!track}
          >
            {playback.playing ? (
              <Pause className="size-5 fill-accent-fg" />
            ) : (
              <Play className="size-5 fill-accent-fg" />
            )}
          </Button>
          <Button variant="quiet" size="icon" aria-label="Next" onClick={next}>
            <SkipForward className="fill-fg" />
          </Button>
          <Button
            variant="quiet"
            size="icon"
            aria-label={
              playback.playerVisible
                ? "Simulate hidden window"
                : "Show player again"
            }
            onClick={() => setVisible(!playback.playerVisible)}
          >
            {playback.playerVisible ? <EyeOff /> : <Eye />}
          </Button>
        </div>
        {!playback.playerVisible && (
          <p className="rounded-md border border-border bg-elevated px-3 py-2 text-sm text-warn">
            {HIDDEN_PAUSE_MESSAGE}
          </p>
        )}
        {upcoming.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm text-muted">Up next</h2>
            <div className="divide-y divide-border rounded-md border border-border">
              {upcoming.map((item) => (
                <TrackRow
                  key={item.id}
                  track={item}
                  onPlay={() => playNow(item.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
