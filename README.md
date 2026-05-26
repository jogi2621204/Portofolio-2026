# Jogi Panggabean — Portfolio

Scroll-driven 3D portfolio website. Each scroll zooms the camera through one of the orbital rings, revealing a content chapter as a glass panel overlay.

## Stack

- **Three.js r160** (bundled locally as `three.min.js`) — 3D scene, globe, orbital rings, particle field
- **GSAP + ScrollTrigger** (CDN) — camera path driven by scroll progress
- **Vanilla CSS + JS** — no framework, no build step
- **Satoshi** font via Fontshare CDN

## Structure

```
index.html          Main page — 7 scroll chapters
style.css           All styles
orbital-journey.js  Three.js scene + GSAP ScrollTrigger camera animation
script.js           Nav scroll effect + mobile menu
three.min.js        Three.js r160 local copy (required, no CDN fallback)
images/             Photo assets
```

## Chapters

| # | Section    | Camera move                        |
|---|------------|------------------------------------|
| 0 | Hero       | Full overview, all rings visible   |
| 1 | About      | Zoom toward ring 1                 |
| 2 | Education  | Ring 1 at steep angle              |
| 3 | Experience | Zoom into ring 2                   |
| 4 | Research   | Ring 2 angle, ring 3 ahead         |
| 5 | Awards     | Deep into ring 3                   |
| 6 | Contact    | Zoom way out, all rings small      |

## Running locally

Open `index.html` in any modern browser — no build step needed. For GSAP CDN assets to load, serve over HTTP (not `file://`):

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Deployment

Static site — deploy to GitHub Pages, Netlify, Vercel, or any static host. Point the root to this folder.
