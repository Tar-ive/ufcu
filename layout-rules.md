# Why Wise reads as composed and UFCU doesn't

Measured from both Figma files, not eyeballed.

## The numbers, side by side

| | Wise (`wise-country-selection`) | UFCU (`01 — Who you are`) |
|---|---|---|
| Frame | 1440 × 900 | 1440 × 1024 |
| Page margin | **80** | **56** |
| Content shell | `content-wrapper` x80 w1280 — identical on every screen | main 908 + aside 372, gutter 48 |
| Action column | **480, fixed, every single screen** | none — blocks run 908 wide |
| Alignment | one axis: everything centres on x=640 | two left edges: 56 and 1038 |
| Vertical gaps | 32 after title, then 24 / 24 inside the form | **24 / 24 / 24** everywhere |
| Button height | 48 (one) | 46, 54, 62 (three) |
| Input height | 54 | 46 |
| Content ends at | 57% of frame — **43% empty below** | 71% of frame — 20% empty below |
| Column bottoms | n/a | left ends y726, right ends y617 — ragged |

## The four things actually causing it

**1 · No fixed measure.** Wise has one number — `480` — and every form, button and disclaimer on
every screen is exactly that wide. It is the spine of the whole system. UFCU has no equivalent:
blocks are 908, 858, 419, 372, 743. The error line in `01` is 743px of 16px Archivo — about 95
characters per line, well past the 45–75 where text stops being comfortable. Wise's 480 disclaimer
is ~60.

**2 · Uniform spacing destroys grouping.** UFCU's `01` puts exactly 24px between the headline, the
camera block, the error bar and the "From your ID" panel. Four unrelated things, equally spaced, so
they read as four peers. Wise varies deliberately: 32 after the title (separating *the question*
from *the answer*), 24 between things that belong together. **Spacing is the only grouping tool in a
flat layout, and UFCU isn't using it.**

**3 · Two left edges that never agree.** The headline starts at x=56. The "From your ID" card also
starts at 56 — but its contents are inset 26, so the *visible text* starts at 82. The aside starts
at 1012, its text at 1038. Scanning down the page, the eye keeps re-finding a different left edge.
That is most of the "off" feeling. Wise sidesteps it entirely by centring on a single axis.

**4 · The frame is too full.** Wise's content stops 57% down and leaves the bottom 43% empty. That
emptiness *is* the composition — it's what makes a single question feel considered rather than
cramped. UFCU's runs to 71%, and the two columns bottom out at different heights (726 vs 617),
leaving a ragged step instead of a clean edge.

---

## What to change in the UFCU file

Keep the two-column layout — the live identity panel is a real feature, not decoration, and
centring everything Wise-style would throw it away. Fix the composition rules instead.

### Set a grid and put everything on it
Figma layout grid on every flow frame: **12 columns · 80 margin · 24 gutter**. On 1440 that gives an
84.67px column. Snap the two columns to it:

- main **845** (8 cols) · gutter 24 · aside **411** (4 cols) = 1280
- replaces today's 908 / 48 / 372, which sits on nothing

### Adopt one measure
**560px** is the UFCU equivalent of Wise's 480 — wider, because Fraunces at 64px needs room, but
still a real cap. Every paragraph, every error string, every helper line stops at 560 even when its
container is 845 wide. Headlines may exceed it; running text never does.

### Replace the flat 24 with a grouping scale
The tokens already exist — `space-8/16/24/40/48/56`. Use them to mean something:

| Gap | Use |
|---|---|
| 8 | inside one component |
| 16 | label → field |
| 24 | field → field in the same group |
| 40 | group → group |
| 56 | headline → first group |

