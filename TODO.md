# Southern Tunisia Ink Landscape Background

Procedural ink-wash landscape drifting behind every page, in the spirit of
LingDong-/shan-shui-inf (MIT), journeying through Gafsa, Kebili and Zarzis.

## Step 1: Create landscape.js
- [x] Seeded PRNG and Perlin noise
- [x] Brush primitives: tapered strokes, dry-brush breaks, washes, consistent winding for merged paths
- [x] Three parallax layers (far / mid / near) built from deterministic chunks, created and recycled while drifting
- [x] Region weights along the journey with blended transitions: Gafsa -> Kebili -> Zarzis -> Gafsa
- [x] Gafsa: layered jebel ridges with strata and gullies, Tamerza-style canyon mesas, alfa grass, boulders, oasis palms, koubba
- [x] Kebili: Chott el Djerid salt flat with mirage reflections, dunes, Jebel Tebaga, dense palm groves, ksar walls, camel caravans
- [x] Zarzis: sea horizon, waves, flouka boats, olive groves, shore palms, white domed houses
- [x] Birds, seal-style place caption (Latin and Arabic)
- [x] Slow auto-drift, paused under prefers-reduced-motion, journey position kept across pages for the session

## Step 2: Update index.css
- [x] Landscape layer, ink and paper tokens for light and dark themes
- [x] Fade behind the text column, mobile treatment, hidden in print
- [x] Seal caption styles

## Step 3: Update zarzis.js
- [x] Load landscape.js on every page that already loads zarzis.js

## Step 4: Credit
- [x] Credit shan-shui-inf (MIT) in README.md

## Step 5: Verify and deploy
- [x] Headless Chrome screenshots: each region in light mode, Gafsa in dark mode, Kebili on mobile
- [x] Check text readability and DOM size per region (live drift smoothness not measured)
- [x] Push to main

# Revision: continuous journey without place names

## Step 6: Update landscape.js
- [x] Remove the seal caption and its place names
- [x] Shorten regions (4200 -> 2000 units) and double the drift speed, so each region passes in about 80 seconds
- [x] Widen transition zones (28% -> 40% of a region) and scale landforms by region weight so one place morphs into the next
- [x] `?landscape=` now starts the journey as it arrives in the named region

## Step 7: Update index.css
- [x] Remove seal styles and tokens

## Step 8: Update README.md
- [x] Describe the new `?landscape=` behaviour

## Step 9: Verify and deploy
- [x] Headless Chrome screenshots of all three transitions
- [x] Push to main

# Revision: reduced-motion visitors

## Step 10: Update landscape.js
- [x] Drift at a quarter speed (about 10 px/s) instead of stopping when the system asks for reduced motion
- [x] Re-check the setting every frame so toggling it applies without a reload
- [x] Verified over DevTools protocol: 40 px/s normal, 10 px/s reduced, 0 exceptions
- [x] Push to main
