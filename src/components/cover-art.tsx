import { initials } from "@/lib/needle/format";
import type { Track } from "@/lib/needle/types";
import { cn } from "@/lib/utils";

function palette(hue: number) {
  return {
    bg: `hsl(${hue} 16% 18%)`,
    ink: `hsl(${hue} 10% 8%)`,
    line: `hsl(${hue} 18% 72%)`,
    wash: `hsl(${hue} 22% 32%)`,
  };
}

export function CoverArt({
  track,
  className,
  spinning = false,
}: {
  track: Track;
  className?: string;
  spinning?: boolean;
}) {
  const c = palette(track.hue);
  const mark = initials(track.title);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm bg-elevated",
        className,
      )}
      style={{ background: c.bg }}
      aria-hidden
    >
      <svg
        viewBox="0 0 80 80"
        className={cn("size-full", spinning && "vinyl-spin")}
      >
        <rect width="80" height="80" fill={c.bg} />
        {track.pattern === "vinyl" && (
          <>
            <circle cx="40" cy="40" r="34" fill={c.ink} />
            {[28, 22, 16].map((r) => (
              <circle
                key={r}
                cx="40"
                cy="40"
                r={r}
                fill="none"
                stroke={c.line}
                strokeWidth="0.6"
                opacity="0.45"
              />
            ))}
            <circle cx="40" cy="40" r="9" fill={c.wash} />
          </>
        )}
        {track.pattern === "bars" && (
          <>
            {[10, 22, 34, 46, 58, 70].map((x, i) => (
              <rect
                key={x}
                x={x}
                y={8 + (i % 3) * 6}
                width="6"
                height={64 - (i % 3) * 10}
                fill={c.line}
                opacity={0.35 + (i % 3) * 0.15}
              />
            ))}
          </>
        )}
        {track.pattern === "arcs" && (
          <>
            <path
              d="M8 64 C 24 8, 56 8, 72 64"
              fill="none"
              stroke={c.line}
              strokeWidth="2.2"
              opacity="0.7"
            />
            <path
              d="M12 68 C 28 20, 52 20, 68 68"
              fill="none"
              stroke={c.wash}
              strokeWidth="2"
            />
          </>
        )}
        {track.pattern === "split" && (
          <>
            <rect width="40" height="80" fill={c.ink} />
            <circle cx="40" cy="40" r="18" fill={c.wash} />
            <circle
              cx="40"
              cy="40"
              r="18"
              fill="none"
              stroke={c.line}
              strokeWidth="1"
            />
          </>
        )}
        {track.pattern === "ring" && (
          <>
            <circle
              cx="40"
              cy="40"
              r="26"
              fill="none"
              stroke={c.line}
              strokeWidth="10"
              opacity="0.35"
            />
            <circle
              cx="40"
              cy="40"
              r="18"
              fill="none"
              stroke={c.wash}
              strokeWidth="4"
            />
            <circle cx="40" cy="40" r="6" fill={c.line} />
          </>
        )}
        <text
          x="40"
          y="44"
          textAnchor="middle"
          fill={c.line}
          fontSize="11"
          fontFamily="Georgia, serif"
          fontStyle="italic"
        >
          {mark}
        </text>
      </svg>
      {track.status !== "playable" && (
        <div className="absolute inset-0 bg-bg/50" />
      )}
    </div>
  );
}
