# Site Quality Upgrade TODO

## Step 1: Image Compression
- [x] Convert 3 large PNGs to WebP using ImageMagick

## Step 2: Rewrite index.css
- [x] Add Source Serif 4 font import
- [x] Increase base font to 18px desktop
- [x] Refine heading hierarchy with serif font
- [x] Widen line-height to 1.8
- [x] Add category tag pill styles
- [x] Add blog filter tab styles
- [x] Add filter transition animations
- [x] Add triple-dot hr divider
- [x] Add reading-time and back-link styles
- [x] Add page-top gradient border
- [x] Refine selection colors, scrollbar, pre/code blocks
- [x] Smoother transitions (0.3s ease)
- [x] More generous section spacing
- [x] Active nav indicator styles
- [x] Latest posts section styles for homepage

## Step 3: Rewrite zarzis.js
- [x] Remove setInterval polling for theme toggle
- [x] Remove duplicate initTheme() at line 267
- [x] Add initBlogFilters() function with URL hash support
- [x] Add setActiveNav() function
- [x] Simplify init() function

## Step 4: Update header.html
- [x] Add target="_blank" rel="noopener" to external links

## Step 5: Update HTML pages (inline header, og:image, copyright)
- [x] index.html (+ typo fixes, latest posts section, RSS link)
- [x] blog.html (+ category filter tabs, data attributes)
- [x] projects.html
- [x] blogposts/sunk-cost-fallacy-knowledge-acquisition.html
- [x] blogposts/mitigating-claude-code-reward-hacking.html
- [x] blogposts/llm-benchmarking.html
- [x] blogposts/aisoftwareengineers.html
- [x] projects/llm-knowledge-graphs.html (+ picture elements)
- [x] projects/llm-benchmarking-results.html
- [x] projects/project1.html

## Step 6: Create feed.xml
- [x] Atom feed with all 4 blog posts

## Step 7: Create 404.html
- [x] Custom not-found page matching site theme

## Step 8: Update sitemap.xml
- [x] All pages with lastmod dates
