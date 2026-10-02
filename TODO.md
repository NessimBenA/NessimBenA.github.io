# Southern Tunisia Ink Landscape Background

Procedural ink-wash landscape drifting behind every page, in the spirit of
LingDong-/shan-shui-inf (MIT), journeying through Gafsa, Kebili and Zarzis.

## Step 1: Create landscape.js
- [ ] Seeded PRNG and Perlin noise
- [ ] Brush primitives: tapered strokes, dry-brush breaks, washes, consistent winding for merged paths
- [ ] Three parallax layers (far / mid / near) built from deterministic chunks, created and recycled while drifting
- [ ] Region weights along the journey with blended transitions: Gafsa -> Kebili -> Zarzis -> Gafsa
- [ ] Gafsa: layered jebel ridges with strata and gullies, Tamerza-style canyon mesas, alfa grass, boulders, oasis palms, koubba
- [ ] Kebili: Chott el Djerid salt flat with mirage reflections, dunes, Jebel Tebaga, dense palm groves, ksar walls, camel caravans
- [ ] Zarzis: sea horizon, waves, flouka boats, olive groves, shore palms, white domed houses
- [ ] Birds, seal-style place caption (Latin and Arabic)
- [ ] Slow auto-drift, paused under prefers-reduced-motion, journey position kept across pages for the session

## Step 2: Update index.css
- [ ] Landscape layer, ink and paper tokens for light and dark themes
- [ ] Fade behind the text column, mobile treatment, hidden in print
- [ ] Seal caption styles

## Step 3: Update zarzis.js
- [ ] Load landscape.js on every page that already loads zarzis.js

## Step 4: Credit
- [ ] Credit shan-shui-inf (MIT) in README.md

## Step 5: Verify and deploy
- [ ] Headless Chrome screenshots: each region, light and dark, desktop and mobile
- [ ] Check text readability and drift performance
- [ ] Push to main
