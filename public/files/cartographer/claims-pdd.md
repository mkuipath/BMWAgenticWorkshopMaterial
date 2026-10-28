# Process Definition Document (PDD)

## Ardenfield Mutual: Homeowners Water Damage Claim Intake and Triage (FNOL)

> This document describes each step's **nature** and each system's **integration surface**,
> so that a Solution Design Document generated from it picks the *right tool for each step*
> (RPA, agent, API workflow, document extraction, human task, orchestration).
> `[AUTHORED — confirm]` marks domain details that were written for this document and need
> confirmation by a subject-matter expert. Everything else comes from the approved design.

---

## 1. Process Overview

### 1.1 Organization Background
Ardenfield Mutual is a mid-size home and property insurer with about 400k policies. Its claims
platform is **Ardenfield ClaimCore**. ClaimCore handles water damage, storm, fire and theft
claims. This document covers **homeowners water damage** only.

### 1.2 Process Summary
When a policyholder reports water damage, the claim must be captured, registered in ClaimCore,
checked against the policy, and triaged: either accepted straight away or sent to an adjuster.
The to-be process handles each claim form as one durable, governed process instance that:
- (a) **extracts** the claim details from the claim-form PDF
- (b) **checks for duplicates** against the policy's claim history (Release 2)
- (c) **registers** the claim in ClaimCore
- (d) **reads the policy** (product, limits, deductible, status)
- (e) **assesses coverage** against the policy wording and produces a recommendation with a
  rationale, a cited clause and a confidence
- (f) **triages** the claim with deterministic rules
- (g) routes the claim to an **adjuster** when a rule requires it
- (h) **updates the claim status** in ClaimCore

A human always makes the coverage decision whenever a rule requires one. The automation never
approves or denies on its own judgement.

### 1.3 End-to-End Process
Claim form arrives → extract claim details → [Release 2] check for a duplicate claim →
register the claim in ClaimCore → read the policy → coverage recommendation → triage gate →
[if a rule fires] **adjuster reviews and decides** → update the claim status in ClaimCore.

A suspected duplicate leaves the main path for **fraud review**. If the reviewer confirms the
duplicate, the claim is rejected.

