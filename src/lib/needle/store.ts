import { create } from "zustand";
import { getTrack } from "./catalog.ts";
import {
  addNext,
  addToEnd,
  addToLibrary,
  addTracksToPlaylist,
  applyVisibility,
  clearQueue,
  createPlaylist,
  deletePlaylist,
  duplicatePlaylist,
  nextTrack,
  playNow,
  playTracks,
  prevTrack,
  removeFromLibrary,
  removeFromQueue,
  removeTrackFromPlaylist,
  renamePlaylist,
  reorderPlaylists,
  reorderPlaylistTracks,
  reorderQueue,
  seek,
  tickPlayback,
  toggleFavorite,
  togglePlay,
  updateSettings,
} from "./domain.ts";
import { loadState, resetState, saveState, STORAGE_KEY } from "./persistence.ts";
import { seedState } from "./seed.ts";
import type { AppState, PlayerSizePref, ThemePref } from "./types.ts";

export type NeedleStore = AppState & {
  hydrated: boolean;
  nowPlayingOpen: boolean;
  queueOpen: boolean;
  shortcutsOpen: boolean;
  hydrate: () => void;
  persist: () => void;
  playNow: (trackId: string) => void;
  playTracks: (trackIds: string[]) => void;
  addNext: (trackId: string) => void;
  addToEnd: (trackId: string) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (from: number, to: number) => void;
  clearQueue: () => void;
  next: () => void;
  prev: () => void;
  togglePlay: () => void;
  seek: (positionSec: number) => void;
  tick: (elapsedSec: number) => void;
  setVisible: (visible: boolean) => void;
  toggleFavorite: (trackId: string) => void;
  saveToLibrary: (trackIds: string[]) => void;
  removeFromLibrary: (trackIds: string[]) => void;
  createPlaylist: (name: string, trackIds?: string[]) => string | null;
  renamePlaylist: (id: string, name: string) => void;
  duplicatePlaylist: (id: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, trackIds: string[]) => void;
  removeFromPlaylist: (playlistId: string, index: number) => void;
  reorderPlaylistTracks: (playlistId: string, from: number, to: number) => void;
  reorderPlaylists: (from: number, to: number) => void;
  setTheme: (theme: ThemePref) => void;
  setPlayerSize: (size: PlayerSizePref) => void;
  replaceState: (state: AppState) => void;
  reset: () => void;
  setNowPlayingOpen: (open: boolean) => void;
  setQueueOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
};

function ctx() {
  return {
    now: () => Date.now(),
    id: () =>
      `npl_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`,
  };
}

function sliceState(s: AppState): AppState {
  return {
    version: s.version,
    library: s.library,
    playlists: s.playlists,
    playlistOrder: s.playlistOrder,
    favorites: s.favorites,
    history: s.history,
    queue: s.queue,
    queueIndex: s.queueIndex,
    playback: s.playback,
    settings: s.settings,
  };
}

const seed = seedState();

