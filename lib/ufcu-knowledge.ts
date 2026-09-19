/**
 * Grounding facts for the UFCU account-opening assistant.
 *
 * ⚠️  PROVENANCE — MIXED. READ BEFORE SHIPPING TO REAL MEMBERS
 *
 * Two tiers of fact live in this file.
 *
 * SOURCED — the "History" section and the service-area/membership figures come from
 * UFCU's own story page (ufcu.org/about/who-we-are/the-ufcu-story). Those are good.
 * The membership and asset figures are dated (August 31, 2026) and will drift.
 *
 * DEMO-GRADE — everything about the application itself (products, funding caps, the
 * $5 par share, courtesy pay, card timelines, the step sequence) was derived from this
 * repo's research artifacts:
 *   - `flow.md`          — a single recorded run of the live Narmi-hosted application
 *   - `gap-analysis.md`  — analysis of that run plus external benchmarks
 *   - `figma-brief.md`   — the six-step redesign prototype
 *
 * Those amounts, fees, product names and timelines were read off screenshots of one
 * session and off a prototype — they are not sourced from UFCU's disclosures, fee
 * schedule or rate sheet. Before this assistant talks to a real applicant, every one
 * must be reconciled against the official Membership & Account Agreement, Fee Schedule
 * and Rate Sheet, and ideally replaced by a retrieval step against those documents
 * rather than a hardcoded constant.
 *
 * Deliberately absent, and it must stay that way until sourced: interest rates, APYs,
 * dividend rates, and any fee not listed here.
 *
 * NOTE ON ADDING FACTS: the assistant treats this file as the entirety of what it
 * knows about UFCU and refuses anything outside it. That is intentional — it is what
 * stops it inventing a founding date. Adding an unsourced line here silently converts
 * a refusal into a confident wrong answer, so cite a source when you add one.
 */

export const UFCU_KNOWLEDGE = `
## About UFCU

University Federal Credit Union (UFCU) is a not-for-profit, member-owned credit union
based in Austin, Texas. Members are owners, not customers. Deposits are federally
insured by the NCUA.

Phone: 512-467-8080. Branch appointments can be scheduled on ufcu.org.

## History  [source: ufcu.org/about/who-we-are/the-ufcu-story]

- **Opened for business May 6, 1936**, with 30 members and $855 in deposits.
- Obtained its organizational certificate on May 14, 1936, establishing University
  Federal Credit Union.
- It began at the University of Texas at Austin, serving people affiliated with the
  university. **UFCU does not publish the names of individual founders.** If asked who
  founded it, say it was started by people affiliated with UT Austin in 1936 and that no
  individual founder is named publicly — do not supply a name, and do not guess.
- Membership later widened well beyond UT: Texas State University joined in 2013, Austin
  Community College in 2016.

Today UFCU serves more than 250 universities, associations and employers across Central
Texas, Houston and Galveston.

These figures are as of August 31, 2026 and drift — give them as "about" and as of that
date, or point to ufcu.org:
- About 436,000 members/owners (436,007 on that date)
- About $4.2 billion in assets ($4.239 billion on that date)

## Membership eligibility

Anyone who lives, works, worships or attends school in UFCU's service area — Central
Texas, Houston and Galveston — can join. Affiliation with one of 250+ participating
employers, schools or associations (including UT Austin, Texas State, Austin Community
College, YMCA and Goodwill, among others) also qualifies.

Applicants with no local or employer tie can still join: joining the American Consumer
Council — free — establishes eligibility. Nobody eligible to bank in these areas should
be turned away at this step; if someone cannot find their tie, route them to the
Consumer Council option rather than letting them conclude they are ineligible.

Opening a membership requires a $5 par share deposit into a savings account. That $5 is
the member's ownership stake, not a fee — it stays in their account.

## What an applicant needs

- Be 18 or older
- A Social Security Number or ITIN
- A government-issued photo ID (driver license or state ID)
- A U.S. residential address
- An email address and mobile number

## The application

Six steps, about six minutes:
1. Who you are — email, ID scan, SSN/ITIN, address, phone verification
2. What you need — choosing accounts
3. Your card — debit card and design, if a checking account was selected
4. Fund it — an opening deposit
5. Sign — disclosures and one signature
6. You're in — member number, account and routing numbers, virtual card

Progress is saved. An applicant who leaves can pick the application back up from the
link emailed to them.

## Accounts

- **Free Checking** — no monthly service fee, no minimum balance
- **Plus Checking** — adds benefits; may carry conditions to waive a monthly fee
- **Savings** — holds the $5 par share; required for membership
- **Simply U™** — a simplified account option

Do not quote interest rates, APYs, dividend rates or fee amounts for these accounts.
Point the applicant to the Rate Sheet and Fee Schedule, or to 512-467-8080.

## Funding the account

Funding methods and their per-application caps:
- Logging in to an existing bank (instant verification) — up to $54,500
- Routing and account number entry (ACH) — up to $54,500
- Credit or debit card — up to $2,500

Funds are withdrawn one to two business days after approval. Linking a bank by logging
in is the smoothest path and the one to recommend when an applicant asks.

An account can technically be opened at $0.00 beyond the $5 par share, but an account
that opens empty tends to go unused. If someone is unsure, suggest starting small
rather than skipping funding entirely.

## Cards

A Visa debit card is issued with checking accounts and arrives in 7–10 business days.
Card designs include UFCU, Texas State and UT Longhorn. A virtual card is available
immediately on approval and can be added to a mobile wallet, so the applicant does not
have to wait on the mail to spend.

Courtesy pay is optional and opt-in. It costs $35 per transaction and the overdrawn
amount must be repaid within 45 days. Present it neutrally with the cost stated — never
encourage enrollment.

## Disclosures

The signing step covers: ESign consent, the Membership & Account Agreement, Truth In
Savings, Electronic Funds Transfer (Reg E), Funds Availability, Wire Transfer, Privacy,
Arbitration, the Fee Schedule, the Rate Sheet, and Overdraft Service. Spanish-language
versions are available.

Signed copies are emailed. Summarize what a document covers in plain language when
asked, but never characterize a document as unimportant, never tell anyone they can skip
reading one, and never paraphrase a specific legal term as if it were the term itself.

## If an application is not approved immediately

Being declined or sent to manual review is usually about identity verification, not
creditworthiness — UFCU does not run a hard credit inquiry to open a deposit account.
Common causes are a thin credit file, a recent move, a name mismatch, or prior banking
history reported to ChexSystems.

What genuinely helps, and should be said plainly:
- A decision to review is not a final no. Most are resolvable.
- The applicant is entitled to know which consumer reporting agency was used, and an
  adverse action notice stating it.
- ChexSystems reports are free once a year at chexsystems.com, and errors can be disputed.
- Bringing ID to a branch, or calling 512-467-8080, resolves most verification holds.
- **Reapplying repeatedly does not help and can make things worse.** Say so if someone
  mentions applying again — it is the single most useful thing to tell them.

Never speculate about why a specific person was declined, and never predict whether
someone will be approved.
`.trim();
