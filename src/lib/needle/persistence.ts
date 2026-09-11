import { z } from "zod";
import { seedState } from "./seed.ts";
import {
  SCHEMA_VERSION,
  defaultPlayback,
  defaultSettings,
  emptyState,
  type AppState,
  type LibraryItem,
  type Playlist,
  type HistoryEntry,
  type Settings,
} from "./types.ts";

export const STORAGE_KEY = "needle.library.v1";

const libraryItemSchema = z.object({
  trackId: z.string().min(1).max(200),
  addedAt: z.number().finite(),
});

const playlistSchema = z.object({
  id: z.string().min(1).max(200),
  name: z.string().min(1).max(120),
  trackIds: z.array(z.string().min(1).max(200)).max(2000),
  createdAt: z.number().finite(),
  updatedAt: z.number().finite(),
});

const historySchema = z.object({
  trackId: z.string().min(1).max(200),
  playedAt: z.number().finite(),
});

const settingsSchema = z.object({
  theme: z.enum(["dark", "light", "system"]),
  playerSize: z.enum(["compact", "full"]),
});

const persistedSchema = z.object({
  version: z.number().finite().optional(),
  library: z.array(libraryItemSchema).max(5000).optional(),
  playlists: z.array(playlistSchema).max(500).optional(),
  playlistOrder: z.array(z.string().min(1).max(200)).max(500).optional(),
  favorites: z.array(z.string().min(1).max(200)).max(5000).optional(),
  history: z.array(historySchema).max(500).optional(),
  queue: z.array(z.string().min(1).max(200)).max(2000).optional(),
  queueIndex: z.number().int().nonnegative().optional(),
  settings: settingsSchema.partial().optional(),
  playback: z
    .object({
      positionSec: z.number().finite().nonnegative().optional(),
    })
    .optional(),
});

export type ImportResult =
  | { ok: true; state: AppState }
  | { ok: false; error: string };

function uniqueStrings(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function uniqueLibrary(items: LibraryItem[]): LibraryItem[] {
  const seen = new Set<string>();
  const out: LibraryItem[] = [];
  for (const item of items) {
    if (seen.has(item.trackId)) continue;
    seen.add(item.trackId);
    out.push(item);
  }
  return out;
}

export function migrate(raw: unknown): AppState {
  const parsed = persistedSchema.safeParse(raw);
  if (!parsed.success) return emptyState();

  const data = parsed.data;
  const playlists: Playlist[] = data.playlists ?? [];
  const playlistIds = new Set(playlists.map((p) => p.id));
  const playlistOrder = (data.playlistOrder ?? playlists.map((p) => p.id)).filter(
    (id) => playlistIds.has(id),
  );
  for (const p of playlists) {
    if (!playlistOrder.includes(p.id)) playlistOrder.push(p.id);
  }

  const queue = data.queue ?? [];
  const queueIndex = Math.min(data.queueIndex ?? 0, Math.max(queue.length - 1, 0));

  const settings: Settings = {
    ...defaultSettings(),
    ...data.settings,
  };

  return {
    version: SCHEMA_VERSION,
    library: uniqueLibrary(data.library ?? []),
    playlists,
    playlistOrder,
    favorites: uniqueStrings(data.favorites ?? []),
    history: data.history ?? [],
    queue,
    queueIndex: queue.length === 0 ? 0 : queueIndex,
    playback: {
      ...defaultPlayback(),
      positionSec: data.playback?.positionSec ?? 0,
    },
    settings,
  };
}

export function toPersisted(state: AppState) {
  return {
    version: SCHEMA_VERSION,
    library: state.library,
    playlists: state.playlists,
    playlistOrder: state.playlistOrder,
    favorites: state.favorites,
    history: state.history,
    queue: state.queue,
    queueIndex: state.queueIndex,
    settings: state.settings,
    playback: { positionSec: state.playback.positionSec },
  };
}

export function loadState(storage: Pick<Storage, "getItem">): AppState {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return seedState();
  try {
    return migrate(JSON.parse(raw));
  } catch {
    return seedState();
  }
}

export function saveState(
  storage: Pick<Storage, "setItem">,
  state: AppState,
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(toPersisted(state)));
}

export function validateImport(input: unknown): ImportResult {
  if (typeof input === "string") {
    try {
      input = JSON.parse(input);
    } catch {
      return { ok: false, error: "That file is not valid JSON." };
    }
  }
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Import data must be a Needle library file." };
  }
  const parsed = persistedSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "This file does not match a Needle library." };
  }
  return { ok: true, state: migrate(parsed.data) };
}

export function exportState(state: AppState): string {
  return `${JSON.stringify(toPersisted(state), null, 2)}\n`;
}

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function resetState(storage: StorageLike): AppState {
  const next = seedState();
  saveState(storage, next);
  return next;
}

export { type HistoryEntry };
