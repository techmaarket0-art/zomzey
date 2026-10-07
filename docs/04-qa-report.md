# 04 — QA report

Run with `npm run dev` + `npm run qa` (Playwright 1.56 / Chromium, axe-core 4.10).
Raw output: [`docs/qa-results.json`](qa-results.json).

| Check | Result |
|---|---|
| Horizontal overflow — homepage + style guide at 320, 360, 390, 414, 600, 768, 900, 1024, 1180, 1280, 1366, 1440, 1680, 1920, 2560 | **30 / 30 clean** |
| Clipped text (non-scrolling boxes) | **None** |
| axe-core (WCAG 2.0/2.1/2.2 A + AA, best-practice) — home @1440, home @390, style guide @1440 | **0 violations** (50 / 51 / 40 passing rules) |
| Console errors / warnings / page errors (all widths) | **None** |
| Reduced motion (`prefers-reduced-motion: reduce`) | No running animations, connection dots hidden, ticker static, stamps fully visible, no reveal-hidden content, pause control hidden |
| Keyboard | Skip link first; logical order header → intent tabs → sentence builder → CTA → hero pause → deal stages → index; ←/→/Home/End move between intent tabs; Esc closes Tools, menu and brief sheets; focus returns to the opener; every stop shows a 2px violet ring |
| Performance (local, cold, cache disabled) | 356 KB transferred, 8 requests, no third-party requests, CLS 0, LCP ≈ 0.17–0.26 s |
| Fonts | 3 self-hosted variable WOFF2 files (184 KB total), display & UI preloaded, `font-display: swap` |
| Images | No bitmaps on the page; all artefacts and icons are inline SVG |

## Contrast (computed, WCAG 2.x)
| Pair | Ratio |
|---|---|
| Ink on paper | 16.2 : 1 |
| Ink 2 (body) on paper | 8.6 : 1 |
| Ink 3 (meta) on paper / paper-2 / card | 5.2 / 4.7 / 5.7 : 1 |
| Violet on paper · white on violet | 6.5 · 7.4 : 1 |
| Release Green on paper · on green-soft | 5.4 · 5.1 : 1 |
| On-night 2 / 3 on night | 9.1 / 5.2 : 1 |
| Violet-on-night on night | 7.4 : 1 |
| Field & chip borders (`--field`) on card / paper | 3.8 / 3.5 : 1 (≥ 3 : 1 for UI boundaries) |
| Unselected Pioneer buttons (≥ 24px, large text) | 3.5 : 1 |

## Issues found and fixed during QA
- Hero text overflowed the 1440×900 fold → tightened rhythm, shorter lede, lede hidden on short (≤820px) desktop viewports.
- Cards cropped mid-word at the hero's right edge → composition kept inside the frame; at ≤1279px the right node column is removed and the canvas refits.
- Connection lines mis-scaled at 1024px → scale now read from a rendered node; SVG viewBox follows the live canvas.
- Mobile horizontal overflow from the receipt grid and from stamps' pre-landing transform → `minmax(0,1fr)` tracks and clipped receipt paper.
- `ul[role=list]` reset overrode component padding (rails touched the screen edge) → reset wrapped in `:where()`.
- Receipt broke into separate pieces when a note was taller than its paper → chapters stretch to fill each step.
- Pioneer door had a dead zone → added a working brief starter.
- axe: `form[role=tabpanel]` (not allowed) → tab panels are now `div`s wrapping the forms; the mobile offers rail wasn't keyboard-scrollable → `tabindex="0"` + label.
- Contrast: dimmed index labels used opacity (≈2:1) → full `ink-3`; Release Green darkened to pass on its tint; input/chip borders moved to a ≥3:1 token.
- Brief bottom sheet CTA could sit below the fold → sticky action bar.
- Style guide overflowed at 320px → `minmax(0,1fr)` tracks.

## Known limitations
- Tested in Chromium only (Playwright). Safari/Firefox lack `field-sizing`; a JS fallback sizes the sentence-builder selects.
- Links point to on-page anchors; there is no backend (sign-up, posting, search are simulated).
- The live zomzey.io site could not be loaded from this environment; content was audited from search-index snapshots (see `01-audit.md`).
