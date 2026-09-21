# Prototype v1 Scope

This is the clearest reference for **what the demo is supposed to prove**.
When in doubt about whether something belongs in Prototype v1, check this
file before [requirements.md](requirements.md).

## Objective

Validate the Fernández López platform concept — rental administration,
commercial CRM, and property management working together — with the client,
**before** any backend/database/auth investment.

## What must feel functional

These need to work end-to-end in the browser, backed by mock data and
`localStorage` (see [architecture.md](architecture.md#localstorage-persistence)):

- Dashboard with real (mock) numbers and an attention panel.
- Rental administration overview and contract detail.
- Properties in list, card, and map views, with a real detail page.
- Contacts with multi-role support.
- Opportunities with a working pipeline (drag/advance stage).
- Visits scheduling and agenda.
- Basic reports with filters.
- Full responsive behavior (desktop/tablet/mobile).

## What may be simulated

- IPC/ICL rent adjustment calculations (no live INDEC/BCRA data).
- AI contract upload/extraction (mocked extraction, human review required).
- Receipts and owner settlements (preview/printable, not real documents).
- Payment registration (recorded in mock state, not a real payment
  processor).
- WhatsApp/notifications/integrations (placeholders in Settings only).

## What must not be implemented

- Any production backend, database, or ORM.
- Real authentication or authorization.
- Real multi-tenant isolation.
- Any real external integration (WhatsApp, AI SDK, INDEC, BCRA, Google
  Calendar, Google Maps, ARCA).
- Full accounting/cash management.
- Tenant or owner self-service portals.

Full exclusion list: [Explicitly out of scope](#explicitly-out-of-scope-for-prototype-v1).

## Major demo flows

### Flow A — Commercial inquiry

```text
Contact
→ Opportunity
→ Property selection
→ Visit
→ Negotiation
→ Reservation / Close
```

### Flow B — Owner acquisition

```text
Owner inquiry
→ Valuation
→ Acquisition
→ Property
→ Commercial operation
```

### Flow C — Rental administration

```text
Rental contract
→ Monthly charges
→ Payment
→ Receipt
→ Owner settlement
```

### Flow D — Adjustment and expiration

```text
Contract
→ Upcoming IPC/ICL adjustment
→ Updated amount preview
→ Expiration warning
```

### Flow E — AI contract intake

```text
Upload PDF
→ Simulated analysis
→ Pre-filled fields
→ Human review
→ Confirm
```

## Recommended demo data scenarios

See [architecture.md](architecture.md#mock-data-direction) for where this
data lives. Suggested approximate scale:

```text
2 branches
8 users
120 contacts
45 properties
25 opportunities
100–105 managed rentals
20 visits
15 richly populated example contracts
several months of illustrative activity
```

Important individual scenarios the dataset must include:

- Contract current / with outstanding debt / with credit balance / with a
  partial payment.
- Contract with an upcoming IPC adjustment and one with an upcoming ICL
  adjustment.
- Contract expiring in ~20 days (urgent) and one expiring in ~70 days
  (informational) — see [modules/contracts.md](modules/contracts.md#expiration-alerts).
- Property that is available, reserved, rented, and sold (one of each).
- Purchase opportunity and rental opportunity (demand side).
- Owner selling a property and owner offering a property for rent (supply
  side).

Generating the actual dataset is a separate implementation task — this
document only defines the target, per
[architecture.md](architecture.md#mock-data-direction).

## Client-validation objectives

The demo should let Fernández López confirm or correct:

- Whether the proposed navigation and module grouping matches how they
  think about their work.
- Whether the opportunity pipeline stages and terminology feel natural (see
  [requirements.md open question 4](requirements.md#open-questions)).
- Whether the rental administration overview surfaces the right things at a
  glance.
- Whether the role-based visibility (who sees what) matches how the agency
  actually operates.
- The remaining open questions in
  [requirements.md](requirements.md#open-questions).

## Explicitly out of scope for Prototype v1

- Production backend
- MySQL
- Prisma
- Production authentication
- Secure production authorization
- Real multi-tenant isolation
- Real WhatsApp integration
- Real AI contract extraction
- Live IPC integration
- Live ICL integration
- BCRA integration
- INDEC integration
- Google Calendar integration
- Google Maps dependency
- ARCA electronic invoicing
- Complete accounting
- Full cash-management module
- Bank reconciliation
- Digital signatures
- Tenant portal
- Owner portal
- Automatic property-portal publishing
- Legal deed workflow
- Complex notary/legal processes
