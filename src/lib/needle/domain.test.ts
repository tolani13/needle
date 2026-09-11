import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
  moveItem,
  nextTrack,
  playNow,
  playTracks,
  prevTrack,
  recordPlay,
  removeFromLibrary,
  removeFromQueue,
  removeTrackFromPlaylist,
  renamePlaylist,
  reorderPlaylistTracks,
  reorderQueue,
  tickPlayback,
  toggleFavorite,
  togglePlay,
} from "./domain.ts";
import { seedState } from "./seed.ts";
import { emptyState, HIDDEN_PAUSE_MESSAGE, HISTORY_LIMIT } from "./types.ts";

const ctx = {
  now: () => 1_700_000_000_000,
  id: () => "npl_test_1",
};

const PLAYABLE = "ntrk_copper_hours";
const PLAYABLE_B = "ntrk_late_atlas";
const PLAYABLE_C = "ntrk_paper_dock";
const BLOCKED = "ntrk_locked_cut";
const GONE = "ntrk_private_reel";

describe("moveItem", () => {
  it("reorders and is a no-op on bad indexes", () => {
    assert.deepEqual(moveItem(["a", "b", "c"], 0, 2), ["b", "c", "a"]);
    assert.deepEqual(moveItem(["a", "b", "c"], 2, 0), ["c", "a", "b"]);
    assert.deepEqual(moveItem(["a", "b"], 0, 0), ["a", "b"]);
    assert.deepEqual(moveItem(["a", "b"], -1, 1), ["a", "b"]);
    assert.deepEqual(moveItem(["a", "b"], 0, 5), ["a", "b"]);
  });
});

describe("playlists", () => {
  it("creates, renames, duplicates, and deletes", () => {
    let state = emptyState();
    state = createPlaylist(state, "  Evening  ", ctx, [PLAYABLE]);
    assert.equal(state.playlists.length, 1);
    assert.equal(state.playlists[0]?.name, "Evening");
    assert.deepEqual(state.playlistOrder, ["npl_test_1"]);

    state = renamePlaylist(state, "npl_test_1", "Night Desk", {
      ...ctx,
      now: () => 2,
    });
    assert.equal(state.playlists[0]?.name, "Night Desk");

    const dupCtx = { now: () => 3, id: () => "npl_copy" };
    state = duplicatePlaylist(state, "npl_test_1", dupCtx);
    assert.equal(state.playlists.length, 2);
    const copy = state.playlists.find((p) => p.id === "npl_copy");
    assert.equal(copy?.name, "Night Desk (copy)");
    assert.deepEqual(copy?.trackIds, [PLAYABLE]);
    assert.deepEqual(state.playlistOrder, ["npl_test_1", "npl_copy"]);

    state = deletePlaylist(state, "npl_test_1");
    assert.equal(state.playlists.length, 1);
    assert.deepEqual(state.playlistOrder, ["npl_copy"]);
  });

  it("ignores blank names", () => {
    const state = createPlaylist(emptyState(), "   ", ctx);
    assert.equal(state.playlists.length, 0);
  });

  it("adds, removes, and reorders tracks", () => {
    let state = createPlaylist(emptyState(), "Mix", ctx, [PLAYABLE, PLAYABLE_B]);
    state = addTracksToPlaylist(state, "npl_test_1", [PLAYABLE_C], ctx);
    assert.deepEqual(state.playlists[0]?.trackIds, [
      PLAYABLE,
      PLAYABLE_B,
      PLAYABLE_C,
    ]);
    state = reorderPlaylistTracks(state, "npl_test_1", 2, 0, ctx);
    assert.deepEqual(state.playlists[0]?.trackIds, [
      PLAYABLE_C,
      PLAYABLE,
      PLAYABLE_B,
    ]);
    state = removeTrackFromPlaylist(state, "npl_test_1", 1, ctx);
    assert.deepEqual(state.playlists[0]?.trackIds, [PLAYABLE_C, PLAYABLE_B]);
  });
});

