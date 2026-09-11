import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  exportState,
  loadState,
  migrate,
  resetState,
  saveState,
  STORAGE_KEY,
  validateImport,
} from "./persistence.ts";
import { seedState } from "./seed.ts";
import { SCHEMA_VERSION, emptyState } from "./types.ts";

class MemoryStorage {
  store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
}

describe("persistence migration", () => {
  it("seeds when storage is empty", () => {
    const storage = new MemoryStorage();
    const state = loadState(storage);
    assert.equal(state.playlists.length, seedState().playlists.length);
    assert.equal(state.version, SCHEMA_VERSION);
  });

  it("migrates versionless payloads and drops unknown keys", () => {
    const migrated = migrate({
      library: [{ trackId: "ntrk_copper_hours", addedAt: 1 }],
      playlists: [
        {
          id: "p1",
          name: "One",
          trackIds: ["ntrk_copper_hours"],
          createdAt: 1,
          updatedAt: 1,
        },
      ],
      extra: { nope: true },
      favorites: ["ntrk_copper_hours", "ntrk_copper_hours"],
      queue: ["ntrk_copper_hours"],
      queueIndex: 99,
      settings: { theme: "light" },
    });
    assert.equal(migrated.version, SCHEMA_VERSION);
    assert.deepEqual(migrated.favorites, ["ntrk_copper_hours"]);
    assert.equal(migrated.queueIndex, 0);
    assert.equal(migrated.settings.theme, "light");
    assert.equal(migrated.settings.playerSize, "full");
    assert.equal(migrated.playback.playing, false);
    assert.deepEqual(migrated.playlistOrder, ["p1"]);
  });

  it("returns empty state for garbage", () => {
    const migrated = migrate("not-an-object");
    assert.deepEqual(migrated.library, emptyState().library);
  });

  it("round-trips through save/load", () => {
    const storage = new MemoryStorage();
    const original = seedState();
    original.settings.theme = "light";
    saveState(storage, original);
    assert.ok(storage.getItem(STORAGE_KEY));
    const loaded = loadState(storage);
    assert.equal(loaded.settings.theme, "light");
    assert.equal(loaded.playlists.length, original.playlists.length);
    assert.equal(loaded.playback.playing, false);
  });

  it("reset restores the demo seed", () => {
    const storage = new MemoryStorage();
    saveState(storage, emptyState());
    const reset = resetState(storage);
    assert.ok(reset.playlists.length >= 4);
  });
});

describe("import validation", () => {
  it("accepts exported JSON", () => {
    const json = exportState(seedState());
    const result = validateImport(json);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.state.playlists.length, seedState().playlists.length);
    }
  });

  it("rejects non-JSON, arrays, and malformed playlists", () => {
    assert.equal(validateImport("{{{").ok, false);
    assert.equal(validateImport([]).ok, false);
    assert.equal(validateImport(null).ok, false);
    const bad = validateImport({
      playlists: [{ id: "p", name: "x" }],
    });
    assert.equal(bad.ok, false);
  });

  it("never executes imported content — data only", () => {
    const sneaky = {
      version: 1,
      library: [{ trackId: "ntrk_copper_hours", addedAt: 1 }],
      __proto__: { polluted: true },
      playlists: [],
    };
    const result = validateImport(sneaky);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(
        Object.prototype.hasOwnProperty.call(result.state, "polluted"),
        false,
      );
    }
  });
});
