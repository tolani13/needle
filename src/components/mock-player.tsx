import { CoverArt } from "@/components/cover-art";
import { HIDDEN_PAUSE_MESSAGE } from "@/lib/needle/types";
import type { Track } from "@/lib/needle/types";
import { cn } from "@/lib/utils";

export function MockPlayer({
  track,
  playing,
  visible,
  compact = false,
}: {
  track?: Track;
  playing: boolean;
  visible: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-border bg-elevated",
        compact ? "h-14 w-14 rounded-sm" : "aspect-video w-full rounded-lg",
      )}
      data-player-surface="mock"
      aria-label="Mock player. The official YouTube player will live here later."
    >
      {track ? (
        <CoverArt
          track={track}
          className="size-full rounded-none"
          spinning={playing && visible && !compact}
        />
      ) : (
        <div className="grid size-full place-items-center text-subtle">
          <NeedleMark className={compact ? "size-6" : "size-12"} />
        </div>
      )}
      {!compact && (
        <div className="absolute inset-x-0 bottom-0 bg-bg/70 px-3 py-2 text-xs text-muted">
          {visible
            ? "Mock player — official YouTube player reserved for later."
            : HIDDEN_PAUSE_MESSAGE}
        </div>
      )}
    </div>
  );
}

export function NeedleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle
        cx="14"
        cy="18"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="14" cy="18" r="1.6" fill="currentColor" />
      <path
        d="M22 6 L16 16"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="22" cy="6" r="1.4" fill="currentColor" />
    </svg>
  );
}
