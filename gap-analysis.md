# UFCU online account opening — gap analysis & pain points

**Basis:** the 30 frames in `screens/` + flow map in `flow.md`, one happy-path demo
(3:29, desktop web, applicant approved). Industry benchmarks and competitor flows from
web research; consumer pain points from Reddit threads read directly in-browser.

**Caveats, stated up front:**
- The video shows **one path through the flow**. Steps that are conditional — document
  upload on KYC step-up, decline handling, joint applicants — may exist and simply
  weren't triggered. "Missing" below means *not observed*, not *proven absent*.
- UFCU's mobile app flow was not observed at all.
- Narmi's published metrics are vendor marketing and are labelled as such.

---

## Part 1 — Gaps vs. how other institutions do it

Severity: **P0** = likely costing completions now · **P1** = material · **P2** = polish.
"Platform" column separates *Narmi supports it, UFCU hasn't enabled it* from a real limit.

### A. Front door & eligibility

| # | Gap | Sev | Platform |
|---|---|---|---|
| A1 | Eligibility is a bare `<select>` of ~19 named employers/schools. No type-ahead, no "I don't see mine," no geographic option. The universal backdoor — *join via American Consumer Council for free* — is a small radio button below the dropdown. | P0 | UFCU config |
| A2 | No time estimate and no roadmap. Applicants can't tell if this is 3 minutes or 30. | P1 | UFCU config |
| A3 | "What You'll Need" tells you to have **a valid driver license or state ID** ready — and the flow never asks for one. Either a stale instruction or an unlabelled conditional. Either way it makes people defer starting until they've gathered documents they won't need. | P1 | UFCU content |

Alliant is the reference implementation for A1: it silently enrolls applicants in a
qualifying nonprofit and pays the $5 itself, so eligibility never surfaces as a user task.
Most community CUs lead with "live, work, worship or attend school in these counties."

### B. Identity verification

| # | Gap | Sev | Platform |
|---|---|---|---|
| B1 | Observed KYC is **data-only**: SSN + DOB + address matched against bureaus. No ID document capture, no selfie/liveness. Narmi explicitly ships "Government ID capture." Thin-file applicants — young, new to the country, no credit history — fail this with no way to prove themselves. | P0 | Narmi supports |
| B2 | **Visible reCAPTCHA image challenge** ("select all images with cars") mid-form. A conversion tax and a WCAG problem. Industry has moved to invisible reCAPTCHA v3 / Cloudflare Turnstile / device signals. | P0 | UFCU config |
| B3 | No address autocomplete — the address is typed by hand. Address mismatch is a named cause of KYC failure. | P1 | UFCU config |

**Important nuance:** B1 is *not* an argument for always-on document capture. A practitioner
in r/fintech puts document capture as the single largest drop-off step in the whole funnel
(20–30% loss at that step alone), and liveness compounds it. The correct pattern is a
**conditional step-up**: pass on data where data suffices, offer document+selfie as a
*rescue* when it doesn't — instead of today's silent dead end.

### C. Product selection

| # | Gap | Sev | Platform |
|---|---|---|---|
| C1 | No guidance layer. Four product cards and five tabs, no "help me choose," no recommendation based on what was already collected. | P1 | Narmi supports bundles |
| C2 | No joint applicant, no beneficiaries, no minor/custodial account observed. Each absence is a forced branch visit for a common need. | P1 | Unknown |

### D. Funding

| # | Gap | Sev | Platform |
|---|---|---|---|
| D1 | **$0.00 funding is permitted and is what the demo produced.** Both accounts open at $0.00. Unfunded accounts go dormant and rarely become primary. No default amount, no minimum, no nudge. | P0 | UFCU config |
| D2 | Funding is asked as a yes/no **before approval**, when commitment is lowest, and the whole section collapses to nothing on "No." Better: fund after approval, or require $1+. | P1 | UFCU config |
| D3 | Three funding methods are offered but the flow is a cul-de-sac — all three modals were opened and abandoned in the demo. Card funding caps at $2,500, bank transfer at $54,500. | P2 | — |

Relevant benchmark: institutions that require **micro-deposits** for ACH funding see 27%
abandonment vs **13%** for those using instant account verification (Cornerstone Advisors).
UFCU's "log in with your bank" path is the right one — it just isn't the default.

### E. Disclosures

| # | Gap | Sev | Platform |
|---|---|---|---|
| E1 | **11 separate PDF links, including a 25-page Membership Agreement, open in the browser's native PDF viewer** — outside the application. On mobile this is a context switch that loses the applicant's place in the flow. Best practice is an in-line scrollable pane with scroll-to-accept, or one combined packet emailed after submit. | P0 | UFCU config |
| E2 | Two-stage checkbox reveal: the 11-link list only appears after the ESign box is ticked. An extra beat with no user benefit. | P2 | UFCU config |

### F. Decision & post-approval — *the weakest stretch*

