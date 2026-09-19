# UFCU onboarding — Figma build brief

**Target file:** `UFCU — It all starts with u` · `pg7R89Pl8gxvJDJKQopCiD` · page `4:149`
**Pattern reference:** `Mobbin — Copy to Figma` · `T4ZIFkbzxF9ntYXzBqtE4A` — Wise signup, 18 frames (**W1–W18**, row-major)
**Evidence:** `flow.md` (recorded live flow) · `gap-analysis.md` (research) · journey-map artboard

---

## Where things stand

The UFCU file is **not the live site** — it's a six-step prototype that already replaces most of it.
Built: Landing → `01 Who you are` (Scan your ID) → `02 What you need` → `03 Your card` →
`04 Fund it` → `05 Sign` → `06 You're in`.

**Do not redesign these. They already solve the biggest findings:**

| Finding from research | Already handled |
|---|---|
| 19-employer eligibility dropdown | Geography — "Live, work or study in Central Texas", auto-detected as "Eligible — Travis County" |
| No time estimate | "Six minutes, six steps" on landing; "Step 5 of 6 — Sign / Last step" in flow chrome |
| Long typed form + reCAPTCHA | "Scan your ID" with prefill, "SSN or ITIN — the only one to type", no credit check |
| 11 PDFs, 25-page agreement, opens outside app | `05 Sign` — five documents as an accordion with plain-language summaries, one signature, "PDFs land in your inbox" |
| $0.00 funding, accounts open empty | `04 Fund it` — $100 / $25 / $5 / other, $5 par share floor |
| Card in 7–10 days | `06 You're in` — virtual card + Add to Apple Wallet |
| Opaque "Submitting…" | Live identity panel: 94/100, five checks with timings |

**What is left is the connective tissue** — nine gaps below. Most are small. Two are structural.

---

## Use what's in the file