### 1.4 Process Participants
- **Policyholder:** files the claim by submitting the Home Claim Notification Form.
- **Claims handler:** registers the claim in ClaimCore (today by hand; in the to-be process, the
  robot does this in the handler's place).
- **Adjuster:** makes the coverage decision on every referred claim.
- **Fraud reviewer:** decides on suspected duplicates (Release 2). `[AUTHORED — confirm]` that
  this is a separate role from the adjuster.
- **Claims supervisor:** monitors the worklist, the dashboard and the process instances.
- **Automation / operations team:** operates the process and handles exceptions.

---

## 2. Scope

### 2.1 In Scope
- Intake of homeowners water damage claim forms (PDF).
- Extraction of the claim details.
- Duplicate check against claim history (Release 2).
- Claim registration in the ClaimCore web UI.
- Policy lookup.
- Coverage recommendation grounded on the policy wording, with a cited clause.
- Deterministic triage.
- Adjuster review and decision.
- Fraud review of suspected duplicates (Release 2).
- Status write-back to ClaimCore.
- Operational monitoring and exception handling.

All of this runs as one orchestrated process, built end-to-end by coding agents with the `uip`
CLI and UiPath skills.

### 2.2 Out of Scope
- Storm, fire and theft claims. ClaimCore lists these perils, but this process handles water
  damage only.
- Payments, recovery, reserves, photo damage AI, and the customer self-service portal.
- Loss adjusting after triage: investigation, settlement and repair management. The claim's
  later lifecycle is a separate process.
- Any autonomous coverage decision.
- Changes to ClaimCore itself. ClaimCore is integrated with, not modified.

### 2.3 Automation and Human Boundary
The automation may extract, check, register, look up, reason and recommend. **Only a human
decides a claim that a rule refers.** The automation auto-accepts a claim only when no rule
fires. It never overrides a deterministic gate (see §3.3).

---

## 3. Decision Authority Model

### 3.1 Principle
**The agent proposes; the deterministic gate and the adjuster decide.** The coverage agent makes
the adjuster's decision faster and better explained. It does not move the decision into
software.

### 3.2 Authority Matrix
| Action | The automation may… | Human required? |
|---|---|---|
| Extract the claim form | Do it | No |
| Register the claim in ClaimCore | Do it | No |
| Recommend coverage | Do it, with a rationale, a cited clause and a confidence | No |
| Auto-accept a claim | Only when no rule (R1, R2, R3) fires | No |
| **Accept, partially accept or deny a referred claim** | **Never** | **Yes (adjuster)** |
| **Reject a suspected duplicate** | **Never** | **Yes (fraud reviewer)** |
| Route to adjuster or fraud review when a rule fires | Must (automatic) | No |

### 3.3 Deterministic Gates
The gates are **computed deterministically** and never left to model judgement. There are two:
- **Triage gate (`triage_gate`):** rules R1 and R2.
- **Duplicate gate (`check_duplicate`, Release 2):** rule R3.

### 3.4 What the Automation Never Does
- Approve or deny a claim.
- Override a gate.
- Invent policy terms, or cite a clause that is not in the policy wording.
- Register a claim through the API. The module is not licensed (see R5).
- Hide an exception.

---

## 4. Systems and Integration Surfaces
*(This section exists so that the SDD can choose API-first or UI automation for each system.)*

### 4.1 Ardenfield ClaimCore: web UI
- ClaimCore is a modern browser application, and the **only UI Automation target** in this
  process.
- **Claim registration is UI-only.** The Claims Registration API module isn't licensed.
- Registration uses the **new-claim wizard**, which has four steps:
  1. **Policy:** search by policy number, then confirm the policyholder and policy card.
  2. **Loss details:** date of loss, time, peril, cause, location, and a description of at
     least 20 characters.
  3. **Amount:** estimated amount (EUR), contact phone, claim form ref, and an optional
     attachment.
  4. **Review:** a declaration checkbox, then Submit.
- On success, ClaimCore shows the new claim number (`CLM-` followed by six digits) and sets the
  claim to REGISTERED.
- ClaimCore validates on submit:
  - the policy must exist and be **Active** (not Lapsed)
  - the date of loss must not be in the future and must fall inside the policy period
  - the estimated amount must be between 1 and 1,000,000
- Other screens: the claims worklist, claim detail with a status timeline and notes, policy
  lookup, the dashboard, the audit log, and reports.

### 4.2 Ardenfield ClaimCore: REST API (`/api/v1`)
The API offers **read endpoints plus a status update**. There is no claim creation.

| Method | Path | Use in this process |
|---|---|---|
| POST | `/auth/token` | Get a bearer token (credential `ClaimCore_Login`) |
| GET | `/policies/:policyNumber` | Policy, holder, limits and deductible (`get_policy`) |
| GET | `/claims?policyNumber=&lossDateFrom=&lossDateTo=&status=` | Claim history (`check_duplicate`) |
| GET | `/claims/:claimNumber` | Claim detail |
| PATCH | `/claims/:claimNumber/status` | Status update (`update_status`). Returns 409 on an invalid transition. Setting the same status twice is safe. |
| POST | `/claims` | **Always 403, `ClaimsRegistrationNotLicensed`**. Registration must use the UI. |

### 4.3 Intake Source: claim-form PDFs in a storage bucket
- Policyholders submit the **Home Claim Notification Form**, a branded Ardenfield PDF with a
  fixed layout.
- The PDFs arrive in the storage bucket **`claim-intake`**.
- Each new file starts one process instance. While the process is being built, runs are started
  manually with the file as input. In operation, the bucket trigger starts them.
- The form's fields are:
  - claim form ref
  - policy number
  - policyholder name, phone, email and property address
  - date and time of loss
  - peril (Water damage, ticked)
  - cause, location and description
  - estimated amount (EUR)
  - signature and date
- **IXP document extraction** reads these fields, run inline in the orchestration against a
  prebuilt IXP project for the claim form.

### 4.4 Policy Wording Document
The **Ardenfield Mutual Homeowners Policy Wording** is the coverage agent's only grounding
source. Its numbered clauses (for example §3.1 Escape of water and §4.3 Gradual leakage
exclusion) are what the agent cites. It is indexed in the context-grounding index
**`policy-wording`**.

### 4.5 Human Task Surface: Action Center
- The adjuster's decision is a human task in Action Center, shown in a branded Ardenfield action
  app. The process suspends until the adjuster acts.
- The review is a **same-day triage sign-off**, so every instance finishes well within 24 hours.
- Fraud review (Release 2) is also a human task in Action Center.

### 4.6 Configuration
| Resource | Name | Notes |
|---|---|---|
| Asset | `ClaimCore_BaseUrl` | ClaimCore address |
| Asset | `ClaimCore_SandboxId` | The office / sandbox scope, set for each environment |
| Asset | `AutoApproveThreshold` | Default EUR 5,000 (used by R1) |
| Credential | `ClaimCore_Login` | Claims-handler login for the UI and the API |
| Storage bucket | `claim-intake` | Inbound claim forms |
| Context-grounding index | `policy-wording` | The policy wording |

---

## 5. As-Is Process
All timings and handoffs in this section are `[AUTHORED — confirm]`.

| # | As-is step | Who | Pain point |
|---|---|---|---|
| A1 | Policyholder emails the claim form, or phones it in and the form is filled in for them | Policyholder | Forms queue in a shared mailbox; typical wait before pick-up is about 1 working day |
| A2 | Handler re-keys the form into the ClaimCore wizard | Claims handler | About 10–12 minutes per claim; typos in the policy number and dates |
| A3 | Handler searches the worklist for earlier claims on the same policy | Claims handler | Often skipped under load, so repeat claims slip through |
| A4 | Handler opens the policy wording and judges whether the loss looks covered | Claims handler | Inconsistent reading of the gradual-leak exclusion; no clause recorded |
| A5 | Handler decides whether to refer the claim to an adjuster | Claims handler | The threshold is applied by memory; referrals carry no written rationale |
| A6 | Adjuster reviews the referred claim and sets the status | Adjuster | The adjuster re-reads the form and wording from scratch |

---

## 6. To-Be Process Steps (step nature → skill signal)

> Each step gives its **nature**, which signals the skill that should implement it. The SDD
> makes the final mapping. **Use these step identifiers exactly.**

| # | Step identifier | What happens | Step nature (→ signal) |
|---|---|---|---|
| 1 | `extract_claim` | Extract the claim-form fields (§4.3) from the PDF | **Document extraction → IXP**, run inline against the prebuilt claim-form project |
| 2 | `check_duplicate` | *(Release 2)* Query the claim history for the same policy with a loss date within 30 days of this claim's loss date. If there is a match, route to `fraud_review`. | Deterministic lookup through an existing API → **API workflow** (`GET /claims`) plus a routing decision |
| 3 | `fraud_review` | *(Release 2)* A fraud reviewer sees the new claim and the matching prior claim, then confirms the duplicate or clears it | Human decision → **human task in Action Center** |
| 4 | `register_claim` | Register the claim through the ClaimCore new-claim wizard and return the `claimNumber` | Web form entry with no write API → **RPA (UI Automation, web)** |
| 5 | `get_policy` | Read the policy: product, status, dwelling and contents limits, deductible | Read from an existing API → **API workflow** (`GET /policies/:policyNumber`) |
| 6 | `coverage_agent` | Assess the loss against the policy wording and return a recommendation, rationale, cited clause and confidence (§9.2) | Judgement over a document → **low-code agent** grounded on the `policy-wording` index |
| 7 | `triage_gate` | Apply R1 and R2. If either fires, route to `adjuster_review`; otherwise auto-accept. | **Deterministic decision**: a rule, not model judgement |
| 8 | `adjuster_review` | The adjuster sees the claim, the policy and the agent's recommendation, then decides Accept, Partial or Deny | Human decision that needs rich context → **human task in Action Center** (prebuilt Ardenfield action app) |
| 9 | `update_status` | Write the final status to ClaimCore (§9.1) | Status write through an existing API → **API workflow** (`PATCH /claims/:claimNumber/status`) |
| — | Orchestration | Run the steps in order, one durable instance per claim form, with routing, waits for the human tasks, and retries | Long-running, multi-actor, resumable → **UiPath Maestro orchestration** (one instance per claim) |

**Order:** `extract_claim` → `register_claim` → `check_duplicate` → `get_policy` →
`coverage_agent` → `triage_gate` → (`adjuster_review` if a rule fires) → `update_status`.
Every claim is registered first, so it has a `CLM-` number and an audit trail (D25). When
`check_duplicate` matches, the claim goes to `fraud_review`. A confirmed duplicate is set to
REJECTED_DUPLICATE through `update_status`; a cleared claim continues to `get_policy`.
When a rule sends the claim to `adjuster_review`, the process first writes REFERRED (D26), then
writes the adjuster's final status.

**Release 1** (the first build) omits `check_duplicate` and `fraud_review`. **Release 2** adds
them as a change request. Also in Release 1, `register_claim` may be a stub until the UI Automation is built. The stub
takes the claim number of a claim the handler registered by hand and passes it on, so the later
steps work on a real ClaimCore claim (D28).

Field-level entry, wizard navigation and prompt design are specified per step in the SDD.

---

## 7. Business Rules
These rules are enforced by the automation. They are stated here word for word and must not be
reworded in the SDD.

- **R1:** estimated amount > `AutoApproveThreshold` (default EUR 5,000) → adjuster review.
- **R2:** coverage recommendation ≠ `COVERED` → adjuster review.
- **R3 (Day 2):** same policy with loss dates within 30 days → fraud review.
- **R4:** the agent never approves or denies; it recommends, with a cited clause.
- **R5:** registering a claim is UI-only in ClaimCore. The API has read endpoints plus a status update.

**How the rules apply:**
- **R1 and R2 together** make up `triage_gate`. Either one is enough to refer the claim. A claim
  is auto-accepted only when **neither** fires.
- **R1** reads the threshold from the `AutoApproveThreshold` asset at run time. It is never hard
  coded.
- **R3** is `check_duplicate`. "Day 2" means Release 2. The window is 30 days either side of the
  new claim's loss date, which is `[AUTHORED — confirm]`.
- **R4** means that every recommendation cites a clause number from the policy wording (for
  example §3.1 or §4.3), and that the recommendation is advisory.
- **R5** means that `register_claim` uses the ClaimCore web UI. `POST /claims` returns 403.

---

## 8. Exception Handling
Exceptions are handled as **process outcomes**, never silently. All handling in this section is
`[AUTHORED — confirm]`.

- **Business exceptions:**
  - ClaimCore rejects the registration. The policy was not found, the policy is Lapsed, or the
    date of loss is in the future or outside the policy period.
  - A required field is missing from the extraction (policy number, date of loss, estimated
    amount).

  In these cases, no retry is made. The instance ends as *Failed: Business Exception*, and the
  reason is recorded so a claims handler can follow up with the policyholder.
- **Application exceptions:** the ClaimCore UI does not respond, the API times out, or the agent
  call fails. The step is retried up to the configured maximum, and then the instance ends as
  *Failed: Application Exception*.
- **Invalid status transition:** a 409 from `PATCH /claims/:claimNumber/status` is a business
  exception. Setting the same status again is not an error, so retries are safe.
- **Late notification:** a loss reported more than 30 days after it happened is not rejected by
  the automation. The coverage agent notes it against Policy Wording §6. Because the agent then
  returns a recommendation other than `COVERED`, R2 sends the claim to the adjuster.

Every instance is traceable in the orchestration's instance list and in the ClaimCore audit log.

---

## 9. Outcomes and Data Definitions

### 9.1 Outcomes and ClaimCore Statuses
| ClaimCore status | Label | Meaning | Set by |
|---|---|---|---|
| REGISTERED | Registered | The claim exists in ClaimCore | `register_claim` (the wizard) |
| IN_TRIAGE | In triage | The claim is being assessed | Not written by this process (D26). ClaimCore still permits it. |
| REFERRED | Referred to adjuster | The claim is waiting for the adjuster | `update_status`, when the claim enters `adjuster_review`, before the task is created (D26) |
| ACCEPTED | Accepted | Auto-accepted by `triage_gate`, or accepted by the adjuster | `update_status` |
| PARTIAL | Partially accepted | The adjuster accepted part of the claim | `update_status` |
| DENIED | Denied | The adjuster denied the claim | `update_status` |
| REJECTED_DUPLICATE | Rejected (duplicate) | The fraud reviewer confirmed a duplicate | `update_status`, at the end of the `fraud_review` path (D25; see §15, open item 1) |

ClaimCore permits these transitions:
- REGISTERED → IN_TRIAGE, REFERRED or a final status
- IN_TRIAGE → REFERRED or a final status
- REFERRED → a final status

ACCEPTED, PARTIAL, DENIED and REJECTED_DUPLICATE are final.

### 9.2 Coverage Agent Output
| Field | Values |
|---|---|
| `recommendation` | `COVERED`, `PARTIAL` or `NOT_COVERED` |
| `rationale` | Plain-English reasoning that refers to the claim's facts |
| `citedClause` | The policy wording clause relied on, for example `§3.1` or `§4.3` |
| `confidence` | A number from 0 to 1 `[AUTHORED — confirm]` for the scale |

### 9.3 The Claim Object
The claim object passes between the steps. Its field names are `[AUTHORED — confirm]`:
- **From the claim form:** `claimFormRef` (`CF-…`), `policyNumber` (`HO-…`),
  `policyholderName`, `phone`, `email`, `propertyAddress`, `lossDate`, `lossTime`, `peril`,
  `cause`, `location`, `description`, `estimatedAmount`.
- **From ClaimCore:** `claimNumber` (`CLM-NNNNNN`), `product`, `policyStatus`, `dwellingLimit`,
  `contentsLimit`, `deductible`.
- **From the coverage agent:** `recommendation`, `rationale`, `citedClause`, `confidence`.
- **From triage and review:** `triageRoute` (`AUTO_ACCEPT` / `ADJUSTER`), `adjusterDecision`,
  `adjusterNotes`, `duplicateOfClaimNumber` (Release 2), `finalStatus`.

**Reference values in ClaimCore:**
- **Perils:** Water damage, Storm, Fire, Theft.
- **Causes:** Burst pipe, Appliance failure, Gradual leak, Roof leak, Other.
- **Locations:** Kitchen, Bathroom, Basement, Laundry, Other.
- **Products:** Homeowners Standard, Homeowners Plus.

---

## 10. Volume and Operating Model
- **Operating model:** one orchestration **instance per claim form**, with durable state, retries
  and per-instance traces.
- **Monitoring:**
  - the ClaimCore dashboard, worklist and audit log
  - the orchestration's instance list and traces
  - the Action Center queue for pending adjuster decisions
- **Portfolio:** about 400k policies.
- **Volume:** about 8,000–9,000 homeowners water damage claims a year, which is about 35 per
  working day `[AUTHORED — confirm]`.
- **Peak:** cold snaps (burst pipes) bring peaks of up to 3× the daily average
  `[AUTHORED — confirm]`.
- **Expected mix at the default threshold:** about 55% auto-accepted, about 45% referred
  `[AUTHORED — confirm]`.

---

## 11. KPIs
All targets and baselines in this table are `[AUTHORED — confirm]`, except where the Source
column says otherwise.

| KPI | As-is | Target | Source |
|---|---|---|---|
| Form received → claim registered | about 1 working day | under 15 minutes | `[AUTHORED — confirm]` |
| Handler time per claim (intake + triage) | about 25 minutes | under 3 minutes (exceptions only) | `[AUTHORED — confirm]` |
| Referred claims decided the same day | not measured | 100% (same-day triage sign-off) | Design §2 |
| Referred claims with a written rationale and a cited clause | close to 0% | 100% (R4) | R4 |
| Registration re-keying errors | about 4% of claims | under 0.5% | `[AUTHORED — confirm]` |
| Repeat claims caught before policy lookup and triage (Release 2) | not measured | 100% of claims matching R3 | R3, D25 |

---

## 12. Roles and Responsibilities (RACI)
This table is `[AUTHORED — confirm]`.

| Activity | Automation | Claims handler | Adjuster | Fraud reviewer | Supervisor |
|---|---|---|---|---|---|
| Extract and register | R | A | — | — | I |
| Duplicate check (Release 2) | R | — | — | I | I |
| Confirm or clear a duplicate | — | — | — | **R/A** | I |
| Coverage recommendation | R | — | I | — | — |
| Triage (R1, R2) | R | — | I | — | A |
| **Decide a referred claim** | — | — | **R/A** | — | I |
| Status update | R | — | I | — | I |
| Operate and handle exceptions | R | C | — | — | A |

---

## 13. Acceptance Cases
The four test claims are generated for each ClaimCore sandbox, so each has a matching policy and
claim-form PDF. Dates of loss are relative to the day the sandbox is created. The default
threshold is EUR 5,000.

| # | Scenario | Claim facts | Expected recommendation | Rules | Expected outcome |
|---|---|---|---|---|---|
| S1 | Covered, under threshold | Maya Okafor, Homeowners Standard. Appliance failure, kitchen, loss 2 days ago: the dishwasher inlet hose split overnight, damaging floor laminate and two cabinet plinths. **EUR 2,400.** | `COVERED`, §3.1 | None fire | **ACCEPTED (auto)**, with no human task |
| S2 | Covered, over threshold | Daniel Brandt, Homeowners Plus. Burst pipe, bathroom, loss 1 day ago: a pipe burst in the cold snap and the living-room ceiling partly collapsed; sofa, rug and TV damaged; ceiling and wiring need repair. **EUR 18,750.** | `COVERED`, §3.1 | R1 | **REFERRED → adjuster**. The final status is the adjuster's decision; in the reference run, ACCEPTED `[AUTHORED — confirm]` |
| S3 | Gradual-leak exclusion | Priya Raman, Homeowners Standard. Gradual leak, bathroom, loss 3 days ago: the floor around the shower tray was soft, the subfloor was found rotten, and the seal has been leaking for several months. **EUR 3,900.** | `NOT_COVERED`, citing **§4.3** | R2 (R1 does not fire) | **Agent recommends `NOT_COVERED` citing §4.3 → adjuster confirms → DENIED** |
| S4 | Duplicate (Release 2) | Tom Whitaker, Homeowners Standard. Appliance failure, laundry, loss 1 day ago: the washing machine leaked during a cycle and flooded the utility room. **EUR 2,950.** ClaimCore already holds a claim on the same policy: appliance failure, laundry, loss 12 days ago, EUR 2,700, ACCEPTED. | Not reached | R3 | **REJECTED_DUPLICATE via fraud review** |

**Notes:**
- S3 shows R2 on its own: it is under the threshold, yet it is referred.
- S2 shows R1 on its own: it is covered, yet it is referred.
- Before Release 2, S4 has no duplicate gate. It would behave like S1 (covered under §3.1, under
  the threshold) and be auto-accepted. That is the gap that motivates the change request.

---

## 14. Solution Approach / Target Architecture
*(This bridges the business view to the platform. It sets direction and is not a full design.)*

**Solution:** `Ardenfield.ClaimsIntake`, shipped as one Solution (`.uipx`).

**Canonical component names:** use these exact names so that the design stays consistent across
regenerations.
- Orchestration (the spine): **`ClaimIntake`**
- Document extraction: `extract_claim`, IXP run inline against the prebuilt claim-form project.
  It is not a separate project.
- API workflows:
  - **`GetPolicy`**: ClaimCore read
  - **`UpdateClaimStatus`**: ClaimCore status endpoint
  - **`CheckDuplicateClaim`**: claim-history query (Release 2)
- Agent (low-code): **`CoverageAgent`**, grounded on the `policy-wording` index
- RPA: **`RegisterClaim`**, UI Automation of the ClaimCore new-claim wizard
- Human tasks: `adjuster_review` (the prebuilt Ardenfield action app) and `fraud_review`
  (Release 2), both in Action Center

**Step order:** `extract_claim` → `register_claim` → `check_duplicate` → `get_policy` →
`coverage_agent` → `triage_gate` → `adjuster_review` → `update_status`, with `fraud_review`
branching off `check_duplicate` (D25).

**Design principles:**
- **Agent proposes, deterministic gate decides.** R1, R2 and R3 are rules evaluated outside the
  agent. The agent's output is data that the gate reads.
- **Human-in-the-loop:** the adjuster's decision suspends the instance. The action app is a thin
  decision surface: the claim, the policy and the recommendation go in, and a decision and notes
  come out.
- **Build constraint:** coding agents author and deploy the whole solution with the `uip` CLI and
  UiPath skills.

---

## 15. Open Items
1. ~~Recording a rejected duplicate.~~ **Resolved: option (b)**, register first, then set REJECTED_DUPLICATE (D25, confirmed).
2. ~~Intermediate status writes.~~ **Resolved:** REFERRED is written when a claim goes to the adjuster; IN_TRIAGE is not written (D26, confirmed).
3. ~~A cleared duplicate.~~ **Resolved:** it continues to `get_policy`; it is already registered (follows from D25).

---

## Appendix
- **Policy wording:** *Ardenfield Mutual Homeowners Policy Wording* (`content/policy-wording.md`).
  It is the grounding source for `coverage_agent`.
- **Claim form:** *Home Claim Notification Form*, one PDF per test claim (`CF-<sandbox>-S1.pdf` …
  `S4.pdf`).
- **Walkthrough example:** S1 (Maya Okafor, dishwasher hose, EUR 2,400).
