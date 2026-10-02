# Tribal-GovtEdu — Codebase Analysis

**Scope:** all 43 files in `src/` (~9,650 lines) · React 19 + TypeScript (strict) + Vite 6 + Tailwind 3
**Baseline:** `npm run build` passes clean — `tsc` reports zero errors.
**Date:** 2026-10-02

> **Note on method.** Findings below were each re-verified by reading the referenced source
> directly. Several claims produced by automated review were **discarded** because they did not
> survive checking — including one that cited a non-existent file (`src/lib/constants/index.ts`).
> Anything not independently confirmed has been left out rather than softened with hedging.

---

## Verdict

The architecture is sound. The domain model is genuinely well-typed, role gating is centralised
in one place, and `tsc` is clean. What is missing is **edge-case coverage for the 5 stages that
never occur in the happy path** — and that is where essentially every serious bug lives.

The 13-stage workflow is modelled correctly in the types, but 4 of the 13 stages
(`NOT_SELECTED`, `INELIGIBLE`, `REJECTED`, and partially `DRAFT`) are missing from the render
layer. The demo data never reaches them, so the bugs are invisible in casual use and would ship
the moment real data did.

**Highest-leverage single change:** `tsconfig.json` has `noUnusedLocals: false` and
`noUnusedParameters: false` (lines 19-20). Turning both on surfaces 9 dead imports at build time
and blocks their return.

---

## Severity summary

| Severity | Count | User impact |
|---|:--:|---|
| Critical | 5 | Wrong or hidden information shown to the user |
| High | 7 | Incorrect data exposure or misleading figures |
| Minor | 4 | Content and hygiene issues |
| **Verified dead imports** | **9** | Not caught by the build |

---

## CRITICAL

### C1 — `NOT_SELECTED` is displayed to the applicant as *"step 1 of 6: Application Submitted"*

`src/components/common/VisualTracker.tsx:20-36`

`getStageIndex` handles 12 of the 13 `ApplicationStage` values. `NOT_SELECTED`
(`src/types/index.ts:34`) is the single omission, so it falls through to
`default: return 1` (line 34) — **the same index as `SUBMITTED`**.

```
case 'SUBMITTED':  return 1;   // line 23
default:           return 1;   // line 34  <- NOT_SELECTED lands here
```

A terminal adverse outcome is rendered as an application actively sitting at the very start of
the pipeline, with step 1 highlighted. `NOT_SELECTED` is reachable in normal operation — it is a
committee decision option in `ScreeningDashboardPage`.

The `default` clause is also precisely what stopped the compiler noticing the non-exhaustive
switch.

### C2 — `REJECTED` and `INELIGIBLE` render as a brand-new, untouched application

`src/components/common/VisualTracker.tsx:32-33` → consumed at `:64-68`

```ts
case 'REJECTED':
case 'INELIGIBLE': return -1;
...
const isPending = activeIndex < stepNumber;   // line 68
```

With `activeIndex === -1` and `stepNumber` starting at 1, `-1 < 1` is true for **every** step, so
all six steps render in the pending style. The result is visually identical to a fresh `DRAFT`
(`activeIndex === 0`). There is no adverse-outcome branch anywhere in the component.

An applicant whose file was rejected sees a tracker implying nothing has happened, with no
rejection indicator. This directly contradicts the portal's own published policy in
`LegalNotice.tsx:53-54`: *"Status is never communicated by colour alone; every status chip also
carries a text label."*

**C1 and C2 are the same root cause** — one switch missing its terminal-outcome cases — and
close together in about 5 lines.

### C3 — NFST eligibility can never pass; the checker's success path is unreachable

`src/pages/EligibilityCheckerPage.tsx:36, 67-69, 86, 251` + `src/mock/initialData.ts:181-188`

The NFST scheme ships a mandatory rule:

```ts
{ id: 'rule-admission', field: 'academicDetails.admissionStatus',
  operator: 'EQUALS', value: 'CONFIRMED', mandatory: true }
```

But the page only collects that field when overseas:

```ts
const needsOverseasAdmission =
  currentScheme?.location === 'ABROAD' || currentScheme?.category === 'OVERSEAS';  // :36
...
admissionStatus: needsOverseasAdmission ? (admissionStatus as AdmissionStatus) : undefined  // :86
...
{needsOverseasAdmission && ( <input ... /> )}   // :251 — never rendered for NFST
```

