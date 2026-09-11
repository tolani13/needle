import { getTrack } from "./catalog.ts";
import {
  type AppState,
  type DomainCtx,
  type HistoryEntry,
  type LibraryItem,
  type Playlist,
  HIDDEN_PAUSE_MESSAGE,
  HISTORY_LIMIT,
} from "./types.ts";

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return items;
  }
  const next = items.slice();
  const [item] = next.splice(from, 1);
  if (item === undefined) return items;
  next.splice(to, 0, item);
  return next;
}

function withPlayback(
  state: AppState,
  patch: Partial<AppState["playback"]>,
): AppState {
  return { ...state, playback: { ...state.playback, ...patch } };
}

function canPlay(trackId: string): { ok: true } | { ok: false; reason: string } {
  const track = getTrack(trackId);
  if (!track || track.status === "unavailable") {
    return { ok: false, reason: "This item is unavailable." };
  }
  if (track.status === "embedding_disabled") {
    return {
      ok: false,
      reason: "This item can't play in the app player.",
    };
  }
  return { ok: true };
}

function playingIfVisible(state: AppState, wantPlaying: boolean): boolean {
  if (!state.playback.playerVisible) return false;
  return wantPlaying;
}

function pauseReasonFor(state: AppState, wantPlaying: boolean): string | null {
  if (wantPlaying && !state.playback.playerVisible) return HIDDEN_PAUSE_MESSAGE;
  return wantPlaying ? null : state.playback.pauseReason;
}

export function recordPlay(
  state: AppState,
  trackId: string,
  ctx: DomainCtx,
): AppState {
  const entry: HistoryEntry = { trackId, playedAt: ctx.now() };
  const rest = state.history.filter((h) => h.trackId !== trackId);
  return {
    ...state,
    history: [entry, ...rest].slice(0, HISTORY_LIMIT),
  };
}

export function addToLibrary(
  state: AppState,
  trackIds: string[],
  ctx: DomainCtx,
): AppState {
  const existing = new Set(state.library.map((i) => i.trackId));
  const added: LibraryItem[] = [];
  for (const id of trackIds) {
    if (existing.has(id)) continue;
    existing.add(id);
    added.push({ trackId: id, addedAt: ctx.now() });
  }
  if (added.length === 0) return state;
  return { ...state, library: [...added, ...state.library] };
}

export function removeFromLibrary(
  state: AppState,
  trackIds: string[],
): AppState {
  const drop = new Set(trackIds);
  const library = state.library.filter((i) => !drop.has(i.trackId));
  if (library.length === state.library.length) return state;
  return { ...state, library };
}

export function toggleFavorite(state: AppState, trackId: string): AppState {
  if (state.favorites.includes(trackId)) {
    return { ...state, favorites: state.favorites.filter((id) => id !== trackId) };
  }
  return { ...state, favorites: [trackId, ...state.favorites] };
}

export function createPlaylist(
  state: AppState,
  name: string,
  ctx: DomainCtx,
  trackIds: string[] = [],
): AppState {
  const trimmed = name.trim();
  if (!trimmed) return state;
  const id = ctx.id();
  const now = ctx.now();
  const playlist: Playlist = {
    id,
    name: trimmed,
    trackIds: [...trackIds],
    createdAt: now,
    updatedAt: now,
  };
  return {
    ...state,
    playlists: [...state.playlists, playlist],
    playlistOrder: [...state.playlistOrder, id],
  };
}

export function renamePlaylist(
  state: AppState,
  playlistId: string,
  name: string,
  ctx: DomainCtx,
): AppState {
  const trimmed = name.trim();
  if (!trimmed) return state;
  return {
    ...state,
    playlists: state.playlists.map((p) =>
      p.id === playlistId ? { ...p, name: trimmed, updatedAt: ctx.now() } : p,
    ),
  };
}

export function duplicatePlaylist(
  state: AppState,
  playlistId: string,
  ctx: DomainCtx,
): AppState {
  const source = state.playlists.find((p) => p.id === playlistId);
  if (!source) return state;
  const id = ctx.id();
  const now = ctx.now();
  const copy: Playlist = {
    id,
    name: `${source.name} (copy)`,
    trackIds: [...source.trackIds],
    createdAt: now,
    updatedAt: now,
  };
  const idx = state.playlistOrder.indexOf(playlistId);
  const order = state.playlistOrder.slice();
  order.splice(idx >= 0 ? idx + 1 : order.length, 0, id);
  return {
    ...state,
    playlists: [...state.playlists, copy],
    playlistOrder: order,
  };
}

export function deletePlaylist(state: AppState, playlistId: string): AppState {
  return {
    ...state,
    playlists: state.playlists.filter((p) => p.id !== playlistId),
    playlistOrder: state.playlistOrder.filter((id) => id !== playlistId),
  };
}

