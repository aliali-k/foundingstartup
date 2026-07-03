## Goal

Turn this blank Lovable project into the **Cosmic Navigator** app (from `cosmic-navigator-main.zip`), then apply the five requested changes.

## Step 1 — Import Cosmic Navigator as the base

- `rsync -a --exclude='.git'` from `cosmic-navigator-main/` into `/dev-server/`, overwriting the blank starter (`src/routes/`, `src/components/`, `src/lib/`, `src/styles.css`, `package.json`, `vite.config.ts`, etc.).
- Copy `public/*` and `src/assets/*` in full.
- Keep the current `.git`, `.lovable/`, `AGENTS.md` intact (never copy `.git` from the ZIP).
- Run `bun install` for the new deps (`pdfjs-dist`, extra Radix packages, etc.).
- Verify the build before making any of the five changes.

## Step 2 — Replace the PDF upload section only (change #1)

The Cosmic Navigator upload UI lives inside `src/routes/predict.tsx` (solar system + upload). The reference upload UI lives in `src/routes/index.tsx` of `final_solar_system_frontendforportconnection-main`.

- In `src/routes/predict.tsx`, find the `<section id="upload">…</section>` block.
- Delete only that section's visual markup (headline, dashed drop card, error box, action row with "Predict Now").
- Paste in the JSX from the reference repo's SECTION 2, verbatim in structure/layout.
- Wire it back to Cosmic Navigator's existing state and handlers already in `predict.tsx`: `parsing`, `report`, `fileName`, `error`, `handleFile`, `predict()`, `parsePredictionPdf`, `setReport`, `/processing` navigate, and the `?pdfId=` auto-fetch effect. Do not touch that logic — only the JSX/classes wrapping it.
- Leave SECTION 1 (the `<BranchSolarSystem />` block, sticky header, grid backdrop) untouched.

### Restyle to Cosmic Navigator's tokens (change #5)

The reference block already uses matching token names (`bg-background`, `text-primary`, `border-border`, `font-mono`, `josaa-grid`). Sweep the pasted JSX and:

- Strip any hard-coded hex colors, new font imports, or classes not in Cosmic Navigator's `src/styles.css`.
- Keep colors as semantic tokens (`text-primary`, `bg-card/60`, `text-muted-foreground`).
- No new fonts, no new palette variables.

## Step 3 — Shrink the theme toggle (change #2)

- Files: `src/components/ThemeSwitch.tsx` and the `.theme-orb*` rules in `src/styles.css`.
- Reduce the orb diameter and inner icon size by ~30–40% (e.g. ~44px → 28px, icon ~20px → 14px, adjust padding).
- Keep the sun/moon animation, colors, border, and behavior identical — only shrink dimensions.

## Step 4 — Default to light theme for new visitors (change #3)

- `src/components/theme-provider.tsx`: change `useState<Theme>("dark")` to `"light"` and the context default to `"light"`.
- `src/components/ThemeToggle.tsx`: change the pre-hydration script from `stored !== "light"` (defaults to dark) to `stored === "dark"` (defaults to light) so the `dark` class is only added when explicitly picked.
- Users with an existing `josaa-theme` in localStorage keep their choice; only first-time visitors change.

## Step 5 — Replace only the Branch Compass tile (change #4, revised)

- File: `src/components/ResultDashboard.tsx`.
- Keep **TILE 01 — TOP MATCH** as is. Keep **TILE 02 — DOWNLOAD PDF** as is. Keep all **NAV_TILES (04+)** as is.
- Remove **TILE 03 — BRANCH COMPASS** (lines ~288–320).
- Replace it with a single new tile: **"03 · MARKS → RANK"** titled **"Marks vs Rank Predictor"**.
  - Same `TileShell` wrapper and glow style as the tile it replaces (`glow="#22d3a4"`), same mono label pattern, same typographic hierarchy so the grid doesn't shift.
  - Short copy: e.g. "See where your marks land on the JEE rank curve. Live predictor coming soon."
  - Inline SVG mini line chart: axes + one smooth curve through ~6 hard-coded (marks, rank) points, using semantic colors (`--accent`, `--muted-foreground`), no external chart lib.
- Wrap the tile in an `<a href={COMING_SOON_URL} target="_blank" rel="noopener noreferrer">` (single top-of-file const for easy edit) so clicking opens a "coming soon" placeholder page in a new tab.

## Step 6 — Head metadata and verification

- Set real `title` / `description` / `og:*` / `twitter:card` on `src/routes/__root.tsx` (e.g. "JoSAA College Predictor" — replace the "Lovable App" default).
- Build, then load `/`, `/predict`, `/processing` and the dashboard route in Playwright at light (default) and dark themes and screenshot to confirm:
  - Solar system unchanged.
  - New upload section renders with Cosmic Navigator colors/fonts.
  - Theme toggle is visibly smaller.
  - First load is light theme.
  - Dashboard now shows the new "Marks vs Rank Predictor" tile in place of Branch Compass; TOP MATCH tile unchanged; clicking the new tile opens the external URL in a new tab.

## Out of scope

- No changes to the solar system, PDF parsing, `/processing` animation, routing, TOP MATCH tile, or Download PDF tile.
- No new color palette, no new fonts, no new dependencies beyond what the ZIP's `package.json` lists.
