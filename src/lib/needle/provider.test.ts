import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MockYouTubeProvider } from "./provider.ts";

describe("MockYouTubeProvider", () => {
  const provider = new MockYouTubeProvider();

  it("searches by title and channel", async () => {
    const byTitle = await provider.search("Copper");
    assert.ok(byTitle.some((t) => t.id === "ntrk_copper_hours"));
    const byChannel = await provider.search("harbor line");
    assert.ok(byChannel.length >= 3);
    const empty = await provider.search("zzzz-no-match");
    assert.equal(empty.length, 0);
  });

  it("returns a default set for an empty query", async () => {
    const home = await provider.search("");
    assert.ok(home.length > 0);
    assert.ok(home.every((t) => t.status === "playable"));
  });

  it("resolves ids and home feed", async () => {
    const track = await provider.getById("ntrk_quiet_hours");
    assert.equal(track?.channel, "Glass Meadow");
    const missing = await provider.getById("nope");
    assert.equal(missing, null);
    const feed = await provider.getHomeFeed("ntrk_copper_hours");
    assert.equal(feed.continueTrack?.id, "ntrk_copper_hours");
    assert.ok(!feed.suggested.some((t) => t.id === "ntrk_copper_hours"));
  });
});
