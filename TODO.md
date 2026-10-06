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

# Revision: site aesthetics matched to the ink landscape

## Step 11: Update index.css
- [x] Replace the sunset/sea palette with rice paper, three ink tones and one seal-vermilion accent (light and dark)
- [x] Remove the coral-to-blue gradient bar at the top
- [x] Brush-stroke rules for the header divider, h2 underline, footer divider and hr (CSS masks, theme-aware)
- [x] Post cards: semi-opaque paper, vertical brush stroke on the left, no orange glow
- [x] Serif body text; sans kept for nav, dates, tags, TOC and footer; dates as tracked small caps instead of monospace
- [x] Monochrome category tags, ink links with wash underlines, neutral shadows, ink selection colour
- [x] Paper halo behind TOC text for legibility over the landscape

## Step 12: Verify and deploy
- [x] Screenshots: home, research, long article (light), opinion (dark), narrow viewport
- [x] Push to main

# New research article: A New Mathematical Field for a Different Way of Dealing with Problems

Source: the author's Claude Doc "A New Kind of Mathematics" (text as pasted, figure node 3a42a03d-74b1).

## Step 13: Create blogposts/new-mathematical-field.html
- [ ] Full text as written, italics from the doc kept in references, citations linked to the reference list
- [ ] Footnote notes (* and †) as small notes under their paragraphs
- [ ] Equation k + w(q) >= log2 N typeset in the serif with italic variables
- [ ] Figure redrawn from the doc's widget (same words and numbers) in ink tones with one vermilion accent, theme-aware, responsive
- [ ] Meta, Open Graph and BlogPosting data dated 2026-10-05

## Step 14: Update index.css
- [ ] Figure, footnote, citation, equation and reference-list styles
- [ ] Figure line tokens validated with the dataviz validator (light #857D71, dark #6E665B against the vermilion accent)

## Step 15: List the article
- [ ] research.html, index.html latest posts, feed.xml, sitemap.xml
- [ ] zarzis.js: Research nav active on the new page

## Step 16: Verify and publish
- [ ] Screenshots of the article and figure in light, dark and narrow widths
- [ ] Check reference links respond
- [ ] Push to main and confirm the deploy
