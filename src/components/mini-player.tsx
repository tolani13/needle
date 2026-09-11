import {
  Heart,
  ListMusic,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  ChevronUp,
} from "lucide-react";
import { MockPlayer } from "@/components/mock-player";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/needle/format";
import { currentTrackFrom, useNeedle } from "@/lib/needle/store";
import { cn } from "@/lib/utils";

export function MiniPlayer() {
  const queue = useNeedle((s) => s.queue);
  const queueIndex = useNeedle((s) => s.queueIndex);
  const playback = useNeedle((s) => s.playback);
  const favorites = useNeedle((s) => s.favorites);
  const togglePlay = useNeedle((s) => s.togglePlay);
  const next = useNeedle((s) => s.next);
  const prev = useNeedle((s) => s.prev);
  const seek = useNeedle((s) => s.seek);
  const toggleFavorite = useNeedle((s) => s.toggleFavorite);
  const nowPlayingOpen = useNeedle((s) => s.nowPlayingOpen);
  const setNowPlayingOpen = useNeedle((s) => s.setNowPlayingOpen);
  const setQueueOpen = useNeedle((s) => s.setQueueOpen);
  const track = currentTrackFrom({ queue, queueIndex });
  const liked = track ? favorites.includes(track.id) : false;
  const duration = track?.durationSec ?? 0;
  const progress = duration > 0 ? playback.positionSec / duration : 0;

  return (
    <div className="border-t border-border bg-surface">
      <div className="px-3 pt-1 md:px-4">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.25}
          value={Math.min(playback.positionSec, duration)}
          onChange={(e) => seek(Number(e.target.value))}
          disabled={!track}
          aria-label="Seek"
          className="h-1 w-full cursor-pointer appearance-none bg-transparent accent-accent"
        />
      </div>
      <div className="flex items-center gap-3 px-3 py-2 md:px-4">
        <button
          type="button"
          className="shrink-0"
          onClick={() => setNowPlayingOpen(!nowPlayingOpen)}
          aria-label={nowPlayingOpen ? "Hide now playing" : "Show now playing"}
        >
          <MockPlayer
            track={track}
            playing={playback.playing}
            visible={playback.playerVisible}
            compact
          />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">{track?.title ?? "Nothing playing"}</p>
          <p className="truncate text-xs text-muted">
            {track?.channel ?? "Choose something to play"}
          </p>
        </div>
        <div className="hidden items-center gap-2 tabular-nums text-xs text-subtle sm:flex">
          {formatDuration(playback.positionSec)} / {formatDuration(duration)}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="quiet"
            size="iconSm"
            aria-label="Previous"
            onClick={prev}
            disabled={!track}
          >
            <SkipBack className="fill-fg" />
          </Button>
          <Button
            variant="primary"
            size="icon"
            aria-label={playback.playing ? "Pause" : "Play"}
            onClick={togglePlay}
            disabled={!track}
            className="size-11 rounded-full"
          >
            {playback.playing ? (
              <Pause className="fill-accent-fg" />
            ) : (
              <Play className="fill-accent-fg" />
            )}
          </Button>
          <Button
            variant="quiet"
            size="iconSm"
            aria-label="Next"
            onClick={next}
            disabled={!track}
          >
            <SkipForward className="fill-fg" />
          </Button>
        </div>
        <div className="hidden items-center gap-1 md:flex">
          {track && (
            <Button
              variant="quiet"
              size="iconSm"
              aria-label={liked ? "Unfavorite" : "Favorite"}
              onClick={() => toggleFavorite(track.id)}
            >
              <Heart className={cn(liked && "fill-fg")} />
            </Button>
          )}
          <Button
            variant="quiet"
            size="iconSm"
            aria-label="Queue"
            onClick={() => useNeedle.getState().setQueueOpen(true)}
          >
            <ListMusic />
          </Button>
          <Button
            variant="quiet"
            size="iconSm"
            aria-label="Expand now playing"
            onClick={() => setNowPlayingOpen(true)}
          >
            <ChevronUp />
          </Button>
        </div>
      </div>
      <div
        className="h-0.5 bg-elevated md:hidden"
        aria-hidden
      >
        <div
          className="h-full bg-accent"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
