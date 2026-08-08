---
name: mobile-map-qa
description: Real-device mobile QA checklist for the Journey and Atlas interactive maps (pinch-zoom, drag-pan, pin tap, letterboxing). Use when testing either map on a real phone.
---

### Mobile QA checklist — real device, not just simulator
Verified on iPhone SE **simulator** only (fixed the letterbox/cover-zoom bug there); NOT yet checked on a real phone. Test at `https://odysseygloss.vercel.app/#atlas`:
1. **Map fills the screen edge-to-edge in portrait**, no grey letterbox bands top/bottom (this was the bug fixed via the cover-zoom change above — confirm it holds on real hardware, not just the simulator).
2. **Pinch-to-zoom** — reasonably responsive, not sluggish. The `wheelPxPerZoomLevel` fix only affects mouse/trackpad scroll; touch pinch-zoom is a separate Leaflet code path that was **never touched or tested**.
3. **Drag-to-pan** with a finger.
4. **Tap a pin** (Egypt or Ethiopia) → popup appears → tap "View artworks" → lightbox opens on top of the map → close it → map should still be open underneath.
5. **The "×" close button** — on the simulator screenshot, the title "Atlas — the Red Sea Plate" wraps to two lines and the close button sits tight against the wrapped text. Confirm it's still comfortably tappable and not visually cramped/misaligned on a real screen.
6. **Minimap thumbnail** (bottom-left) — fixed-size (132px), never adjusted for mobile; check it isn't awkwardly large/intrusive on a small screen.
7. **Pin dragging in `#atlas/edit`** — drag a pin with a finger: it should follow the finger and commit new coords on release, and the map must NOT pan underneath. (Fixed 2026-07-16 by restoring native Leaflet drag; verified with emulated Chromium touch only — real iOS Safari unconfirmed.)
Same checklist applies to `JourneyMap` if it hasn't been device-tested recently — it shares the same wheel-zoom and cover-zoom code paths (both just changed).