export function addTracksToPlaylist(
  state: AppState,
  playlistId: string,
  trackIds: string[],
  ctx: DomainCtx,
): AppState {
  if (trackIds.length === 0) return state;
  return {
    ...state,
    playlists: state.playlists.map((p) =>
      p.id === playlistId
        ? { ...p, trackIds: [...p.trackIds, ...trackIds], updatedAt: ctx.now() }
        : p,
    ),
  };
}

export function removeTrackFromPlaylist(
  state: AppState,
  playlistId: string,
  index: number,
  ctx: DomainCtx,
): AppState {
  return {
    ...state,
    playlists: state.playlists.map((p) => {
      if (p.id !== playlistId) return p;
      if (index < 0 || index >= p.trackIds.length) return p;
      const trackIds = p.trackIds.slice();
      trackIds.splice(index, 1);
      return { ...p, trackIds, updatedAt: ctx.now() };
    }),
  };
}

export function reorderPlaylistTracks(
  state: AppState,
  playlistId: string,
  from: number,
  to: number,
  ctx: DomainCtx,
): AppState {
  return {
    ...state,
    playlists: state.playlists.map((p) => {
      if (p.id !== playlistId) return p;
      const trackIds = moveItem(p.trackIds, from, to);
      if (trackIds === p.trackIds) return p;
      return { ...p, trackIds, updatedAt: ctx.now() };
    }),
  };
}

export function reorderPlaylists(
  state: AppState,
  from: number,
  to: number,
): AppState {
  return { ...state, playlistOrder: moveItem(state.playlistOrder, from, to) };
}

export function playNow(
  state: AppState,
  trackId: string,
  ctx: DomainCtx,
): AppState {
  const check = canPlay(trackId);
  if (!check.ok) {
    return withPlayback(state, { playing: false, pauseReason: check.reason });
  }
  const filtered = state.queue.filter((id) => id !== trackId);
  const insertAt = Math.min(
    Math.max(state.queueIndex, 0),
    filtered.length,
  );
  const queue = [
    ...filtered.slice(0, insertAt),
    trackId,
    ...filtered.slice(insertAt),
  ];
  const wantPlaying = true;
  const next = recordPlay(
    {
      ...state,
      queue,
      queueIndex: insertAt,
      playback: {
        ...state.playback,
        playing: playingIfVisible(state, wantPlaying),
        positionSec: 0,
        pauseReason: pauseReasonFor(state, wantPlaying),
      },
    },
    trackId,
    ctx,
  );
  return next;
}

export function playTracks(
  state: AppState,
  trackIds: string[],
  ctx: DomainCtx,
): AppState {
  const playable = trackIds.filter((id) => canPlay(id).ok);
  if (playable.length === 0) {
    const reason =
      trackIds.length === 0
        ? "Nothing to play."
        : (canPlay(trackIds[0] ?? "").ok
            ? "Nothing to play."
            : (canPlay(trackIds[0] ?? "") as { ok: false; reason: string }).reason);
    return withPlayback(state, { playing: false, pauseReason: reason });
  }
  const first = playable[0]!;
  const wantPlaying = true;
  return recordPlay(
    {
      ...state,
      queue: playable,
      queueIndex: 0,
      playback: {
        ...state.playback,
        playing: playingIfVisible(state, wantPlaying),
        positionSec: 0,
        pauseReason: pauseReasonFor(state, wantPlaying),
      },
    },
    first,
    ctx,
  );
}

export function addNext(state: AppState, trackId: string): AppState {
  const without = state.queue.filter((id) => id !== trackId);
  const insertAt =
    state.queue.length === 0 ? 0 : Math.min(state.queueIndex + 1, without.length);
  const queue = [
    ...without.slice(0, insertAt),
    trackId,
    ...without.slice(insertAt),
  ];
  const queueIndex =
    state.queue[state.queueIndex] === trackId
      ? insertAt
      : queue.indexOf(state.queue[state.queueIndex] ?? trackId);
  return {
    ...state,
    queue,
    queueIndex: Math.max(0, queueIndex),
  };
}

export function addToEnd(state: AppState, trackId: string): AppState {
  if (state.queue.includes(trackId)) {
    const from = state.queue.indexOf(trackId);
    if (from === state.queue.length - 1) return state;
    const queue = moveItem(state.queue, from, state.queue.length - 1);
    let queueIndex = state.queueIndex;
    if (from === state.queueIndex) queueIndex = queue.length - 1;
    else if (from < state.queueIndex) queueIndex -= 1;
    return { ...state, queue, queueIndex };
  }
  return { ...state, queue: [...state.queue, trackId] };
}

export function removeFromQueue(state: AppState, index: number): AppState {
  if (index < 0 || index >= state.queue.length) return state;
  const queue = state.queue.slice();
  queue.splice(index, 1);
  let queueIndex = state.queueIndex;
  if (queue.length === 0) {
    return withPlayback(
      { ...state, queue, queueIndex: 0 },
      { playing: false, positionSec: 0 },
    );
  }
  if (index < state.queueIndex) queueIndex -= 1;
  else if (index === state.queueIndex) {
    queueIndex = Math.min(index, queue.length - 1);
    return withPlayback(
      { ...state, queue, queueIndex },
      { positionSec: 0 },
    );
  }
  return { ...state, queue, queueIndex };
}

