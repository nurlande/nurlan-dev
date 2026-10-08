# Pane Manager roadmap

Several sites side by side in one browser tab. Live at
https://nurlan-dev.web.app/lab/pane-manager.

## Done

- **Milestone 1:** tiled layouts (1–4 panes), per-pane address bars, a notice for
  sites that refuse embedding, workspace saved in `localStorage`.
- **Milestone 2:** draggable and keyboard-resizable dividers, maximize/restore,
  drag-to-swap, Alt/Option keyboard shortcuts.
- **Milestone 3:** named workspaces, templates, share links (layout in the URL
  hash), JSON export/import, strict validation of shared/imported data.

## Next

### 1. Move into its own repo

The folder is already self-contained: nothing imports from outside it, and
`index.ts` is the only public entry.

- Create a new repo (e.g. `pane-manager`) with this folder as `src/`.
- Build it as a library with Vite library mode; React and MUI become peer
  dependencies.
- Publish it (npm, or a GitHub dependency) and import it in the portfolio
  instead of the local folder. `src/lab/registry.ts` keeps lazy-loading it.
- Keep `PaneManagerLab.tsx` (the Lab card and full-screen wrapper) in the
  portfolio, or export it from the package. `PaneManager` already takes
  `shareBaseUrl`, so share links can point anywhere.
- Add unit tests for `core/` (layout tree, share encode/decode, validation);
  it has no React dependencies, so plain Vitest is enough.

### 2. Desktop app (Tauri) or Chrome extension

This removes the main limit: GitLab, GitHub, YouTrack, Jira, Google and others
send `X-Frame-Options` / CSP `frame-ancestors`, so no web page can embed them.
The blocked hosts are listed in `core/embedPolicy.ts`.

- **Tauri:** each pane becomes a native webview positioned over the layout
  rects from `computePaneRects`, so embedding rules don't apply and logins
  persist. Reuse `core/` and the React toolbar as-is.
- **Chrome extension:** use `declarativeNetRequest` to strip the blocking headers
  for frames inside the extension page only. Lighter than Tauri, but
  Chrome-only, and needs careful scoping for security review.
- Either way, `isKnownBlocked` becomes a no-op in that build, and the blocked
  notice is only shown on the web version.