Components (instance these, don't redraw): `Button / Primary` · `Chip` · `Option row` · `Input` ·
`Flow chrome / Header` · `Flow chrome / Progress rail` · `Flow chrome / Footer` · `Card art`

Tokens — all exist as Figma variables:
`--ufcu-primary #23335d` · `--ufcu-secondary #ef6820` · `--ufcu-accent-darker #a95408` ·
`--ufcu-paper #f7f4ef` · `--ufcu-sand #efeadf` · `--ufcu-rule #ddd5c7` · `--ufcu-ink #16181c` ·
`--ufcu-body #4a4640` · `--ufcu-caption #6b655c` · `--ufcu-success #2e6b4f` · `--ufcu-error #b42318` ·
`--ufcu-error-bg #fdebea`. Type: **Fraunces** 52/64 display, **Archivo** 11–21 UI.

**Keep it six steps.** "Six minutes, six steps" is the whole promise and the rail has six segments.
Every new screen below folds *inside* an existing step — none adds a seventh.

**From Wise, take structure only.** Their lime `#9FE870`, logo and voice stay theirs. Every reused
frame gets re-skinned to the tokens above before review.

---

## 1 · Email capture — MISSING, blocks two other things
**Into:** Step 1, before the ID scan. **Reuse:** W2 as-is, reskinned.

```
The flow never collects an email address. Step 05 promises "PDFs land in your
inbox the moment you sign" and Step 06 issues a member number — neither can
happen. It also makes abandonment recovery impossible.
Copy W2: headline "First, what's your email?", single field, Button / Primary
Label=Continue. Drop Wise's social-login row.
Under the button, --ufcu-caption 13px: "We'll send your documents and a link
to pick this up later."
Frames: empty, filled, invalid-format error using --ufcu-error-bg.
```

## 2 · Phone verification — MISSING
**Into:** Step 1, after ID scan. **Reuse:** W7 + W9 as-is, reskinned. Closest 1:1 in the kit.

```
The identity panel in 01 asserts "Phone is yours ✓ 2.1s" but nothing ever
verifies it.
Copy W7 (country-code select + number field + disabled CTA + "It helps us keep
your account secure") and W9 (6-digit code, Resend, Back). Use the Input
component and Button / Primary Label=Continue.
On success the existing "Phone is yours" row in the identity panel ticks — wire
it as the source of that check.
Frames: number empty, number filled, code empty, code wrong (--ufcu-error),
code resent.
```

## 3 · Set your password — MISSING, biggest gap
**Into:** between `05 Sign` and `06 You're in`. **Reuse:** W13 as-is, reskinned.

```
06 You're in shows a member number, routing number and a $100 balance — with no
credentials ever created. As drawn, the member cannot log in. On the live site
this is the "Enroll Now" hand-off to a separate signup, and it is the steepest
drop-off in the whole funnel.
Copy W13: headline "Set your password", single Input with show/hide eye, live
requirement text, Button / Primary Label=Continue.
Place it immediately after "Sign and open", before You're in. Nothing already
collected is re-entered. The member reaches 06 signed in.
Frames: empty, typing with requirements unmet, valid, error.
```

## 4 · Opening your accounts — MISSING
**Into:** between §3 and `06`. **Reuse:** W15 as-is, reskinned.

```
05 Sign jumps straight to 06 You're in. Real core provisioning takes seconds to
a minute and needs a screen.
Copy W15's branded loader: UFCU dot mark in a filled --ufcu-primary circle, one
line beneath. Copy: "Opening your accounts" / "This takes a few seconds."
Do NOT use "do not close this window" — the live flow's version of this screen
strands anyone on mobile data.
Frames: loading, and a 30s "still working — we'll email you if it takes longer"
state.
```

## 5 · Can't verify you — MISSING, do not skip
**Into:** Step 1, branch off the identity panel. **Reuse:** none — new design.

```
01 only has a happy path (94/100) and a glare/retake error. There is no outcome
for an applicant who cannot be verified. Opaque denial is the single loudest
complaint in the consumer research, and a thin-file applicant hits this with no
route out.
Two frames, never one generic "denied":
5a "We need a little more time" — what happens next, when they'll hear, a
   reference number with a copy button.
5b "We can't open this online" — plain-language reason, the consumer reporting
   agency used, a link to request that report, plus branch and phone routes.
   State explicitly: "Applying again now won't help and may lower your score."
Use --ufcu-error sparingly — this is not an error, it's a redirect. Warm, not
apologetic. Every frame offers a next action.
```

## 6 · Type it instead — MISSING, button exists with nothing behind it
**Into:** Step 1. **Reuse:** W2/W6 field pattern + the existing `Input` component.

```
01 Who you are has a "Type it instead" button that goes nowhere. It's the path
for anyone whose ID won't scan, anyone without a smartphone camera, and it is
the accessibility route for the whole step.
Build the manual form: Legal name, Date of birth, Address (with autocomplete
dropdown), SSN or ITIN. Same four fields as the "From your ID" panel, minus the
"Filled for you" badge.
Keep the identity panel on the right — it just runs slower and without the
document-authentic check.
Frames: empty, filled, one inline error.
```

## 7 · Pause and resume — CHIP EXISTS, NOTHING BEHIND IT
**Into:** flow chrome, all steps. **Reuse:** none — small new work.

```
The landing promises "Pause anywhere" and the flow header shows a "Saved — pick
this up on any device" chip, but there is no exit dialog and no way back in.
Build two small frames:
7a Exit dialog from the header X: "Saved. We'll email you a link." with
   Continue / Leave.
7b Resume entry: "Pick up where you left off" showing which step they reached,
   reusing the Progress rail component.
Both use the Chip component in its "Saved" state.
```

## 8 · Document preview and Español — STUBS TO REPLACE
**Into:** supporting previews. **Reuse:** the existing accordion from `05 Sign`.

```
Ten "Supporting preview" panels are dead-end Close dialogs. Two are load-bearing:
8a Document preview currently reads "Full legal PDFs are not included in this
   demo." Build the real thing: the 05 Sign accordion pattern expanded into a
   scrollable in-page document pane, with the summary kept at the top. This is
   what keeps disclosures from leaving the app.
8b Español reads "This demo is available in English." The live ufcu.org has a
   Español toggle and the footer here links to one. Either build Spanish
   variants of the six flow screens or remove the link — a dead language toggle
   is worse than none.
The other eight stubs are fine as demo scaffolding.
```

## 9 · Mobile — ENTIRELY MISSING
**Into:** everything. **Reuse:** all Wise frames are desktop too — you're on your own here.

```
Every frame in the file is 1440 desktop. Mobile is 60–70% of account-opening
starts and converts at roughly half the desktop rate — and "Scan your ID" is a
phone-first interaction that currently has no phone design.
Build 390-wide variants of all six steps plus §1–§5 above.
Specific decisions needed, not just reflow:
 - 01: camera view is full-bleed on mobile, not a card in a two-column layout
 - The right-hand identity panel has nowhere to go — make it a collapsible
   sheet below the fold
 - Progress rail stays pinned; "Step 3 of 6" label may need to drop to an icon
 - 05 Sign's audit-trail panel moves below the signature, not beside it
```

---

## Build order

| | Do | Why |
|---|---|---|
| **1** | §1 email · §3 password · §4 opening | The flow currently cannot deliver a login or the documents it promises. Three near-verbatim Wise reskins (W2, W13, W15). |
| **2** | §5 can't verify · §6 type it instead | The two dead ends. Both need real design; §6 is also the accessibility path. |
| **3** | §2 phone verify | Direct W7/W9 copy; makes an existing claim in the identity panel true. |
| **4** | §9 mobile | Largest effort, and it depends on 1–3 existing. |
| **5** | §7 pause/resume · §8 stubs | Completes the promises already printed on the landing page. |

## Reuse at a glance

| Copy from Wise, reskin | New design |
|---|---|
| §1 email (W2) · §2 phone (W7/W9) · §3 password (W13) · §4 opening (W15) | §5 can't verify · §6 type it instead · §7 pause/resume · §8 document pane · §9 mobile |

Four of the nine are straight reskins of Wise frames. The prototype's own six steps need **no**
redesign — the work is the edges: getting in, getting stuck, and getting out.

## Two inconsistencies to settle first

1. **"PDFs land in your inbox"** (05 Sign) with no email ever collected. §1 fixes it; until then the
   claim is false.
2. **Landing offers four paths** — Everyday banking, Borrow, Buy a home, Business — and only
   *Everyday banking* exists. Either build a W5-style fork for the other three or make the landing
   honest about scope. This is a product call, not a design one.
