# Site Quality Upgrade TODO

## Step 1: Image Compression
- [ ] Convert 3 large PNGs to WebP using ImageMagick
- [ ] Update .gitignore if needed

## Step 2: Rewrite index.css
- [ ] Add Source Serif 4 font import
- [ ] Increase base font to 18px desktop
- [ ] Refine heading hierarchy with serif font
- [ ] Widen line-height to 1.8
- [ ] Add category tag pill styles
- [ ] Add blog filter tab styles
- [ ] Add filter transition animations
- [ ] Add triple-dot hr divider
- [ ] Add reading-time and back-link styles
- [ ] Add page-top gradient border
- [ ] Refine selection colors, scrollbar, pre/code blocks
- [ ] Smoother transitions (0.3s ease)
- [ ] More generous section spacing
- [ ] Active nav indicator styles
- [ ] Latest posts section styles for homepage

## Step 3: Rewrite zarzis.js
- [ ] Remove setInterval polling for theme toggle
- [ ] Remove duplicate initTheme() at line 267
- [ ] Add initBlogFilters() function with URL hash support
- [ ] Simplify init() function

## Step 4: Update header.html
- [ ] Add target="_blank" rel="noopener" to external links
- [ ] Add active page indicator support via data attribute

## Step 5: Update HTML pages (inline header, og:image, copyright)
- [ ] index.html
- [ ] blog.html
- [ ] projects.html
- [ ] blogposts/sunk-cost-fallacy-knowledge-acquisition.html
- [ ] blogposts/mitigating-claude-code-reward-hacking.html
- [ ] blogposts/llm-benchmarking.html
- [ ] blogposts/aisoftwareengineers.html
- [ ] projects/llm-knowledge-graphs.html
- [ ] projects/llm-benchmarking-results.html
- [ ] projects/project1.html

## Step 6: Create feed.xml

## Step 7: Create 404.html

## Step 8: Update sitemap.xml