describe("queue order", () => {
  it("play now inserts at the current slot", () => {
    let state = emptyState();
    state = playNow(state, PLAYABLE, ctx);
    state = addToEnd(state, PLAYABLE_B);
    state = addToEnd(state, PLAYABLE_C);
    assert.deepEqual(state.queue, [PLAYABLE, PLAYABLE_B, PLAYABLE_C]);
    assert.equal(state.queueIndex, 0);
    assert.equal(state.playback.playing, true);

    state = playNow(state, PLAYABLE_C, ctx);
    assert.deepEqual(state.queue, [PLAYABLE_C, PLAYABLE, PLAYABLE_B]);
    assert.equal(state.queueIndex, 0);
  });

  it("add next and add to end preserve the current item", () => {
    let state = playNow(emptyState(), PLAYABLE, ctx);
    state = addToEnd(state, PLAYABLE_C);
    state = addNext(state, PLAYABLE_B);
    assert.deepEqual(state.queue, [PLAYABLE, PLAYABLE_B, PLAYABLE_C]);
    assert.equal(state.queueIndex, 0);
  });

  it("reorder keeps the current track under the playhead", () => {
    let state = playTracks(emptyState(), [PLAYABLE, PLAYABLE_B, PLAYABLE_C], ctx);
    state = reorderQueue(state, 0, 2);
    assert.deepEqual(state.queue, [PLAYABLE_B, PLAYABLE_C, PLAYABLE]);
    assert.equal(state.queue[state.queueIndex], PLAYABLE);
  });

  it("remove, next, prev, and clear", () => {
    let state = playTracks(emptyState(), [PLAYABLE, PLAYABLE_B, PLAYABLE_C], ctx);
    state = nextTrack(state, ctx);
    assert.equal(state.queueIndex, 1);
    state = prevTrack(state, ctx);
    assert.equal(state.queueIndex, 0);
    state = { ...state, playback: { ...state.playback, positionSec: 12 } };
    state = prevTrack(state, ctx);
    assert.equal(state.queueIndex, 0);
    assert.equal(state.playback.positionSec, 0);
    state = removeFromQueue(state, 0);
    assert.deepEqual(state.queue, [PLAYABLE_B, PLAYABLE_C]);
    assert.equal(state.queueIndex, 0);
    state = clearQueue(state);
    assert.deepEqual(state.queue, []);
    assert.equal(state.playback.playing, false);
  });

  it("refuses embedding-disabled and unavailable items", () => {
    let state = playNow(emptyState(), BLOCKED, ctx);
    assert.equal(state.playback.playing, false);
    assert.match(state.playback.pauseReason ?? "", /can't play/i);
    state = playNow(emptyState(), GONE, ctx);
    assert.match(state.playback.pauseReason ?? "", /unavailable/i);
  });

  it("advances when a track finishes", () => {
    let state = playTracks(emptyState(), [PLAYABLE, PLAYABLE_B], ctx);
    state = tickPlayback(state, 214, 214, ctx);
    assert.equal(state.queueIndex, 1);
    assert.equal(state.playback.positionSec, 0);
    assert.equal(state.playback.playing, true);
    state = tickPlayback(state, 187, 187, ctx);
    assert.equal(state.playback.playing, false);
  });
});

describe("favorites", () => {
  it("toggles and keeps newest first", () => {
    let state = emptyState();
    state = toggleFavorite(state, PLAYABLE);
    state = toggleFavorite(state, PLAYABLE_B);
    assert.deepEqual(state.favorites, [PLAYABLE_B, PLAYABLE]);
    state = toggleFavorite(state, PLAYABLE_B);
    assert.deepEqual(state.favorites, [PLAYABLE]);
  });
});

describe("history", () => {
  it("records unique recent plays and caps length", () => {
    let state = emptyState();
    for (let i = 0; i < HISTORY_LIMIT + 5; i += 1) {
      state = recordPlay(state, `ntrk_${i}`, {
        now: () => i,
        id: ctx.id,
      });
    }
    assert.equal(state.history.length, HISTORY_LIMIT);
    assert.equal(state.history[0]?.trackId, `ntrk_${HISTORY_LIMIT + 4}`);
    state = recordPlay(state, `ntrk_${HISTORY_LIMIT + 4}`, {
      now: () => 9999,
      id: ctx.id,
    });
    assert.equal(
      state.history.filter((h) => h.trackId === `ntrk_${HISTORY_LIMIT + 4}`)
        .length,
      1,
    );
    assert.equal(state.history[0]?.playedAt, 9999);
  });
});

describe("library", () => {
  it("adds without duplicates and removes in bulk", () => {
    let state = addToLibrary(emptyState(), [PLAYABLE, PLAYABLE, PLAYABLE_B], ctx);
    assert.equal(state.library.length, 2);
    state = removeFromLibrary(state, [PLAYABLE, PLAYABLE_C]);
    assert.deepEqual(
      state.library.map((i) => i.trackId),
      [PLAYABLE_B],
    );
  });
});

describe("pause-on-hidden", () => {
  it("pauses when the player is hidden and does not auto-resume", () => {
    let state = playNow(emptyState(), PLAYABLE, ctx);
    assert.equal(state.playback.playing, true);
    state = applyVisibility(state, false);
    assert.equal(state.playback.playing, false);
    assert.equal(state.playback.playerVisible, false);
    assert.equal(state.playback.pauseReason, HIDDEN_PAUSE_MESSAGE);

    state = applyVisibility(state, true);
    assert.equal(state.playback.playerVisible, true);
    assert.equal(state.playback.playing, false);

    state = applyVisibility(state, false);
    state = togglePlay(state, ctx);
    assert.equal(state.playback.playing, false);
    assert.equal(state.playback.pauseReason, HIDDEN_PAUSE_MESSAGE);
  });

  it("tick pauses if visibility is lost mid-play", () => {
    let state = playNow(emptyState(), PLAYABLE, ctx);
    state = {
      ...state,
      playback: { ...state.playback, playerVisible: false },
    };
    state = tickPlayback(state, 1, 214, ctx);
    assert.equal(state.playback.playing, false);
    assert.equal(state.playback.pauseReason, HIDDEN_PAUSE_MESSAGE);
  });
});

describe("seed", () => {
  it("ships a usable demo library", () => {
    const seed = seedState();
    assert.ok(seed.playlists.length >= 4);
    assert.ok(seed.library.length >= 8);
    assert.ok(seed.queue.length >= 1);
    assert.equal(seed.playback.playing, false);
  });
});