| # | Gap | Sev | Platform |
|---|---|---|---|
| F1 | **No decline / adverse-action path observed.** This is the loudest complaint in the Reddit corpus by a wide margin. An in-product explanation — which bureau was used, how to get your ChexSystems report, what to do next — is the single cheapest trust differentiator available. | P0 | UFCU config |
| F2 | "Submitting your application… **do not close this window**" is a blocking wait with no fallback. If the session dies, the outcome is unknown to the applicant. Process in the background and email/SMS the result. | P1 | UFCU config |
| F3 | Approval **hands off to a separate "Enroll Now" digital banking enrollment.** The applicant has just proven their identity and is now asked to start a second signup, likely re-keying the account number shown on screen. This is a classic drop-off cliff — the account exists but never gets used. Chime/SoFi set credentials inside the flow and land you logged in. | P0 | Unknown |
| F4 | Debit card is **7–10 business days** with no instant virtual card. Many peer CUs now push a digital card to Apple/Google Pay at approval. | P1 | Unknown |
| F5 | No confirmation email/SMS or application reference number shown on screen. | P1 | UFCU config |

### G. Session & recovery — *partly a strength*

| # | Observation | Sev | |
|---|---|---|---|
| G1 | **Save-and-resume exists** — "Already started an application? Continue" on the first screen. Genuinely good; many peers lack it. | ✅ | — |
| G2 | No evidence of abandonment email/SMS automation, which Narmi ships. Reminders sent *within minutes* of abandonment are what recovers these; days later the applicant has already opened elsewhere. | P0 | Narmi supports |

### Benchmarks for context

- Average institution loses **~77%** of digital applications to abandonment; best-in-class ~25%.
- Abandonment exceeds **50%** when the flow runs longer than 3–5 minutes.
- Narmi advertises a **2 min 13 s** average decision-to-open. The UFCU demo — driven by
  someone who knew every click and skipped funding — ran **3 min 29 s**. A first-time
  applicant reading the disclosures is meaningfully over the cliff.
- Mobile drives 60–70% of starts but converts at roughly half the desktop rate.

---

## Part 2 — Pain points, from Reddit

Reddit blocks automated search and fetch, so these were read by driving a real browser.
Quotes are verbatim.

### 1. Losing progress mid-application — and being charged anyway
> "I went through the whole process of imputing my full name, phone number, email, SSN,
> home address, employment information, and pictures of my ID. I chose the payment method
> for depositing money… **it immediately charged me despite having not finishing the
> application process and no account being created.** After I opened my camera to take
> pictures of my SSN card for the next step **the site lost all of my progress** and sent
> me back to the home page. There was no account created, nothing in my texts or emails,
> and the money that was taken for the deposit hasn't been returned."
> — r/Banking, on a credit union's online flow

The worst-case compound failure: progress loss + money taken + no confirmation + no record.
**Maps to UFCU: G2, F5, D2.**

### 2. Opaque denial — the single loudest theme
> "Went to sign up for an account online today and was denied. **No reason was given on
> webpage nor have I received an email.**" — r/Chase

> "I went to chase location and they kept saying we will provide you with answers in the
> mail. Then it said there was **no information to provide as to why** I cannot open an
> account and to call their customer service number." — r/Banking

**Maps to UFCU: F1.**

### 3. Repeated applications quietly make things worse
> "My score is seemingly low and it's because in the last month I've been trying to open a
> bank account and there's so many inquiries on there that lowered my score and they said
> '**we can't tell you what the reason they denied you**.'" — r/Banking

Nobody tells applicants that reapplying is harmful. **Maps to F1.**

### 4. Thin-file applicants simply cannot be verified
> "Nearing my 30s and I have never had a bank account. I know applying online would be
> impossible considering **the nonexistence of a digital footprint and no credit history**…
> I was just told they couldn't verify my SSN and identification. I KNOW my SSN is mine
> because I just went and got a replacement card last month. I provided ID, SSN, birth
> certificate…" — r/Banking, about a credit union

Data-only KYC has no answer for this person. **Maps to B1.**

### 5. Full online application → "now come to a branch"
> "Got almost all the way through the process (last step would have been ToS and Privacy
> agreements), but then received this message: *After reviewing your application, we've
> determined that we need additional information to proceed. **Please bring at least two
> forms of identification with you to a branch.***" — r/personalfinance

The branch fallback isn't universal — in the r/Banking thread above, the applicant's actual
blocker was severe social anxiety: *"it's extremely hard to get myself to go through with
any sort of social interaction."* **Maps to B1, F1.**

### 6. Where drop-off actually happens — from a practitioner
> "**Document capture is the biggest killer.** The moment you ask someone to photograph
> their ID, you lose a huge chunk of applicants. Some don't have their ID handy, some can't
> get a clean photo, some get spooked about uploading documents. Completion rates typically
> drop 20–30% at this step alone. The liveness check selfie compounds it… **Address
> verification is sneaky painful.** Sounds simple but people…" — r/fintech

Directly qualifies B1 — argues for conditional step-up, not always-on capture.

