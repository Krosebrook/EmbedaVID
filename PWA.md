# PWA Implementation Details

## Installability
- **Manifest:** Located at `./manifest.webmanifest`.
- **Icons:** Hosted on Google Static storage.
- **Display:** `standalone` for app-like experience.

## Caching Strategy
- **Core Logic (JS/CSS):** Stale-while-revalidate via `sw.js`.
- **CDNs:** Cache-first for React, Gemini SDK, and Lucide icons.
- **API (Gemini):** Network-only. We do not cache AI generations to ensure freshness and prevent data leakage.

## Offline Behavior
- App shell loads offline.
- Input fields remain active; generation requests fail gracefully with "Network Error" UI.
- Mock videos (MOCK_VIDEOS) are cached for demonstration in offline mode.

## Update Strategy
- `self.skipWaiting()` and `clients.claim()` are used in `sw.js` for immediate app updates on reload.