NFST is `location: 'INDIA'`, `category: 'FELLOWSHIP'` (`initialData.ts:90-96`), so
`needsOverseasAdmission` is `false`. The applicant is **never shown the input**, `:86` passes
`undefined`, and the mandatory rule hard-fails as *"Not provided."*

**Impact:** NFST is the default scheme (`App.tsx:35` initial `sch-nfst`). The flagship
"Interactive Eligibility Checker" always reports manual review required for a fully-qualified
applicant, and the `outcome.overallEligible &&` gate at `EligibilityCheckerPage.tsx:365` makes
"Proceed to application" permanently unreachable. The applicant has no control that could fix it.

**Fix:** gate the input on what the rules actually reference — the mechanism already exists as
`EligibilityEngine.referencesField`, and the same page already uses it correctly for income at
`:38`.

### C4 — Officer OCR decisions are neither attributed nor audited

`src/components/officer/OCRViewer.tsx:17, 165` → `src/context/DataContext.tsx:555-557`

Both call sites omit the optional `user` argument:

```ts
updateDocumentOcrField(application.id, document.id, fieldKey, editValue, 'EDITED');          // :17
onClick={() => updateDocumentOcrField(application.id, document.id, f.fieldKey,
             f.extractedValue, 'ACCEPTED')}                                                   // :165
```

and the implementation audits **only if a user was supplied**:

```ts
if (user) { addAuditLog(...) }   // DataContext.tsx:555
```

An officer's accept/edit decision on a document field is the highest-consequence
human-in-the-loop action in the officer desk, yet it produces **no audit record and no actor
identity**. Every other officer action — deficiency raise/resolve, screening decision, sanction
— passes an actor. This contradicts the portal's own policy text at `LegalNotice.tsx:68`, which
promises that *"OCR field decisions"* are recorded.

### C5 — Clicking "Accept" on a mismatch forces the row to display as a match

`src/components/officer/OCRViewer.tsx:165` → `src/context/DataContext.tsx:536-541`

```ts
matchedWithApp: action === 'ACCEPTED' ? true
              : action === 'REJECTED' ? false
              : newValue.trim().toLowerCase() === (f.appValue ?? '').trim().toLowerCase()
```

`OCRViewer.tsx:153-156` renders the Consistency column straight off `f.matchedWithApp`.

The indicator is therefore **self-fulfilling, not derived from data**. An officer who clicks
Accept on a genuine OCR-vs-form mismatch silently converts a `false` into a green `MATCH` badge
with no underlying data change — erasing the discrepancy from the only place it was surfaced.

---

## HIGH

### H1 — The notification dropdown leaks other users' notifications

`src/components/common/Header.tsx:33-35` vs `:232-235`

The count is computed correctly:

```ts
const unreadNotifications = notifications.filter(
  (n) => (n.userId === 'ALL' || n.userId === currentUser.id) && !n.read);   // :33
```

but the dropdown body renders the **unfiltered** list and uses the wrong emptiness test:

```tsx
{notifications.length === 0 ? ( ... ) : notifications.slice(0, 6).map((n) => ...)}   // :232-235
```

Two distinct defects:

