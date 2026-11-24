# SalesHub Nepal — homepage redesign (sample)

A from-scratch "Cold Chain" homepage for SalesHub Nepal. This branch contains no code from the previous site; only the business assets (photos, videos, logo, favicons) were kept.

What's in the sample:

- **Cooler age gate**: the room cools from 24°C to 4°C behind fogged glass, then asks for 21+.
- **Wipe-the-glass hero**: a WebGL condensation pane over the pour videos. Move the mouse (or drag on a phone) to wipe it clear; the fog creeps back, beads form and drips run.
- **The loading bay**: a pinned horizontal scroll through the four houses, with the page changing colour per house and the product photos fanning out.
- **Call the floor**: the closing contact block.

## Run it locally

The WebGL hero needs the page served over HTTP. Opened as a plain file, it falls back to the unfrosted video.

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Stack

Static HTML/CSS/JS, no build step. GSAP 3.13 (ScrollTrigger, SplitText) and Lenis 1.3 are vendored in `vendor/`. Fonts: Big Shoulders, Big Shoulders Stencil and Hanken Grotesk from Google Fonts.

Respects `prefers-reduced-motion` (no WebGL, no pinning, no smooth scroll) and works without JavaScript.
