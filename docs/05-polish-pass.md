# 05 — v1.1 polish pass

Same concept, structure, palette, interactions and Opportunity Network direction as v1.0. This pass
only refines: type, density, rhythm, the logo and mobile ergonomics.

## How decisions were made
- **Type:** variants were rendered on the real page (injected override CSS) at 1440 and 390 and
  compared side by side; critics and judges scored them for readability, hierarchy and brand fit.
  Winner: Bricolage Grotesque **de-condensed** (98–100% width) at medium weights instead of
  ultra-condensed heavy.
- **Logo:** three refinement candidates were drawn: connected nodes, a faithful refinement, and a
  monogram. Two judges scored them for recognisability, small-size legibility and polish. The
  faithful refinement won.
- **Review:** independent reviewers checked the result through separate lenses: type, hero and
  mobile, the deal journey and network, board, doors and rhythm, and logo and style guide. Their
  verified findings were fixed; see below.

## Typography
| Role | v1.0 | v1.1 |
|---|---|---|
| Hero "Post. Pitch. Paid." | Bricolage ~800, condensed | Bricolage **580**, 98% width, 50–136px |
| Section headings | Heavy condensed | Bricolage **550**, 100% width (d1–d3) |
| Finale | Heavy condensed | Bricolage 560 |
| UI, body, all prices | Geist | Geist, tabular figures for every amount |
| Mono | Listing data | **Only** the deal record's IDs and field labels |
| Avatar initials | Bricolage 700 condensed | Geist 600 (part of the scanned layer) |

The hierarchy is now hero → section → lead → body → label, and each step looks different from
the next. There are fewer small caps labels; the kickers are plain sentence case.

## Section by section
- **Hero:**
  - The micro-copy is cut to three short notes, one lede and two trust points.
  - The ticker and the agency node are gone.
  - The network has been rebalanced to eight nodes with more air between them.
  - The pause control is now icon-only.
- **Rhythm:** three tokens control section spacing: `--section-y-dense` (64–112), `--section-y`
  (72–136) and `--section-y-open` (88–168). They are used dense → open → dense down the page.
- **Deal journey:**
  - The section is about 15% shorter: 3195 → ~2718px at 1440.
  - Tool lines are gone, the trust list is cut to two items, and secondary text is at least 12px.
  - Mobile uses sticky stage chips.
- **Network index:**
  - It is now the centrepiece, a larger map with a one-line lead.
  - Connector lines first run out to the column edge and then curve. They no longer cross
    labels.
- **Board:**
  - One card pattern throughout: tag + status, title, location, then offers · age and price.
  - Filters dim cards that don't match; dimmed cards are inert, so the layout doesn't jump.
  - The section is 1310 → ~1136px tall.
- **Two ways in:**
  - The two doors are balanced: each has a one-line heading, three one-line steps, one compact
    tool and two actions.
  - The section is 1666 → ~1151px tall.
- **Mobile:**
  - The headline is slightly smaller.
  - The "Live on ZOMZEY" rail now has a Swipe hint.
  - The board filters are a rail.
  - Every touch target is ≥ 44px and no width from 320 up scrolls sideways.
  - The full page is ~12,040 → ~9,417px.

## Logo
- The Z joining two violet nodes on an ink tile is kept, with the nodes at their original
  centres. It has been redrawn on a 32-unit tile with a 3-unit module: filled bars, r=3 nodes, and
  a Z the same height as the cap height.
- The wordmark is Bricolage 620 / 96% / opsz 14, outlined, set 10 units from the tile.
- **Files** (`assets/img/logo/`):
  - horizontal light and dark lock-ups (they share one viewBox);
  - mark, light and dark;
  - a 16px favicon cut on whole pixels;
  - a 512px app icon;
  - the "before" logo for comparison.
- The page head uses `favicon.ico` (16/32/48), `favicon.svg` and a 180px `apple-touch-icon.png`.
- The dark version uses `--night-line` (#3D382F) for the tile and violet-on-night (#A597FF) for
  the nodes.
- Style guide section 01 documents all of this.

## Review fixes (selection)
- A 1–3px overflow at 320px came from the active stage label while its chip was growing. Fixed by
  clipping inside the chip.
- `.rstep__num` contrast failed axe. Fixed by switching from opacity to `--on-night-2`.
- The board feature card stub overflowed at 320–360px. Fixed by letting it wrap.
- The hero stage lines were mis-scaled at 1024. The scale is now read from a rendered node.
- After a jump to top, the stage chips stayed on "Released". They now reset.
- Two favicon edges sat on half pixels and rendered soft. The 16px cut is now pixel-aligned.
- Accessibility review:
  - The hidden mobile dock is `inert`.
  - Focus rings pass 3:1 on dark and receipt grounds.
  - The mobile selects no longer have overlapping tap targets.
  - The board count is accurate and the filter state survives a breakpoint change.
  - The starter announces its status.
- Style guide:
  - The rhythm tokens, the night palette and the correct focus-ring copy were added.
  - Type samples no longer truncate on tablet or mobile.
  - The mark pair now sits on paper and night ground cells.
  - The radius captions and shape-rule glyphs are aligned.

Final QA: see [`04-qa-report.md`](04-qa-report.md).
