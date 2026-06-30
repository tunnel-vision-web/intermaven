# COMPENSATION & CONTRACTS — tunemavens.com

**Companion to DOCUMENTATION.md §9 (Compensation Engine).** This document maps each compensation configuration to the contract it produces, the clauses the Contract Creation System must surface, and how recoupment and cascade logic must be represented in signed agreements.

---

## 1. Purpose

The Compensation Engine resolves *money movement* (the cascade). This document governs *the paper trail* — what gets signed, what each contract must legally state, and how the Contract Creation System should select and populate templates based on which compensation path a deal took.

Every compensation configuration described in DOCUMENTATION.md §9.3 must produce a corresponding signed contract before any cascade transaction is permitted to fire. No payout path should be live without `contract_id` populated and `status: signed` on the relevant deal record.

---

## 2. Publishing Contracts

### 2.1 Tunemavens Publishing — Standard Administration Agreement

Applies to: §9.3.1.A (standard 50/50 publisher-share administration, no active pitching service).

Required clauses:
- Confirmation that the **writer's share (50% of total publishing royalty) is retained by the songwriter** and is non-negotiable under this agreement.
- Publisher's share split: **50% Tunemavens Publishing / 50% creator-as-self-publisher** (or further split if a co-publisher is later added — triggers a contract amendment, not a new contract).
- Scope limited to administration: registration with PROs/CMOs, royalty collection, and distribution of collected publisher's-share income. No pitching, placement, or sync-sourcing obligation on Tunemavens' part.
- Term length, territory, and termination/reversion clause (standard administration deals are typically term-limited, e.g. 1–3 years, auto-renewing unless terminated).
- Audit rights for the creator to review Tunemavens' collection and distribution records.

### 2.2 Full-Service Placement, Publishing & Sync Agent Agreement (Co-Publishing)

Applies to: §9.3.1.B.

Required clauses:
- Identification of the co-publishing partner entity by name, and confirmation that the publisher's share is split **50/50 between the collective publishers** (Tunemavens + named partner) and the creator's publisher-side interest, consistent with §2.1's base convention, but now applied across two publishing administrators on the collecting side.
- Active pitching/placement obligation: explicit statement that Tunemavens will actively pitch the work for sync, licensing, and placement opportunities using its existing network, and what (if any) minimum-effort or reporting cadence applies.
- **Writer/production credit clause**: if Tunemavens or a Tunemavens-affiliated contributor participated in writing, top-line, or production of the work, this contract (or a linked work-specific addendum) must separately document:
  - The specific contribution (writing / co-writing / production / top-line / etc.)
  - The resulting writer-side or production-credit percentage, held distinct from the publisher-side administration split above
  - Names of all contributing parties and their individual shares within that credit pool