### 7. Nobody gets good at this
> "Keep in mind **most people only open bank accounts like 1 to 3 times in their entire
> life.**" — r/fintech

No learned tolerance for friction; every unexplained step is genuinely novel.

### 8. Credit union eligibility reads as a barrier from outside
r/Banking's "Credit Union — Barriers to entry" thread and r/YouShouldKnow's "there are
Credit Unions that anyone can join" both exist because the field-of-membership concept is
opaque to non-members. A dropdown of 19 employer names is exactly the artifact that
produces this confusion. **Maps to A1.**

---

## Part 3 — Where I'd start

Ranked by impact ÷ effort, using only things visible in the recording.

1. **F3 — collapse digital banking enrollment into the flow.** Highest-value fix here. The
   account already exists and identity is already proven; asking for a second signup after
   approval wastes the only moment the applicant is guaranteed to be engaged.
2. **F1 — build a real decline/step-up screen.** Cheap, and it addresses the single loudest
   consumer complaint in the entire corpus.
3. **E1 — bring disclosures in-line.** 11 PDFs leaving the app is the biggest mid-funnel
   friction, and it is worst on mobile where most starts happen.
4. **G2 — turn on abandonment email/SMS.** Narmi already ships it; reminders within minutes
   are what recover these applicants.
5. **D1 — stop letting accounts open at $0.00.** Default a funding amount; make instant bank
   verification the recommended method (13% vs 27% abandonment).
6. **B2 — replace the visible reCAPTCHA challenge** with an invisible risk signal.
7. **A1 — rebuild the eligibility gate** as a searchable field with an explicit "none of
   these apply" route to the ACC option.
8. **B1 — add conditional document + selfie step-up** as a rescue path, never as a default step.

---

## Sources

**Reddit (read in-browser):**
[Why does opening an account online have to be so difficult and outdated](https://www.reddit.com/r/Banking/comments/1liv65d/why_does_opening_an_account_online_have_to_be_so/) ·
[I can't open a bank account? I just.. can't be identified?](https://www.reddit.com/r/Banking/comments/1ueh6yu/i_cant_open_a_bank_account_i_just_cant_be/) ·
[It's been a month and my application isn't approved at any bank](https://www.reddit.com/r/Banking/comments/1seaf5b/its_been_a_month_and_my_application_isnt_approved/) ·
[Couldn't open account online. Better chance in branch?](https://www.reddit.com/r/Chase/comments/1jjvcd9/couldnt_open_account_online_better_chance_in/) ·
[Having trouble opening Checking Account online without a Branch visit](https://www.reddit.com/r/personalfinance/comments/mhl5tu/having_trouble_opening_checking_account_online/) ·
[Which parts of bank account opening cause the most customer drop-off?](https://www.reddit.com/r/fintech/comments/1qj2usc/which_parts_of_bank_account_opening_cause_the/) ·
[Credit Union — Barriers to entry](https://www.reddit.com/r/Banking/comments/1tb1gug/credit_union_barriers_to_entry/)

**Industry:**
[Cotribute — 2026 Digital Growth Benchmarks](https://www.cotribute.com/resources-2026-digital-growth-benchmarks) ·
[The Financial Brand — Most Customers Abandon Account Opening](https://thefinancialbrand.com/news/bank-onboarding/more-than-half-of-customers-abandon-account-opening-how-to-take-back-control-of-the-process-191691) ·
[MX — Account Opening Stats](https://www.mx.com/blog/account-opening-stats/) ·
[MX — What Is Instant Account Verification](https://www.mx.com/blog/what-is-instant-account-verification/) ·
[Narmi — Digital Account Opening](https://www.narmi.com/products/digital-account-opening) ·
[Chime onboarding teardown](https://getperspective.ai/blog/chime-ai-customer-onboarding-largest-challenger-bank-replaced-forms) ·
[SoFi — How long does it take to open a bank account](https://www.sofi.com/learn/content/how-long-does-it-take-to-open-a-bank-account/) ·
[Deloitte — Improving account opening in retail banking](https://www.deloitte.com/us/en/insights/industry/financial-services/improving-account-opening-process-in-retail-banking.html) ·
[Socure — Selfie ID verification](https://www.socure.com/glossary/selfie-id-verification) ·
[Regula — KBA vs ID verification](https://regulaforensics.com/blog/knowledge-based-authentication-vs-knowledge-based-verification-vs-identity-verification/) ·
[Coconut Software — Why customers abandon online bank applications](https://www.coconutsoftware.com/blog/why-customers-abandon-online-bank-applications-and-how-to-prevent-it/) ·
[Lumin Digital — Application abandonment](https://lumindigital.com/insights/struggling-with-bank-application-abandonment-heres-what-you-can-do/) ·
[ChexSystems](https://en.wikipedia.org/wiki/ChexSystems) ·
[USPS FCU — Visa Instant Digital Issuance](https://uspsfcu.org/services/mobile-access/visa-instant-digital-issuance/)