1. **Privacy leak.** Notifications are genuinely targeted per user — seed data carries
   `userId: 'usr-officer-1'`, `'usr-committee-1'`, `'usr-applicant-3'` …
   (`initialData.ts:678-741`), and `DataContext` writes `userId: app.applicantId`
   (`:151, 173, 257, 386, 428, 498`). A notice addressed to one applicant renders verbatim in
   another's bell. For a portal holding Aadhaar numbers, bank details and income certificates,
   this is a real disclosure bug — and it contradicts `LegalNotice.tsx:17-19` (*"Applicant
   workspaces are scoped to the signed-in applicant"*).
2. **Read/unread inconsistency.** The header reads "N Unread" while listing already-read items.

**Fix:** use `unreadNotifications` in both the list and the empty-state check.

### H2 — Landing page reports 3 "Applications Processed" while one is still mid-review

`src/pages/LandingPage.tsx:29-35`

```ts
/* Live counts are derived from the actual demo dataset — no invented statistics. */
const totalAppsCount = applications.length;                        // :31  -> 3
const underReviewCount = applications.filter(
  (a) => a.stage === 'UNDER_VERIFICATION' || a.stage === 'UNDER_SCREENING'
      || a.stage === 'ELIGIBLE').length;                           // :32-34 -> 1
const beneficiariesCount = applications.filter((a) => a.stage === 'SELECTED').length; // -> 1
```

Against the seed data (`initialData.ts:300, 457, 583` → `DEFICIENCY_RAISED`,
`UNDER_SCREENING`, `SELECTED`) the hero renders **3 / 1 / 1**: three applications *processed*,
of which one of those same three is still under active scrutiny. The comment two lines above
explicitly claims *"no invented statistics"* — the metric contradicts its own stated intent.

### H3 — Three independent definitions of "which stage counts as in review"

| File:line | Definition |
|---|---|
| `OfficerScrutinyPage.tsx:18` | `OFFICER_STAGES` — 5 values |
| `AdminDashboardPage.tsx:54` | `UNDER_VERIFICATION \|\| SUBMITTED` — 2 values |
| `LandingPage.tsx:32-34` | `UNDER_VERIFICATION \|\| UNDER_SCREENING \|\| ELIGIBLE` — 3 values |

Three hand-maintained copies of one concept, none shared. `OFFICER_STAGES` is a **local const**
inside its page — not exported, not in a shared module.

Consequence: `app-001` sits in `DEFICIENCY_RAISED` and is counted in **none** of the three
tiles. The single application the workflow cannot advance is the one the landing page cannot see.

### H4 — An administrator's scrutiny workspace shows two empty queues

`src/pages/OfficerScrutinyPage.tsx:51-58` + `src/mock/initialData.ts:302, 459, 585`

```ts
const assignedApps   = applications.filter((a) => a.assignedOfficerId === currentUser.id);
const unassignedApps = applications.filter((a) => !a.assignedOfficerId);
```

All three seeded applications carry `assignedOfficerId: 'usr-officer-1'`. For an administrator
(`usr-admin-1`) both filters yield **zero**. `navigation.ts:31` deliberately grants admins
read-only access to this workspace so the master directory can deep-link into it — but a
deep-link then resolves a file against two empty queues.

### H5 — `StatusBadge` renders `NOT_SELECTED` as grey all-caps `"NOT SELECTED"`

`src/components/common/StatusBadge.tsx:39-40`

`NOT_SELECTED` has no case, so it hits `default` → `st.replace(/_/g, ' ')`, which preserves the
input's upper case. Every other branch returns Title Case. A **terminal adverse state** is styled
as a neutral grey chip with a `Clock` icon — indistinguishable from work in progress.

### H6 — `StatusBadge` conflates `INELIGIBLE` with `REJECTED`

`src/components/common/StatusBadge.tsx:31-32`

```ts
case 'INELIGIBLE':
case 'REJECTED': return { label: 'Rejected', ... };
```

"Did not qualify on the rules" and "was rejected after review" are materially different outcomes
for the applicant, and they collapse to one word. (`INELIGIBLE` is currently unreachable —
`updateApplicationStatus` is only ever called with `UNDER_SCREENING` and `REJECTED` — so only the
`NOT_SELECTED` half of H5/H6 is currently live.)

### H7 — `StatusBadge`'s prop type erases all type safety

`src/components/common/StatusBadge.tsx:6`

```ts
status: ApplicationStage | string   // collapses to `string`
```

The union contributes nothing — any string from any domain compiles. The looseness is load-
bearing: lines 22, 27-28 handle `'DEFICIENT'`, `'VERIFIED'`, `'AI_PASSED'`, which are
`AppDocument.verificationStatus` values, **not** `ApplicationStage` values. No caller passes
them today (all call sites pass `*.stage`), so the prop should be typed `ApplicationStage` and
those three cases deleted.

---

## MINOR

### M1 — A fictional third scheme is named in the UI

`src/pages/LandingPage.tsx:172` renders the caption **"NFST, NOS & Top Class Education"**.
Only two schemes exist (`initialData.ts:90` `sch-nfst`, `:200` `sch-nos`). The third is invented.

### M2 — "6-stage processing" contradicts the configured workflow

`src/pages/LandingPage.tsx:330` — *"Transparent 6-stage digital processing…"*
Both schemes define exactly **5** `workflowStages` (`initialData.ts:191-195`, `:276-280`,
`stg-1`…`stg-5`). One line of copy.

### M3 — 9 verified dead imports

Each appears **only** on its import line (verified by occurrence count):

| File | Unused |
|---|---|
| `components/common/Header.tsx` | `ShieldAlert`, `CheckCircle2` |
| `components/common/VisualTracker.tsx` | `XCircle`, `Sparkles` |
| `components/common/LegalNotice.tsx` | `useState` |
| `components/applicant/AwardTracker.tsx` | `DollarSign`, `Calendar`, `FileText` |
| `components/ai/AdminAIAssistant.tsx` | `Send` |

### M4 — The build is configured so it cannot catch M3

`tsconfig.json:19-20`

```json
"noUnusedLocals": false,
"noUnusedParameters": false,
```

Both flags are off, so `tsc` will never flag an unused import. That is why M3 accumulated.
Flipping both to `true` catches all 9 immediately and prevents recurrence — expect it to also
surface a few unused *locals* to clean up in the same pass.

---

## Strengths worth preserving

These are genuine, and any refactor should not regress them:

- **`src/types/index.ts` is excellent** — a complete 294-line domain model: 5 roles, 13 stages,
  and rich sub-types (`OCRFieldExtraction` carries per-field confidence *and* officer override;
  `AwardDetails` carries milestones, payments and disbursement status). Strict mode compiles
  clean against it. This is the strongest asset in the project.
- **Role gating is centralised** — `navigation.ts` holds one `ROLE_GATED` map and one
  `ROLE_LANDING` map, and `App.tsx:49-52` enforces them in a single `useMemo`. Adding a role is a
  one-line change, not a hunt through 14 pages.
- **The navigation contract is deliberate** — every page receives `navigate(tab, opts?)` so
  scheme/application context survives a cross-page CTA, with an explicit comment saying so
  (`navigation.ts:15`). That prevents a whole class of context-loss bug.
- **`AccessibilityContext` degrades safely** — every `localStorage` access is wrapped in
  `try/catch` with a fallback, so settings simply do not persist rather than crashing on
  storage-denied browsers (`AccessibilityContext.tsx:26-36, 61-66`).
- **Code comments explain *why*, not *what*** — several are genuinely useful engineering notes,
  e.g. `AccessibilityContext.tsx:51-53` recording that `contrast-125` was not a real Tailwind
  utility and the toggle silently did nothing.

---

## Suggested fix order

| # | Fix | Why first |
|:--:|---|---|
| 1 | **M4** — flip `noUnusedLocals`/`noUnusedParameters` | Free; catches M3 and stops recurrence |
| 2 | **C1 + C2** — terminal stages in `VisualTracker` | ~5 lines, worst user-visible harm |
| 3 | **C3** — gate `admissionStatus` on `referencesField` | Unblocks the flagship checker |
| 4 | **H1** — filter the notification dropdown | Privacy leak |
| 5 | **C4 + C5** — pass the actor; stop forcing `matchedWithApp` | Audit integrity |
| 6 | **H2 + H3** — one shared in-review stage set | Removes a 3-way duplication |
| 7 | **H5 + H6 + H7** — `StatusBadge` completeness and typing | User-facing wording |
| 8 | **H4, M1, M2** — seed data, captions | Cosmetic / demo polish |

Items 2, 3 and 4 are roughly an hour of work combined and remove every Critical and High
finding that a reviewer, or a user, is most likely to hit first.

---

## Reproducing these findings

Every claim is a one-command check:

```bash
cd Tribal-GovtEdu

# C1 — no NOT_SELECTED case in the switch
grep -n "NOT_SELECTED" src/components/common/VisualTracker.tsx     # no output

# C3 — NFST rule needs a field the UI cannot collect
grep -n "needsOverseasAdmission" src/pages/EligibilityCheckerPage.tsx

# C4 — OCR calls omit the actor argument
grep -n "updateDocumentOcrField" src/components/officer/OCRViewer.tsx

# H1 — count is filtered, list is not
grep -n "unreadNotifications\|notifications.slice" src/components/common/Header.tsx

# M3/M4 — why the build stayed silent
grep -n "noUnused" tsconfig.json
```

---

<div align="center"><sub>Generated by direct source inspection. Not committed — review before pushing.</sub></div>
