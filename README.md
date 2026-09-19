# UFCU — account opening research & assistant

Two things live here:

1. **Research** into UFCU's current online account-opening flow, and a redesign brief.
2. **A working assistant** — a Next.js app with an OpenAI-backed chatbot ("U") that
   answers applicant questions in plain language.

## Research

| File | What it is |
|---|---|
| `flow.md` | The live flow, reconstructed step by step from a 3:29 screen recording |
| `gap-analysis.md` | Gaps vs. peer institutions, plus applicant pain points from Reddit |
| `figma-brief.md` | Build brief for the six-step redesign in Figma |
| `layout-rules.md` | Why the composition reads as it does, measured from both Figma files |
| `churn-model.md` | Churn modelling |
| `screens/` | The 30 frames the flow was reconstructed from |

## The assistant

`U` is built for the gap the research names most often: nobody explains anything. It
answers eligibility, product, funding, disclosure and — most importantly — *declined
application* questions, in plain language, inside the flow.

**Guardrails, all verified against the live endpoint:**

- Refuses SSNs, account, routing and card numbers, and never echoes one back
- Refuses to quote a rate, APY or fee it does not have — no "ballpark" figures
- Never predicts whether someone will be approved
- Tells declined applicants that reapplying repeatedly hurts them, and points to their
  adverse-action notice and free ChexSystems report
- States plainly that it cannot see any account
- Answers in the applicant's language
- **Refuses any fact not in its knowledge base** — founding dates, founders, leadership,
  branch counts, not just money

### Guardrail probes

Prompt guardrails cannot be verified by reading them. `scripts/probe.mjs` fires nine
adversarial questions at a running endpoint and asserts on the answers:

```bash
npm run probe                              # against localhost:3000
npm run probe -- https://your.vercel.app   # against a deployment
```

It exists because the assistant confidently answered "UFCU was founded in 1949" (it
opened in 1936) and invented a group of founders. The first two probes are that exact
regression. Add a probe whenever you find a new way to make it say something false.

### Layout

```
app/
  api/chat/route.ts        streaming endpoint — OpenAI via the AI SDK
  page.tsx                 placeholder page, to be replaced by the v0 design
  layout.tsx               Fraunces + Archivo
  globals.css              UFCU tokens mapped onto the shadcn/ui variable names
components/chat/
  assistant.tsx            placeholder chat UI — replace the markup, keep the wiring
lib/
  system-prompt.ts         who U is, how it talks, what it refuses
  ufcu-knowledge.ts        grounding facts  ⚠️ see the provenance note in the file
  utils.ts                 `cn`
```

### Running it

```bash
npm install
cp .env.example .env      # add your OPENAI_API_KEY
npm run dev
```

### ⚠️ Before this talks to a real applicant

`lib/ufcu-knowledge.ts` is **mixed provenance**. The history and membership figures are
sourced from ufcu.org. Everything about the application itself — products, funding caps,
the $5 par share, courtesy pay, card timelines — was read off screenshots of one recorded
session and off the redesign prototype, not from UFCU's disclosures. Those lines need
reconciling against the official Membership & Account Agreement, Fee Schedule
and Rate Sheet, and should ideally become a retrieval step against those documents
instead of a hardcoded constant. The provenance note at the top of that file says the
same thing at more length.

Also still to do for production: rate limiting (the route caps message size and history
depth, but there is no per-IP limit), abuse logging, and a human-handoff path.

## Wiring up the v0 design

The app is set up to match what v0 emits, so a design can be dropped in with minimal
rework:

- **Next.js App Router + TypeScript + Tailwind v4 + shadcn/ui** (`components.json` is
  present, `@/*` path alias, `cn` in `lib/utils.ts`)
- **UFCU tokens are already mapped onto shadcn's variable names** in `app/globals.css`,
  so a v0 component using `bg-primary` / `text-muted-foreground` picks up UFCU branding
  with no edits
- **The chat UI is isolated** in `components/chat/assistant.tsx`

To wire a v0 export:

1. Copy its `components/ui/*` primitives in — they are additive.
2. Replace the markup in `assistant.tsx`, keeping the `useChat()` wiring: `messages`,
   `sendMessage({ text })`, `status`, and rendering `message.parts` where
   `part.type === "text"`.
3. Delete v0's `globals.css` rather than overwriting this one, or the UFCU tokens go
   with it.
