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
