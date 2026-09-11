import { Pause, Play } from "lucide-react";
import type { ReactNode } from "react";
import { CoverArt } from "@/components/cover-art";
import { AddToMenu } from "@/components/add-to-menu";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/needle/format";
import type { Track } from "@/lib/needle/types";
import { cn } from "@/lib/utils";

export function TrackRow({
  track,
  playing,
  current,
  index,
  onPlay,
  selected,
  onToggleSelect,
  selecting,
  trailing,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  track: Track;
  playing?: boolean;
  current?: boolean;
  index?: number;
  onPlay: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
  selecting?: boolean;
  trailing?: ReactNode;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: () => void;
  onDrop?: () => void;
}) {
  const blocked = track.status !== "playable";
  return (
    <div
      className={cn(
        "group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-2 py-2",
        current ? "bg-elevated" : "hover:bg-elevated/70",
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={(e) => {
        if (!draggable) return;
        e.preventDefault();
        onDragOver?.();
      }}
      onDrop={(e) => {
        if (!draggable) return;
        e.preventDefault();
        onDrop?.();
      }}
    >
      <div className="flex items-center gap-2">
        {selecting && (
          <input
            type="checkbox"
            className="size-5 accent-accent"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`Select ${track.title}`}
          />
        )}
        {index !== undefined && (
          <span className="w-6 text-center text-xs tabular-nums text-subtle">
            {index + 1}
          </span>
        )}
        <button
          type="button"
          onClick={onPlay}
          className="relative size-12 shrink-0 overflow-hidden rounded-sm"
          aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
        >
          <CoverArt track={track} className="size-12" spinning={playing} />
          <span className="absolute inset-0 grid place-items-center bg-bg/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            {playing ? (
              <Pause className="size-4 fill-fg text-fg" />
            ) : (
              <Play className="size-4 fill-fg text-fg" />
            )}
          </span>
        </button>
      </div>
      <div className="min-w-0">
        <p className={cn("truncate text-sm", current ? "text-accent" : "text-fg")}>
          {track.title}
        </p>
        <p className="truncate text-xs text-muted">
          {track.channel}
          {track.status === "embedding_disabled" && " · Can’t play here"}
          {track.status === "unavailable" && " · Unavailable"}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <span className="hidden w-10 text-right text-xs tabular-nums text-subtle sm:block">
          {formatDuration(track.durationSec)}
        </span>
        {!blocked && <AddToMenu trackId={track.id} />}
        {trailing}
      </div>
    </div>
  );
}

export function TrackCard({
  track,
  onPlay,
}: {
  track: Track;
  onPlay: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className="group flex w-36 shrink-0 flex-col gap-2 text-left sm:w-40"
    >
      <CoverArt
        track={track}
        className="aspect-square w-full rounded-md"
      />
      <span className="truncate text-sm text-fg">{track.title}</span>
      <span className="truncate text-xs text-muted">{track.channel}</span>
    </button>
  );
}
