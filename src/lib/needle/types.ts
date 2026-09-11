export const SCHEMA_VERSION = 1;
export const HISTORY_LIMIT = 100;
export const HIDDEN_PAUSE_MESSAGE =
  "Playback pauses when the player is not visible";

export type CoverPattern = "vinyl" | "bars" | "arcs" | "split" | "ring";

export type TrackStatus = "playable" | "embedding_disabled" | "unavailable";

export type Track = {
  id: string;
  title: string;
  channel: string;
  durationSec: number;
  hue: number;
  pattern: CoverPattern;
  status: TrackStatus;
  description: string;
};

export type LibraryItem = {
  trackId: string;
  addedAt: number;
};

export type Playlist = {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
};

export type HistoryEntry = {
  trackId: string;
  playedAt: number;
};

export type ThemePref = "dark" | "light" | "system";
export type PlayerSizePref = "compact" | "full";

export type Settings = {
  theme: ThemePref;
  playerSize: PlayerSizePref;
};

export type PlaybackState = {
  playing: boolean;
  positionSec: number;
  playerVisible: boolean;
  pauseReason: string | null;
};

export type AppState = {
  version: number;
  library: LibraryItem[];
  playlists: Playlist[];
  playlistOrder: string[];
  favorites: string[];
  history: HistoryEntry[];
  queue: string[];
  queueIndex: number;
  playback: PlaybackState;
  settings: Settings;
};

export type DomainCtx = {
  now: () => number;
  id: () => string;
};

export const defaultSettings = (): Settings => ({
  theme: "dark",
  playerSize: "full",
});

export const defaultPlayback = (): PlaybackState => ({
  playing: false,
  positionSec: 0,
  playerVisible: true,
  pauseReason: null,
});

export const emptyState = (): AppState => ({
  version: SCHEMA_VERSION,
  library: [],
  playlists: [],
  playlistOrder: [],
  favorites: [],
  history: [],
  queue: [],
  queueIndex: 0,
  playback: defaultPlayback(),
  settings: defaultSettings(),
});
