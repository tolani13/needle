import type { AppState, Playlist } from "./types.ts";
import { SCHEMA_VERSION, defaultPlayback, defaultSettings } from "./types.ts";

const t = {
  evening: "npl_evening_desk",
  drive: "npl_weekend_drive",
  quiet: "npl_quiet_hours",
  fresh: "npl_fresh_saves",
} as const;

function playlist(
  id: string,
  name: string,
  trackIds: string[],
  createdAt: number,
): Playlist {
  return { id, name, trackIds, createdAt, updatedAt: createdAt };
}

const T0 = 1_725_000_000_000;

export function seedState(): AppState {
  const playlists: Playlist[] = [
    playlist(t.evening, "Evening Desk", [
      "ntrk_copper_hours",
      "ntrk_desk_lamp",
      "ntrk_north_room_two",
      "ntrk_paper_dock",
      "ntrk_wire_garden",
      "ntrk_veras_window",
      "ntrk_quiet_hours",
      "ntrk_after_hours",
    ], T0),
    playlist(t.drive, "Weekend Drive", [
      "ntrk_late_atlas",
      "ntrk_weekend_mile",
      "ntrk_harbor_night",
      "ntrk_drive_glass",
      "ntrk_june_radar",
      "ntrk_radar_bloom",
    ], T0 + 1),
    playlist(t.quiet, "Quiet Hours", [
      "ntrk_quiet_hours",
      "ntrk_low_atlas_drift",
      "ntrk_meadow_low",
      "ntrk_elm_circuit",
      "ntrk_hollow_pine",
    ], T0 + 2),
    playlist(t.fresh, "Fresh Saves", [
      "ntrk_field_notes",
      "ntrk_saint_copper",
      "ntrk_night_parcel",
      "ntrk_vale_light",
    ], T0 + 3),
  ];

  return {
    version: SCHEMA_VERSION,
    library: [
      "ntrk_copper_hours",
      "ntrk_late_atlas",
      "ntrk_paper_dock",
      "ntrk_kin_wires",
      "ntrk_static_orchard",
      "ntrk_veras_window",
      "ntrk_late_stations",
      "ntrk_elm_circuit",
      "ntrk_hollow_pine",
      "ntrk_lantern_walk",
      "ntrk_quiet_hours",
      "ntrk_weekend_mile",
      "ntrk_field_notes",
      "ntrk_desk_lamp",
      "ntrk_after_hours",
      "ntrk_soft_grid",
    ].map((trackId, i) => ({ trackId, addedAt: T0 - i * 86_400_000 })),
    playlists,
    playlistOrder: [t.evening, t.drive, t.quiet, t.fresh],
    favorites: [
      "ntrk_copper_hours",
      "ntrk_quiet_hours",
      "ntrk_late_atlas",
      "ntrk_veras_window",
      "ntrk_hollow_pine",
      "ntrk_weekend_mile",
    ],
    history: [
      { trackId: "ntrk_copper_hours", playedAt: T0 + 80_000 },
      { trackId: "ntrk_desk_lamp", playedAt: T0 + 60_000 },
      { trackId: "ntrk_late_atlas", playedAt: T0 + 40_000 },
      { trackId: "ntrk_paper_dock", playedAt: T0 + 20_000 },
      { trackId: "ntrk_veras_window", playedAt: T0 },
      { trackId: "ntrk_quiet_hours", playedAt: T0 - 10_000 },
    ],
    queue: [
      "ntrk_copper_hours",
      "ntrk_desk_lamp",
      "ntrk_north_room_two",
      "ntrk_paper_dock",
    ],
    queueIndex: 0,
    playback: { ...defaultPlayback(), positionSec: 42 },
    settings: defaultSettings(),
  };
}
