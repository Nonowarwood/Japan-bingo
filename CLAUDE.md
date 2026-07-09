# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

K-Shelf is a static, single-page web app (French UI/comments) for tracking a personal K-pop album/photocard/lightstick/concert collection. It's plain HTML/CSS/JS with no build step, no bundler, no package.json, and no test suite — files are served as-is (e.g. via GitHub Pages) and edited directly.

## Running it

There is no build/lint/test command. To work on it locally, just serve the directory over HTTP (opening `index.html` via `file://` will break the ES module import in `firebase.js` and the Spotify OAuth redirect):

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

## Architecture

### Script loading order matters

`index.html` loads scripts in this order, and later files depend on globals defined by earlier ones:

1. `themes.js` — theming/settings/i18n, exposes `window.applyTheme`, `window.t`, etc.
2. `firebase.js` (`type="module"`) — auth + Firestore sync, exposes everything via `window.*` (e.g. `window.signInWithGoogle`, `window.syncToFirestore`) so classic scripts can call it.
3. `script.js` — the actual app: all collection/UI/Spotify/concert logic, ~3200 lines, organized as one giant file with `// ===` banner comments marking sections (search for these banners to navigate: SIDEBAR, BADGES, DASHBOARD, COMMUNAUTÉ, BINDER PHOTOCARDS, SPOTIFY — PKCE OAuth, CONCERTS, PROFIL PUBLIC, etc.)
4. `profile.js` — renders the read-only public profile view (`?u=<uid>` style), reachable by other users viewing a shared profile.

Nothing is modularized beyond this — nearly all functions are attached to `window` so scripts can call across files freely. When adding functionality, follow the existing pattern (plain global functions/vars, `window.foo = foo` exports) rather than introducing modules/bundling.

### State and persistence model

- Source of truth while offline/logged-out is `localStorage`, read into globals at top of `script.js` (`kshelf_save`, `kshelf_photocards`, `kshelf_lightsticks`, `kshelf_concerts`, `kshelf_profile_extra`, `kshelf_settings`, `kshelf_share_settings`, `kshelf_binder_pages`, `kshelf_sidebar_tab`, `kshelf_geocode_cache`, `kshelf_lemontang_bg`).
- When logged in via Google (Firebase Auth), `firebase.js` mirrors the same data to/from Firestore (`readFromFirestore`/`writeToFirestore`) under one document per user, with complex fields (`collection`, `photocards`, `concerts`, `shareSettings`) stored as JSON strings (Firestore map/array limits workaround).
- `script.js` exposes its live state back to `firebase.js` via `window.collectionData` / `window.photocardsData` etc. (see the "EXPOSITION GLOBALE POUR FIREBASE SYNC" section) so the sync layer can read current state without a shared module.
- A debounced sync queue (`_syncPending`) batches writes so rapid local edits don't spam Firestore.
- `defaultCollectionData` in `script.js` is the seed/demo dataset (used for "mode démo"), not live user data.

### Public profile sharing

Users can expose a public, read-only view of their collection. `defaultShareSettings()`/`syncPublicProfile()` (in `firebase.js`) write a sanitized subset to a separate public Firestore doc; `profile.js` renders that view for visitors, independent of the authenticated app state in `script.js`.

### Landing page (iframe overlay)

`index.html` shows a full-screen landing/intro (`#kl-overlay`) as an iframe over the app when the user isn't authenticated, controlled by inline script at the bottom of `index.html`. It listens for `postMessage` events (`signin` / `demo`) from the iframe content to trigger `window.signInWithGoogle()` or load the demo collection. The iframe currently points at `a.html` (a marketing/landing page). Note: `index-integration.html` is leftover integration-notes documentation referencing an older filename (`welcome.html`) — the live wiring in `index.html` uses `a.html` instead; don't trust `index-integration.html`'s filename as current.

### Spotify integration

Gated behind an email allowlist (`SPOTIFY_ALLOWLIST` near the top of `script.js`) — only listed Google accounts see the Spotify player/stats UI (`applySpotifyVisibility()`). Auth uses OAuth PKCE directly from the browser (`SPOTIFY_CLIENT_ID`/`SPOTIFY_REDIRECT_URI`/`SPOTIFY_SCOPES`), with tokens cached in `localStorage` (`spotify_access_token`, `spotify_code_verifier`, `spotify_token_expiry`). Album metadata lookups go through a external proxy (`SPOTIFY_PROXY_URL`, a Val Town endpoint) rather than calling Spotify's REST API directly from the client for those calls.

### Concerts feature

Self-contained section in `script.js` (list view, Leaflet-based map view with Nominatim geocoding cached in `kshelf_geocode_cache`, add/edit modal, media upload with in-browser image compression). Follows the same local-first + Firestore-sync pattern as the rest of the app.

### Local audio files

`musique/` contains local MP3s referenced by filename from album entries (`mp3: "musique/..."` fields in collection data) and played through the local audio player wired up in the "SYSTEME AUDIO LOCAL" section of `script.js`.

### Profile surfaces — three distinct UIs, easy to conflate

"The profile page" is ambiguous in this codebase — there are three separate implementations, each with its own markup/CSS namespace and data source. Before touching "the profile page," confirm which one is meant:

1. **Own editable profile ("Mon profil")** — `#profile-modal-overlay` / `.kprofile-*` classes in `index.html`, opened via `openProfilePage()` in `script.js` (bound to the avatar dropdown). Lets the signed-in user edit pseudo, avatar, favorite group/album, biases, and social links, and shows their own stats (`renderKprofileStats()` → `#kprofile-stats-grid`). Backed by `profileExtra` (`kshelf_profile_extra` in localStorage, see "PROFIL ENRICHI — BIASES & RÉSEAUX" section of `script.js`). Styling is CSS-variable-driven (`--surface`, `--border`, `--accent`, `--bg`, `--text-primary`, `--text-secondary`) so it re-skins automatically across `body.theme-*` classes — per-theme overrides for `.kprofile-banner` etc. live further down in `style.css`. When adding new visual elements here, use those CSS vars (or reuse existing classes like `.badges-grid`/`.badge-card`) rather than hardcoding colors, or the new element will look wrong on the light themes (`theme-grid`, `theme-editorial`, `theme-kpopping`).
2. **Own public-card preview** — `#public-profile-overlay` / `.public-profile-*` classes, opened via `openPublicProfile()` in `script.js` ("PROFIL PUBLIC" section). A read-only modal preview of how the current user's own card looks, built from the same `profileExtra` + live `collectionData`/`concertsData`/`photocardsData`.
3. **Visitor-facing public profile** — `profile.js` + `profile.css` (`.pp-*` classes), triggered by `?profile=<uid>` in the URL (`checkForPublicProfile()`), replaces the *entire page* (`#public-profile-view`). Renders another user's shared collection read-only from the sanitized public Firestore doc (see "Public profile sharing" above) — independent of `script.js`'s authenticated state entirely.

### Badge/achievement system

`BADGE_DEFS` (array of `{id, name, desc, color, icon, check}`) and `computeCollectionStats()` in `script.js` ("SYSTÈME DE BADGES / ACHIEVEMENTS" section) compute unlock state from live collection/concert/photocard data. `renderBadgesHtml()` returns a ready-made `.home-section` block (used on the dashboard); it's reusable elsewhere by injecting its return value into any container's `innerHTML` — it doesn't need its own container markup since the label/count are baked into the returned HTML.
