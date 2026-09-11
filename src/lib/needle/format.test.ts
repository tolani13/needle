import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDuration,
  formatDurationLong,
  greetingForHour,
  initials,
} from "./format.ts";

describe("formatDuration", () => {
  it("formats mm:ss and h:mm:ss", () => {
    assert.equal(formatDuration(0), "0:00");
    assert.equal(formatDuration(9), "0:09");
    assert.equal(formatDuration(214), "3:34");
    assert.equal(formatDuration(401), "6:41");
    assert.equal(formatDuration(3723), "1:02:03");
    assert.equal(formatDuration(-4), "0:00");
  });
});

describe("formatDurationLong", () => {
  it("uses minutes and hours", () => {
    assert.equal(formatDurationLong(0), "0 min");
    assert.equal(formatDurationLong(214), "4 min");
    assert.equal(formatDurationLong(3600), "1 hr");
    assert.equal(formatDurationLong(5400), "1 hr 30 min");
  });
});

describe("initials and greeting", () => {
  it("builds initials and time-of-day copy", () => {
    assert.equal(initials("Copper Hours"), "CH");
    assert.equal(initials(""), "N");
    assert.equal(greetingForHour(8), "Good morning");
    assert.equal(greetingForHour(19), "Good evening");
    assert.equal(greetingForHour(2), "Still up");
  });
});