export function reorderQueue(
  state: AppState,
  from: number,
  to: number,
): AppState {
  const currentId = state.queue[state.queueIndex];
  const queue = moveItem(state.queue, from, to);
  if (queue === state.queue) return state;
  const queueIndex = currentId ? Math.max(0, queue.indexOf(currentId)) : 0;
  return { ...state, queue, queueIndex };
}

export function clearQueue(state: AppState): AppState {
  return withPlayback(
    { ...state, queue: [], queueIndex: 0 },
    { playing: false, positionSec: 0 },
  );
}

export function nextTrack(state: AppState, ctx: DomainCtx): AppState {
  if (state.queueIndex >= state.queue.length - 1) {
    return withPlayback(state, { playing: false, positionSec: 0 });
  }
  const queueIndex = state.queueIndex + 1;
  const id = state.queue[queueIndex];
  if (!id) return withPlayback(state, { playing: false });
  const check = canPlay(id);
  if (!check.ok) {
    return nextTrack(
      { ...state, queueIndex, playback: { ...state.playback, positionSec: 0 } },
      ctx,
    );
  }
  const wantPlaying = state.playback.playing;
  return recordPlay(
    {
      ...state,
      queueIndex,
      playback: {
        ...state.playback,
        playing: playingIfVisible(state, wantPlaying),
        positionSec: 0,
        pauseReason: pauseReasonFor(state, wantPlaying),
      },
    },
    id,
    ctx,
  );
}

export function prevTrack(state: AppState, ctx: DomainCtx): AppState {
  if (state.playback.positionSec > 3) {
    return withPlayback(state, { positionSec: 0 });
  }
  if (state.queueIndex <= 0) {
    return withPlayback(state, { positionSec: 0 });
  }
  const queueIndex = state.queueIndex - 1;
  const id = state.queue[queueIndex];
  if (!id) return state;
  const wantPlaying = state.playback.playing;
  return recordPlay(
    {
      ...state,
      queueIndex,
      playback: {
        ...state.playback,
        playing: playingIfVisible(state, wantPlaying),
        positionSec: 0,
        pauseReason: pauseReasonFor(state, wantPlaying),
      },
    },
    id,
    ctx,
  );
}

export function togglePlay(state: AppState, ctx: DomainCtx): AppState {
  const current = state.queue[state.queueIndex];
  if (!current) return state;
  if (state.playback.playing) {
    return withPlayback(state, { playing: false, pauseReason: null });
  }
  if (!state.playback.playerVisible) {
    return withPlayback(state, {
      playing: false,
      pauseReason: HIDDEN_PAUSE_MESSAGE,
    });
  }
  const check = canPlay(current);
  if (!check.ok) {
    return withPlayback(state, { playing: false, pauseReason: check.reason });
  }
  const shouldRecord = state.playback.positionSec < 0.5;
  const next = withPlayback(state, { playing: true, pauseReason: null });
  return shouldRecord ? recordPlay(next, current, ctx) : next;
}

export function seek(state: AppState, positionSec: number, durationSec: number): AppState {
  const clamped = Math.min(Math.max(positionSec, 0), Math.max(durationSec, 0));
  return withPlayback(state, { positionSec: clamped });
}

export function tickPlayback(
  state: AppState,
  elapsedSec: number,
  durationSec: number,
  ctx: DomainCtx,
): AppState {
  if (!state.playback.playing) return state;
  if (!state.playback.playerVisible) {
    return withPlayback(state, {
      playing: false,
      pauseReason: HIDDEN_PAUSE_MESSAGE,
    });
  }
  const nextPos = state.playback.positionSec + elapsedSec;
  if (durationSec > 0 && nextPos >= durationSec) {
    return nextTrack(withPlayback(state, { positionSec: 0 }), ctx);
  }
  return withPlayback(state, { positionSec: nextPos });
}

export function applyVisibility(state: AppState, visible: boolean): AppState {
  if (visible) {
    return withPlayback(state, { playerVisible: true });
  }
  if (state.playback.playing) {
    return withPlayback(state, {
      playerVisible: false,
      playing: false,
      pauseReason: HIDDEN_PAUSE_MESSAGE,
    });
  }
  return withPlayback(state, { playerVisible: false });
}

export function updateSettings(
  state: AppState,
  patch: Partial<AppState["settings"]>,
): AppState {
  return { ...state, settings: { ...state.settings, ...patch } };
}

export function currentTrackId(state: AppState): string | undefined {
  return state.queue[state.queueIndex];
}

export function playlistById(
  state: AppState,
  id: string,
): Playlist | undefined {
  return state.playlists.find((p) => p.id === id);
}