In `01` that turns 24/24/24 into **56** (headline → camera), **8** (camera → its error, so the error
attaches to what it's about instead of floating as a peer), **40** (→ "From your ID").

### Make the left edge absolute
Pick one: either cards bleed so their inner text lands on the grid, or card padding becomes a grid
value so 56 + padding is still a column edge. Never let the visible text edge alternate between 56
and 82. Same on the right: the aside's inner padding must put its text on a column edge too.

### Collapse the button scale
Three heights (46 / 62 for landing, 54 in-flow) is two too many. Keep **54** for primary actions and
**40** for secondary; retire the rest from `Button / Primary`.

### Give the frame air at the bottom
Target content ending around **60–65%** of frame height. Today `01` runs to 71%. Either lift content
up and let the bottom breathe, or accept a shorter frame — but bottom-align the two columns so they
finish on the same line instead of 726 vs 617.

### Order to do it in
1. Grid + margins 56→80 on all six flow frames — costs nothing, fixes the most
2. Spacing scale on `01` only, as a proof; compare against the old version before rolling on
3. Left-edge rule (card padding)
4. Button heights
5. 560 measure cap on running text

Steps 1 and 2 will get you most of the way. The Wise "feel" is not a style — it's one measure, one
axis, and spacing that means something.

---

## Applied in Figma — 2026-09-18

File `pg7R89Pl8gxvJDJKQopCiD`, page `UFCU Onboarding — generated` (`4:149`).

**Non-destructive, all 7 frames** (Landing, 01–06): 12-column layout grid, 80 margin, 24 gutter,
shown at 8% orange. Guide overlay only — no geometry moved.

**New frame `01 — Who you are · layout v2`** (`41:877`, at x 9120, y 2200), a clone of `01` with:

| | Before | After |
|---|---|---|
| Page margin | 56 | **80** |
| Columns | 908 / 48 / 372 | **845 / 24 / 411** (8 + 4 of 12) |
| Card insets | 19, 25, 26 | **24** everywhere |
| Headline → body | 24 | **56** |
| Group → group | 24 | **40** |
| Camera → its error | 24 | **8** |

The spacing hierarchy required real structure, not just numbers: `section-0` now nests
`group/body` (gap 40) containing `group/capture` (gap 8, holding the camera and its error
message together) and the "From your ID" card. Inner content was switched from fixed widths to
FILL so it reflows into the narrower column.

The original `01` is untouched apart from the grid, so the two sit side by side for comparison.

**Not applied, and why:**
- **Button heights** (46 / 54 / 62) — collapsing these means editing the `Button / Primary`
  component set, which changes the landing page too. Wants a decision first.
- **560 measure cap** — needs per-text-block judgment, not a global rule.
- **Bottom air** — `01` still ends ~73% down the frame. This is not a spacing problem. The screen
  runs ID capture, an error state, four manual fields and a live identity panel at once. Wise's
  calm comes substantially from asking **one** thing per screen. No amount of margin work
  substitutes for that; it is a content decision.

---

## Type pass — Wise treatment, UFCU words (2026-09-18)

Wise's ramp, measured from their file: **Inter only**, headline **32** (not 64), letter-spacing **0**
everywhere, line-height AUTO for UI and 140–150% for paragraphs, and a small ramp — 32 / 20 / 16 /
15 / 14 / 13 / 12. Weight carries the hierarchy, not size.

Applied to all 59 UFCU text styles, which 869 of 916 text nodes use, so it propagated to the
landing, all six flow screens and all 21 component variants:

| | Before | After |
|---|---|---|
| Families | Fraunces display + Archivo UI | **Inter only** |
| Screen headline | Fraunces 64 / 62 / 58 | **Inter Bold 32** |
| Landing hero | Fraunces 132 | Inter Bold 48 |
| Tracking | −5.28 to +3.2px | **0**, except 1px on uppercase |
| Paragraph line-height | fixed px (21, 22.5, 27, 33.6) | **145%** |
| UI sizes 11–18 | unchanged | unchanged — already matched Wise |

**Refit required.** Inter is wider than Archivo at the same size, so rows measured for Archivo
broke: short labels wrapped ("Confirm" → "Conf / irm"), and long text grew taller than its
fixed-height container. Fixed by hugging 793 short labels, letting 62 paragraphs grow, and hugging
101 containers that overflowed. One intermediate attempt — blanket `SPACE_BETWEEN` on horizontal
rows — was wrong and was reverted; left/right separation was restored properly on the header,
footer and step bar only.

Rollback: `figma-backup/text-styles-before.json` holds all 59 styles' original values.

**Worth knowing:** the family swap was the *least* valuable part of this. What makes Wise read
calm is the restraint — one family, a 32px headline, zero tracking, a seven-step ramp. Archivo is
already a clean neutral grotesque in the same role as Inter, so keeping Archivo and applying only
the new sizes/tracking/ramp would have delivered nearly the same result with none of the refit
breakage. Style names still describe their old values (e.g. `UFCU/Fraunces/400/normal/64px…` is now
Inter Bold 32) and should be renamed.
