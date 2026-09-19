# Cutting churn with a model — what to build

**The ask:** people abandon because they wait for approval. Remove the wait.

**The reframe:** that needs two models, not one. They have different targets, different
consumers, and different regulatory weight. Building one model for both is the usual mistake.

| | Model A — Instant decision | Model B — In-session abandonment |
|---|---|---|
| Predicts | Would underwriting approve this person? | Will this session finish? |
| Runs | Once, ~2s into step 1 | At every step boundary |
| Consumer | The flow itself (skip the wait) | Interventions (save link, chat, shorten path) |
| Regulated | Yes — FCRA, and Reg B for the overdraft feature | No |
| Value | Large. Removes the drop-off cliff at submit | Moderate. Recovers the already-wobbling |

Build A first. It is where the churn is.

---

## Model A — instant decision

### Target
`P(underwriting approves)`, binary. Note carefully: this predicts **your own current policy**,
not member quality. That is the right target here — the goal is to reach the same answer sooner,
not a different answer. It also sidesteps reject inference, because the label you want (what
underwriting decided) is observed for everyone who submitted.

### Features — all available ~2s into step 1

| Group | Fields |
|---|---|
| Document | authenticity pass, face-match score, liveness, doc type, expiry distance |
| Phone | carrier-name match, line tenure, prepaid flag, recent port |
| Email | domain class, tenure, breach presence |
| Address | deliverable, residential vs CMRA/PO box, tenure, distance to IP geo |
| SSN | name/DOB/SSN match level, issuance-vs-DOB consistency, DMF hit |
| Bureau | ChexSystems closures, NSF count and recency, EWS equivalent |
| Device | fingerprint reuse, IP type (VPN/datacenter), application velocity per device |
| Behaviour | ID scan vs "type it instead", retake count, dwell on step, paste into SSN |
| Declared | age from DOB, occupation |

≈35–45 features. Small, dense, tabular.

### Model
**Gradient-boosted trees (LightGBM), 200–400 trees, depth 4–6, monotone constraints** on the
features whose direction is known (NSF count up → approval down). Train time on 100k rows:
**under 10 seconds on a laptop.** Model artefact under 1 MB. Inference **20–50 µs**, in-process,
no serving infrastructure.

Run **regularized logistic regression as the co-primary**, not just a baseline. If LR lands within
~1–2 points of GBM's PR-AUC, ship LR: coefficients give you adverse-action reason codes for free,
which matters because declines driven by a consumer report carry FCRA notice duties, and the
Courtesy Pay feature drags the credit-side rules in too. Compliance review before launch, not after.

Calibrate with isotonic regression on a holdout. You need true probabilities, because the whole
design rests on thresholds.

### The part that actually matters: three outcomes, not two

```
score ≥ t_high   → auto-approve, instantly, on screen
t_low … t_high   → "we need a few minutes" (today's path)
score < t_low    → decline, with a reason and a branch route
```

Set `t_high` where precision on auto-approve is ≥ 99.5% — you cannot auto-open an account you
would later have to close. Start conservative: auto-approve the safest 40–60%. Even that removes
the wait for most applicants.

### The metric
Not AUC. Report **auto-decision rate** — the share of applicants who get an answer on screen —
against **false-approve rate**. Then the business number: completion rate, and 90-day funded rate.

### Latency: the model is not your bottleneck
Your own prototype shows the identity checks landing at 0.8s, 1.4s, 2.1s, 2.4s and **6.0s**.
Watchlist screening at 6.0s is the long pole; the model adds ~0.05 ms to that. So the engineering
work is **not** model optimisation — it is firing the vendor calls in parallel and deciding at
~2.4s, letting the watchlist finish asynchronously and only clawing back if it flags.

That single change is worth more than any accuracy improvement.

---

## Model B — in-session abandonment

### Structure
A **discrete-time hazard model**: one row per (session, step), predicting `P(drop at this step |
reached it)`. That framing handles censoring properly and gives you a per-step probability instead
of one session-level guess.

### Features
Step index, cumulative elapsed time, time on current step vs population median, back-navigations,
field-error count, ID-scan retakes, device class, entry source, funding amount chosen, hour of day.

### Model
Logistic regression with step dummies, or a shallow LightGBM. Trains in seconds on a few thousand
sessions. Inference is free.

### Interventions, ranked by leverage
1. Below-threshold at the funding step → offer "fund later", do not let them stall
2. Two retakes on ID → surface "type it instead" before they quit
3. Session abandoned → save-and-resume link by email/SMS **within minutes**, not hours
4. High-risk session mid-flow → live chat offer

Note that #3 needs no model. Build it regardless.

---

## Sequencing, and the cold-start problem

There is no training data for the new flow yet.

- **Phase 0 (now).** Ship rules plus the vendor scores. Log every feature above, including the
  behavioural ones, whether or not you use them yet. This is the only phase with a hard deadline —
  features you do not log now are gone forever.
- **Phase 1 (~5k applications).** Train Model A on historical applications from the current Narmi
  flow, restricted to features that exist in both. Shadow-mode it: score live, decide nothing,
  compare against underwriting.
- **Phase 2.** Promote to auto-approve on the top band only. Widen the band as precision holds.
- **Phase 3.** Model B, once you have ~2k sessions of step-level telemetry.

## Three things that will bite

**Class imbalance.** Credit union approval rates run high, so declines are the rare class.
Optimise PR-AUC, not ROC-AUC, and use class weights. A model that approves everyone will look
excellent on accuracy.

**Drift via feedback loop.** Once auto-approval is live, your training data stops being a random
sample of applicants — the band you auto-approve never reaches a human. Keep a small random
holdout routed to manual review forever, or the model degrades invisibly.

**Proxy discrimination.** Device type, IP geography and email domain all correlate with protected
classes. Run disparate-impact testing before launch and on every retrain, and be prepared to drop
features that carry signal you cannot defend.

---

## What to add to data collection now

Cheap, high-signal, and currently not captured in the flow:

- Time-to-first-keystroke and per-field correction counts
- Whether the SSN was typed or pasted
- ID scan vs manual entry (the "Type it instead" branch) as an explicit event
- Device fingerprint + IP class, with per-device application velocity
- Phone and email tenure from an identity vendor — one API call, among the strongest features available
- The step-2 answer ("Paycheck in, bills out" / "cushion and borrow" / "burned by overdraft") as a
  structured field. Self-declared need is a genuine risk signal and you are already asking for it.