- **Recoupables clause**: any advance, marketing spend, or pitching cost fronted by Tunemavens under this agreement must be itemized as recoupable, stating:
  - The recoupment source (which income streams the advance recoups against — typically all publisher's-share income from the work)
  - Whether recoupment is cross-collateralized against the creator's other works or contained to this work/deal only
  - Recoupment reporting cadence and the creator's right to view real-time remaining balance
- Standard cascade disclosure: once the co-publishing split and any recoupment are resolved, remaining proceeds cascade through the standard Compensation Engine waterfall (Commission → Label → Artist → Manager → Investor) — this contract should reference but not duplicate that cascade logic, which lives in the Compensation Engine record, not the contract text itself.

### 2.3 Catalogue Acquisition / Advance Agreement

Applies to: §9.3.1.C.

Required clauses:
- Full description of what was acquired or advanced against (entire catalogue, specific works, future earnings of a defined scope).
- Acquisition/advance amount, recoupment rate (commonly 100% of net receipts until recouped, but must be stated explicitly — some deals use a lower recoupment rate to leave the creator some income during the recoupment period; this must be specified, not assumed).
- Reversion terms: what happens to ownership/rights if and when the advance is fully recouped (in a pure acquisition, nothing reverts; in an advance-against-future-earnings deal, ownership was never transferred and normal splits simply resume).
- Cross-collateralization disclosure (same as 2.2): whether this advance recoups only against the specific catalogue/work, or against the creator's broader earnings across all Tunemavens deals.

---

## 3. Distribution Contracts

### 3.1 Standard Distribution Agreement (Fee-Matched, Flat Fee)

Applies to: §9.3.2.A.

Required clauses:
- Flat fee amount and billing cadence (annual / per-release / per-single, matching whichever competitor pricing model was used as the benchmark).
- Explicit statement that the creator **retains 100% of DSP royalty income** — this is a service fee, not a revenue share, and the contract must not contain split-percentage language that could be confused with the native rev-share agreement in 3.2.
- Standard distributor obligations: delivery to DSPs, metadata accuracy, takedown rights, ISRC/UPC handling.

### 3.2 Tunemavens Native Distribution Agreement (Revenue Share)

Applies to: §9.3.2.B.

Required clauses:
- Explicit split: **Tunemavens 45% / Creator 55%** of net distribution revenue generated through tunemavens.com's native distribution (not third-party DSP payouts under 3.1 — this is a separate revenue stream).
- Admin-editable split disclosure: state that this split is the platform default and may be amended per-artist or per-release only by mutual written agreement (i.e. the admin-editable mechanism in the backend must always be backed by a corresponding signed amendment, never adjusted unilaterally).
- Term and exclusivity: whether the creator must distribute exclusively through Tunemavens native distribution for a defined term, or whether this runs in parallel with other distribution.

### 3.3 Label / Catalogue Owner Negotiated Distribution Agreement

Applies to: §9.3.2.C.

Required clauses:
- Final negotiated split (need not be 50/50 — the 50/50 figure is only the wizard's opening offer, not a guaranteed term).
- **Negotiation history disclosure**: the contract or an attached schedule should reference the negotiation record (`negotiation_history` from the `distribution_deals` schema) so both parties have a documented trail of how the final terms were reached — important for dispute resolution and for any later audit.
- Roster/catalogue scope: whether the negotiated split applies to the label's entire roster or specific artists/releases within it.
- Renegotiation trigger conditions, if any (e.g. catalogue size threshold, term expiration).

---

## 4. Contract Creation System — Routing Logic

The Contract Creation System must select the correct template set based on which compensation path produced the deal. Routing logic:

```
IF deal_type == "publishing":
    IF tier == "standard_admin"      → Template 2.1 (Standard Administration Agreement)
    IF tier == "full_service_copub"  → Template 2.2 (Co-Publishing Agreement)
                                         + Work-Specific Writer/Production Addendum (if applicable)
    IF deal_type == "catalogue_acquisition" → Template 2.3 (Acquisition/Advance Agreement)

IF deal_type == "distribution":
    IF path == "standard_fee_matched" → Template 3.1 (Flat Fee Agreement)
    IF path == "tunemavens_native"    → Template 3.2 (Revenue Share Agreement)
    IF path == "label_negotiated"     → Template 3.3 (Negotiated Agreement)
                                          + Negotiation History Schedule (auto-attached)
```

Every generated contract must pull its percentage and recoupment figures **live from the relevant deal record** (`publishing_deals`, `distribution_deals`, `catalogue_acquisitions`) rather than from static template defaults, so the signed document always reflects the actual configured terms, not the platform default.

After e-signature, the contract is stored and `contract_id` is written back to the deal record, which then **unlocks** the deal for the Compensation Engine — the cascade should be code-gated to refuse processing any deal lacking a signed, stored contract reference.

---

## 5. Audit Trail Requirements

Consistent with the Compensation Engine's existing audit trail requirement (DOCUMENTATION.md §9.3), every contract-linked deal must expose to its rights holder(s):

- The signed contract document itself (downloadable at any time).
- Current recoupment balance, if applicable, updated in real time.
- Full payment history showing each cascade resolution tied to that contract (date, gross amount, each tier's cut, net to creator).
- Negotiation history, if the deal originated from the AI wizard negotiation path (§3.3).

This is the same immutable ledger described in §9.3 — this document does not introduce a separate ledger, only specifies what must be contractually documented alongside it.

---

*Companion to DOCUMENTATION.md §9. Should be referenced in any future Contract Builder or Distribution Tracker app implementation (DOCUMENTATION.md §10.3/§10.4 roadmap items).*
