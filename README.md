# Needle

A calm personal listening library. Search, save, make playlists, queue what is next, and keep a player in reach — without the clutter of a video site.

Needle is a **personal, non-commercial** project. The name is temporary and easy to change. This build uses a **mock offline catalog**. Live YouTube search and the official visible player are not connected yet.

## What you can do

- Search the demo catalog instantly
- Play a mock item (progress only — no audio, no downloaded media)
- Add next / add to the end of the queue, reorder, and clear
- Save to Library, Favorites, and Playlists
- Create, rename, duplicate, reorder, and delete playlists
- Continue where you left off after a refresh
- Playback **pauses when the player is not visible** (hide the tab, or use Settings → Simulate hidden window)

## What Needle will not do

- Download, extract, or cache media
- Play in the background or while minimized
- Block ads or alter a YouTube player
- Sign in to YouTube in this offline build

## Your data

Playlists, favorites, queue, history, and settings stay **on this device** in the browser. Nothing is uploaded.

- **Export** a JSON copy from Settings
- **Import** a Needle library file (invalid files are rejected; imported content is never executed)
- **Restore demo library** replaces your local data with the sample catalog, after confirmation

## Keyboard

| Key | Action |
| --- | --- |
| `/` | Search |
| Space or K | Play / pause |
| ← / → or J | Previous / next |
| F | Favorite current |
| N / Q | Now playing / Queue |
| ? | Shortcut list |

## Architecture (short)

UI talks to a `MediaProvider`. Today that is `MockYouTubeProvider`. A later YouTube provider can slot in without rewriting playlists or the queue. Stored records keep stable IDs only — never media files.

## Rename

Visible product name lives in the wordmark, page titles, and `src/lib/og/site.json`. Swap `Needle` there when a final name is chosen.
