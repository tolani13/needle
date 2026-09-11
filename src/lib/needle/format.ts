export function formatDuration(totalSec: number): string {
  if (!Number.isFinite(totalSec) || totalSec < 0) return "0:00";
  const sec = Math.floor(totalSec);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${minutes}:${pad(seconds)}`;
}

export function formatDurationLong(totalSec: number): string {
  if (!Number.isFinite(totalSec) || totalSec <= 0) return "0 min";
  const sec = Math.floor(totalSec);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.round((sec % 3600) / 60);
  if (hours > 0) {
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  }
  return `${Math.max(minutes, 1)} min`;
}

export function initials(title: string): string {
  const parts = title
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean);
  if (parts.length === 0) return "N";
  return parts.slice(0, 2).join("").toUpperCase();
}

export function greetingForHour(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Late listening";
}
