# YouTube policy boundary (Prompt 1)

**Access date:** 2026-09-11  
**Product:** Needle (temporary name) — personal, non-commercial listening library.  
**This stage:** offline mock catalog only. No live YouTube Data API, IFrame player, OAuth, or credentials.

Needle is designed so Prompt 2 can add official search and visible playback without crossing these rules. If current official documentation conflicts with this file at implementation time, stop and show the evidence.

## Official sources (accessed 2026-09-11)

| Topic | URL |
| --- | --- |
| Developer Policies | https://developers.google.com/youtube/terms/developer-policies |
| Policy guide | https://developers.google.com/youtube/terms/developer-policies-guide |
| Required Minimum Functionality | https://developers.google.com/youtube/terms/required-minimum-functionality |
| IFrame Player API | https://developers.google.com/youtube/iframe_api_reference |
| Player parameters | https://developers.google.com/youtube/player_parameters |
| Branding guidelines | https://developers.google.com/youtube/terms/branding-guidelines |
| Data API overview | https://developers.google.com/youtube/v3/getting-started |
| Quota costs | https://developers.google.com/youtube/v3/determine_quota_cost |
| OAuth installed apps | https://developers.google.com/identity/protocols/oauth2/native-app |
| YouTube docs index | https://developers.google.com/youtube/documentation |

## Practical product boundary

Needle **may** (later, with official APIs):

- Search public catalog metadata via YouTube Data API v3.
- Play **embeddable** videos in the **official, visible, unmodified** IFrame player.
- Keep local playlists, favorites, queue, and history as **video IDs + metadata**, never media files.
- Link out to YouTube / YouTube Music for the owner’s signed-in (including Premium) experience.
- Pause immediately when the player is not displayed (minimized, hidden, backgrounded, closed).

Needle **must not**:

- Download, cache, proxy, transcode, or store copies of audiovisual content.
- Separate, isolate, or promote audio-only playback.
- Block, modify, or replace ads.
- Cover, restyle, nest, or alter the YouTube player, its controls, branding, captions, or links.
- Continue playback when the player is not visible, or run background/tray audio as an API client.
- Spoof, suppress, or omit `Referer` / client identity (error 153 if missing).
- Request Google passwords, paste secrets into chat, or store API keys in source, logs, or screenshots.
- Claim that YouTube Premium suppresses ads inside an unsigned embedded player.

## Required Minimum Functionality (embedded player)

- Embedded players need a viewport of **at least 200×200**; 16:9 should be at least **480×270** when practical.
- Do not overlay or obscure any part of the player, including controls.
- Do not change player attributes (including YouTube branding) except as documented.
- Autoplay must not start until the player is visible and **more than half** of it is on screen.
- Only one YouTube player may autoplay on a page at a time. Needle disables autoplay by default; play starts from a user action.

## API client identity / Referer (desktop)

From Required Minimum Functionality (accessed 2026-09-11):

> API Clients that use the YouTube embedded player (including the YouTube IFrame Player API) must provide identification through the `HTTP Referer` request header.

In browsers, keep `Referrer-Policy` at `strict-origin-when-cross-origin` (do not suppress Referer). In desktop WebViews, `Referer` is often empty by default and **must be set** (e.g. WebView2 `CoreWebView2HttpRequestHeaders.SetHeader`). Missing identity returns IFrame error **153**.

Prompt 2 must prove the chosen shell can provide this identity **before** live playback is enabled. If it cannot, stop and present a compliant alternative. Do not spoof.

## Data API quota (planning)

Typical default quota is 10,000 units/day. Representative costs:

- `search.list` — 100 units
- `videos.list` — 1 unit

Needle will debounce search, require explicit submit for live queries, and resolve duration/embeddability with the smallest `videos.list` calls. Quota-exhausted state must be plain language.

## OAuth (installed app)

Google documents OAuth 2.0 for installed/desktop apps. Prompt 1 does not request any account scopes. Local playlists are the default. Account sync is optional, separately permissioned, and must present exact scopes before any OAuth begins. Credentials belong in a protected OS store, never in source or chat.

## Prompt 1 implementation notes

- `MediaProvider` is the seam. Only `MockYouTubeProvider` is implemented.
- Mock player surface is a reserved, proportioned area. **No audio is generated.**
- Visibility API + an explicit “simulate hidden window” control pause mock playback with:  
  `Playback pauses when the player is not visible`.
- Mock identifiers (`ntrk_*`) are stable library keys. No media-cache schema exists.

## Device recorded for this session

- Hostname: `hds-nx2uenr9samt`
- OS: Linux 6.12.8+ x86_64 (Grok Build web sandbox, not a Windows workstation)
- Node 22.23.2, npm 10.9.8, rustc/cargo 1.98.1 present
- **No Tauri CLI / WebView2 / Windows packager in this environment.** Needle ships here as a web app with the same domain model a later desktop shell can wrap.