export const useNeedle = create<NeedleStore>((set, get) => {
  const commit = (next: AppState) => {
    set(next);
    if (get().hydrated && typeof window !== "undefined") {
      saveState(window.localStorage, next);
    }
  };

  return {
    ...seed,
    hydrated: false,
    nowPlayingOpen: false,
    queueOpen: false,
    shortcutsOpen: false,
    hydrate: () => {
      if (typeof window === "undefined") return;
      const loaded = loadState(window.localStorage);
      set({
        ...loaded,
        hydrated: true,
        nowPlayingOpen: false,
      });
    },
    persist: () => {
      if (typeof window === "undefined") return;
      saveState(window.localStorage, sliceState(get()));
    },
    playNow: (trackId) => {
      const visible = applyVisibility(sliceState(get()), true);
      commit(playNow(visible, trackId, ctx()));
      if (get().settings.playerSize === "full") set({ nowPlayingOpen: true });
    },
    playTracks: (trackIds) => {
      const visible = applyVisibility(sliceState(get()), true);
      commit(playTracks(visible, trackIds, ctx()));
      if (get().settings.playerSize === "full") set({ nowPlayingOpen: true });
    },
    addNext: (trackId) => commit(addNext(sliceState(get()), trackId)),
    addToEnd: (trackId) => commit(addToEnd(sliceState(get()), trackId)),
    removeFromQueue: (index) => commit(removeFromQueue(sliceState(get()), index)),
    reorderQueue: (from, to) => commit(reorderQueue(sliceState(get()), from, to)),
    clearQueue: () => commit(clearQueue(sliceState(get()))),
    next: () => commit(nextTrack(sliceState(get()), ctx())),
    prev: () => commit(prevTrack(sliceState(get()), ctx())),
    togglePlay: () => {
      const wasPlaying = get().playback.playing;
      const base = wasPlaying
        ? sliceState(get())
        : applyVisibility(sliceState(get()), true);
      commit(togglePlay(base, ctx()));
      if (
        !wasPlaying &&
        get().playback.playing &&
        get().settings.playerSize === "full"
      ) {
        set({ nowPlayingOpen: true });
      }
    },
    seek: (positionSec) => {
      const current = get().queue[get().queueIndex];
      const duration = current ? (getTrack(current)?.durationSec ?? 0) : 0;
      commit(seek(sliceState(get()), positionSec, duration));
    },
    tick: (elapsedSec) => {
      const current = get().queue[get().queueIndex];
      const duration = current ? (getTrack(current)?.durationSec ?? 0) : 0;
      commit(tickPlayback(sliceState(get()), elapsedSec, duration, ctx()));
    },
    setVisible: (visible) => commit(applyVisibility(sliceState(get()), visible)),
    toggleFavorite: (trackId) => commit(toggleFavorite(sliceState(get()), trackId)),
    saveToLibrary: (trackIds) =>
      commit(addToLibrary(sliceState(get()), trackIds, ctx())),
    removeFromLibrary: (trackIds) =>
      commit(removeFromLibrary(sliceState(get()), trackIds)),
    createPlaylist: (name, trackIds = []) => {
      const before = new Set(get().playlists.map((p) => p.id));
      commit(createPlaylist(sliceState(get()), name, ctx(), trackIds));
      const created = get().playlists.find((p) => !before.has(p.id));
      return created?.id ?? null;
    },
    renamePlaylist: (id, name) =>
      commit(renamePlaylist(sliceState(get()), id, name, ctx())),
    duplicatePlaylist: (id) =>
      commit(duplicatePlaylist(sliceState(get()), id, ctx())),
    deletePlaylist: (id) => commit(deletePlaylist(sliceState(get()), id)),
    addToPlaylist: (playlistId, trackIds) =>
      commit(addTracksToPlaylist(sliceState(get()), playlistId, trackIds, ctx())),
    removeFromPlaylist: (playlistId, index) =>
      commit(removeTrackFromPlaylist(sliceState(get()), playlistId, index, ctx())),
    reorderPlaylistTracks: (playlistId, from, to) =>
      commit(reorderPlaylistTracks(sliceState(get()), playlistId, from, to, ctx())),
    reorderPlaylists: (from, to) =>
      commit(reorderPlaylists(sliceState(get()), from, to)),
    setTheme: (theme) => commit(updateSettings(sliceState(get()), { theme })),
    setPlayerSize: (playerSize) => {
      commit(updateSettings(sliceState(get()), { playerSize }));
    },
    replaceState: (state) => {
      commit(state);
      set({ nowPlayingOpen: state.settings.playerSize === "full" });
    },
    reset: () => {
      if (typeof window === "undefined") return;
      const next = resetState(window.localStorage);
      set({
        ...next,
        hydrated: true,
        nowPlayingOpen: false,
        queueOpen: false,
      });
    },
    setNowPlayingOpen: (open) => set({ nowPlayingOpen: open }),
    setQueueOpen: (open) => set({ queueOpen: open }),
    setShortcutsOpen: (open) => set({ shortcutsOpen: open }),
  };
});

export function currentTrackFrom(state: Pick<AppState, "queue" | "queueIndex">) {
  const id = state.queue[state.queueIndex];
  return id ? getTrack(id) : undefined;
}

export { STORAGE_KEY };
