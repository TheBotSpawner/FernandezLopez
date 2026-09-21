# Data Model

Conceptual domain model for Prototype v1. This is **not** a database schema
or a Prisma model — see [architecture.md](architecture.md#future-backend-architecture-not-implemented)
for why. Fields listed are the prototype's minimum; several are explicitly
flagged as pending validation with Fernández López (see
[requirements.md](requirements.md#open-questions)).

## Entity list

`Organization`, `Branch`, `User`, `Contact`, `Property`, `Opportunity`,
`Visit`, `RentalContract`, `ContractCharge`, `Payment`, `Receipt`,
`OwnerSettlement`, `Activity`.

## High-level relationships

```mermaid
erDiagram
    ORGANIZATION ||--o{ BRANCH : has
    ORGANIZATION ||--o{ CONTACT : owns
    ORGANIZATION ||--o{ PROPERTY : owns
    ORGANIZATION ||--o{ OPPORTUNITY : owns
    ORGANIZATION ||--o{ RENTALCONTRACT : owns
    BRANCH ||--o{ USER : employs
```

Commercial flow:

```text
Contact
   │
   ▼
Opportunity
   │
   ├── Property
   │
   ▼
Visit
```

Rental flow:

```text
Property
    │
    ├── Owner Contact(s)
    ├── Tenant Contact(s)
    │
    ▼
RentalContract
    │
    ├── ContractCharge
    ├── Payment
    ├── Receipt
    └── OwnerSettlement
```

---

## Organization

**Purpose** — top-level tenant boundary for the future SaaS product.
Fernández López is the only organization today.

**Key fields** — `id`, `name`.

**Relationships** — has many `Branch`, `User`, `Contact`, `Property`,
`Opportunity`, `RentalContract` (all business entities carry
`organizationId`).

**Prototype assumptions** — a single mock "current organization" is enough;
no organization-switching UI is required.

**Future concerns** — real tenant isolation, billing, org-level settings.
See [architecture.md](architecture.md#multi-tenant-and-organization-awareness).

## Branch

**Purpose** — a physical/operational office (`sede`) within an
organization.

**Key fields** — `id`, `organizationId`, `name`, `address`.

**Relationships** — belongs to `Organization`; has many `User`; business
entities may carry `branchId`.

**Prototype assumptions** — Fernández López has multiple branches; a branch
selector may filter dashboards/lists.

**Open question** — see
[requirements.md](requirements.md#open-questions) item 5 (which records are
branch-scoped vs. org-wide, whether agents cross branches).

## User

**Purpose** — a person who logs into the system (staff, not a client
contact).

**Key fields** — `id`, `organizationId`, `branchId`, `name`, `email`,
`role`.

**Important enum — `role`**: `ADMIN | MANAGER | ADMINISTRATION | AGENT`. See
[product-overview.md](product-overview.md) for responsibilities per role.

**Relationships** — belongs to `Organization` and `Branch`; assigned to
`Opportunity`, `Visit`, `RentalContract` (as the responsible agent/user).

**Prototype assumptions** — no real authentication; a mock "current user"
drives role-aware UI.

**Future concerns** — real auth, session management, permission matrix
validation (open question 6).

## Contact

**Purpose** — a single record for any person the agency interacts with.
**Never** create separate records per role.

**Key fields** (`src/types/contact.ts`) — `id`, `organizationId`,
`branchId`, `fullName`, `phone`, `email`, `assignedUserId`, `roles`,
`notes?`, `source?`, `lastActivityAt`, `createdAt`, `updatedAt`. A separate
`ContactNote { id, contactId, authorUserId, text, createdAt }` list holds
free-text notes (Milestone 3 — `contact-service.ts`).

**Important enum — `roles`** (a contact may hold several at once):
`prospect | tenant | buyer | owner | seller`, shown in the UI as
`Interesado | Inquilino | Comprador | Propietario | Vendedor`.

**Relationships** — has many `Opportunity` (`contactId`), `Visit`
(`contactId`); referenced by `RentalContract` as `tenantIds`/`ownerIds`
(not implemented yet); referenced by `Property` as `ownerIds` — **not**
directly (`Property.ownerIds` still points at the separate
`src/mocks/property-owners.ts` pool from Milestone 2). Milestone 3 closes
that gap for the *demo data* by generating one `Contact` (role `owner`) per
`PropertyOwner` with a matching phone number, so `PropertyOwnerCard` can
look the contact up (`findContactByPhone`) and link to it; the two ID
spaces remain formally separate until Property is remodeled to reference
`Contact` directly (see [architecture.md](architecture.md#known-gaps)).

**Prototype assumptions** — see
[modules/contacts.md](modules/contacts.md). Mock dataset: 100 contacts
plus 15 owner contacts (`src/mocks/contacts.ts`), edits persisted via
`localStorage` (`src/lib/local-store.ts`).

## Property

**Purpose** — a real estate unit the agency manages, sells, or rents.

**Key fields**:

```text
id, organizationId, branchId, referenceCode, address, floor, neighborhood,
city, latitude, longitude, propertyType, operationTypes, status,
salePrice, rentalPrice, rooms, bedrooms, bathrooms, surface,
coveredSurface, parkingSpaces, featured, description, images, ownerIds,
interest, createdAt, updatedAt
```

Implemented in Milestone 2 (`src/types/property.ts`), with a few prototype
additions beyond the original sketch: `referenceCode` (internal listing
code, e.g. `FL-1001`), `floor` (unit/floor, e.g. `4°A`), `coveredSurface`,
`parkingSpaces`, `featured`, and `interest` (`{ inquiries,
activeOpportunities, visitsThisMonth, lastInquiryAt?, assignedAgentName? }`
— powers the dashboard's high-interest widget, the Properties "Mayor
interés" sort, and the detail page's Comercial tab).

**Currency convention** — no separate `currency` field. `salePrice` is
always USD and `rentalPrice` is always ARS, matching real Argentine
real-estate practice; a property with both `operationTypes` carries both
prices independently.

**Important enums**:

- `propertyType`: apartment, house, PH, commercial property, office,
  parking, land, other (Spanish labels in UI).
- `operationTypes`: for sale, for rent (a property may be both).
- `status`: available, reserved, rented, sold, paused, under valuation.

**Relationships** — belongs to `Organization`/`Branch`; `ownerIds`
references a small fictional owner pool (`src/mocks/property-owners.ts`,
each entry now mirrored by a `Contact` — see [Contact](#contact) below);
has many `Opportunity` (via `Opportunity.linkedPropertyIds`,
`getOpportunitiesByProperty()`) and `Visit` (via `Visit.propertyId`,
`getVisitsByProperty()`) as of Milestone 3 — the property detail page's
Comercial/Visitas tabs read these instead of the static `interest` field;
`interest` itself is unchanged (still powers the Properties "Mayor
interés" sort and the property card badge, a Milestone 2 simplification
not revisited in Milestone 3); may have one active `RentalContract`.

**Prototype assumptions** — one dataset powers list/card/map views and the
dashboard's property widgets (see
[modules/properties.md](modules/properties.md)); not modeled to the depth of
a public property portal. Property-detail history and document lists are
**derived** from the property's own fields at render time
(`property-detail-derivations.ts`), not separately stored records.

## Opportunity

**Purpose** — a specific commercial intention tied to a `Contact`. A
`Contact` is a person; an `Opportunity` is what that person currently wants
(e.g. "Juan busca un departamento de 3 ambientes en Coghlan").

**Key fields** (`src/types/opportunity.ts`):

```text
id, organizationId, branchId, contactId, assignedUserId, type, stage,
budgetMin?, budgetMax?, currency?, preferredNeighborhoods?, propertyTypes?,
rooms?, ownerPropertyAddress?, linkedPropertyIds, notes?, lostReason?,
nextActionAt?, nextActionLabel?, lastActivityAt, createdAt, updatedAt
```

**Important enums**:

- `type`: `RENT_SEARCH | BUY_SEARCH | OWNER_RENT | OWNER_SELL` (demand-side
  vs. owner-side, `isOwnerOpportunity()`).
- `stage` (demand-side pipeline, `DEMAND_STAGES`): `Nueva → Contactado →
  Propiedades seleccionadas → Visita → Negociación → Reserva → Cerrada`, or
  `Perdida` (with a `lostReason`). **Provisional — open question 4.**
- `stage` (owner-side pipeline, `OWNER_STAGES`): `Nueva → Contactado →
  Tasación → Captación → Publicada → Cerrada`, or `Perdida`.
- `lostReason`: `No responde | No encontró propiedad | Presupuesto
  insuficiente | Eligió otra inmobiliaria | Postergó decisión | Otro`.

**Relationships** — belongs to `Contact`; `linkedPropertyIds` links zero or
more `Property` records (matched to compatible properties via
`getCompatibleProperties()`, budget/neighborhood/type/rooms heuristics);
has many `Visit` (`opportunityId`, optional — a visit can exist without an
opportunity).

**Stage-change history** is the one piece of `Opportunity` activity that
isn't derivable from the record itself (the previous stage is overwritten),
so it's the only event persisted through `activity-service.ts`; everything
else on the Actividad tab is derived at render time from timestamps. See
[modules/opportunities.md](modules/opportunities.md).

## Visit

**Purpose** — a scheduled or completed property visit.

**Key fields** (`src/types/visit.ts`) — `id`, `organizationId`,
`branchId`, `contactId`, `opportunityId?`, `propertyId`, `assignedUserId`,
`startAt`, `endAt`, `status`, `notes?`, `outcome?`, `createdAt`,
`updatedAt`.

**Important enums**:

- `status`: `Programada | Confirmada | Realizada | Cancelada |
  Reprogramada` (shared `VisitStatus`, `src/types/dashboard.ts`).
- `outcome` (set on completion via `completeVisit()`): `Interesado |
  Quiere reservar | No interesado | Reprogramar`.

**Relationships** — belongs to `Contact`, `Property`, and optionally
`Opportunity`; assigned to a `User`. Completing a visit
(`VisitDetailSheet` → `completeVisit()`) records the outcome on the `Visit`
itself, and — when the visit is linked to an `Opportunity` — feeds back
into that opportunity's `stage`: `Interesado → Negociación`, `Quiere
reservar → Reserva` (`VISIT_OUTCOME_STAGE_MAP`,
`features/visits/visit-labels.ts`). `No interesado`/`Reprogramar` are left
for the agent to act on manually, and the map only applies when the target
stage is valid for the opportunity's type, so owner-side opportunities are
unaffected. `hasConflict()` gives a soft double-booking warning per
agent/timeslot, not a hard scheduling constraint.

## RentalContract

**Purpose** — the legal/financial agreement connecting a property, its
owner(s), and tenant(s).

**Key fields** (`src/types/rental-contract.ts`, implemented in Milestone 4):

```text
id, organizationId, branchId, contractNumber, propertyId, tenantIds,
ownerIds, startDate, endDate, initialRent, currentRent, currency,
adjustmentMethod, adjustmentFrequency, lastAdjustmentDate?,
nextAdjustmentDate?, deposit?, guaranteeType?, status, documentUrl?,
notes?, createdAt, updatedAt
```

`startDate`/`endDate`/`lastAdjustmentDate`/`nextAdjustmentDate` are plain
`YYYY-MM-DD` calendar dates (matching `<input type="date">`), not full ISO
timestamps — every read of them goes through
`features/administration/expiration-utils.ts`'s `daysUntil()`, which parses
Y/M/D components directly rather than `new Date(dateOnly)` (which treats a
date-only string as UTC midnight and can shift the result by a day
depending on the browser's timezone offset — the same class of bug fixed in
the dashboard's contact-trend chart in Milestone 1).

**Important enums**:

- `status`: `DRAFT | UPCOMING | ACTIVE | EXPIRED | TERMINATED` (Borrador /
  Próximo / Activo / Vencido / Finalizado). Stored directly on the record
  (like `Opportunity.stage`), not derived live from dates — mock data is
  seeded consistent with the demo's fixed "today" (2026-09-21).
- `adjustmentMethod`: `IPC | ICL | MANUAL | OTHER`.
- `adjustmentFrequency`: `QUARTERLY | FOUR_MONTHLY | SEMIANNUAL | ANNUAL |
  CUSTOM` (Trimestral / Cuatrimestral / Semestral / Anual / Personalizada).
  `ADJUSTMENT_FREQUENCY_MONTHS` maps each to a cadence in months (`null`
  for `CUSTOM`, which has no fixed cadence).
- `guaranteeType`: `OWNER_GUARANTEE | INSURANCE | PAYSLIP | GUARANTOR |
  OTHER` (Garantía propietaria / Seguro de caución / Recibo de sueldo /
  Fiador / Otra).

**This is the initial prototype model, not a final legal schema** —
additional mandatory fields are open question 3.

**Relationships** — belongs to `Property`; references `Contact` via
`tenantIds`/`ownerIds`; will have many `ContractCharge`, `Payment`,
`Receipt`, `OwnerSettlement` once Milestone 5 implements them.

**Expiration severity** (`expirationSeverity()`,
`features/administration/expiration-utils.ts` — the single source of truth,
reused by contract detail, the contracts list, the Vencimientos view, and
the dashboard attention panel):

| Band | Severity |
|---|---|
| 90–61 days | `within90` (informational) |
| 60–31 days | `within60` (warning) |
| 30–0 days | `within30` (urgent) |
| past `endDate` | `expired` (critical) |

**Simulated adjustment preview** (`simulateNextRent()`,
`features/administration/adjustment-utils.ts`) — a deterministic, clearly-
labeled demo variation per method (`IPC` +9.9%, `ICL` +7.4%; `MANUAL`/
`OTHER` have no automatic estimate), never a real INDEC/BCRA/ICL lookup.

**Prototype dataset** — 105 mock contracts (`src/mocks/rental-contracts.ts`
— curated scenarios A–J from the milestone spec, generated primary
contracts, and renewal-history contracts), `localStorage`-backed. Only 24
of the original 45 Milestone 2 properties have `operationTypes` including
`rent`, not enough to back ~100 realistic contracts without excessive
same-property renewal stacking — Milestone 4 additively extended
`mocks/properties.ts` with 50 more rent-eligible generated properties
(`prop-rental-N`) for this purpose; see
[modules/properties.md](modules/properties.md#prototype-behavior).

**AI contract intake** (`AIContractIntakeSheet` +
`ContractFormSheet reviewMode`) — simulated only: a deterministic mock
"extraction" (picks a vacant rent-eligible property and a tenant contact,
no real OCR/AI SDK) pre-fills the same creation form used for manual
contracts, with two fields marked "Confianza media" and an explicit
"Revisá los datos antes de confirmar" banner. The contract is only created
when the user submits the reviewed form — there is no auto-create path.

## ContractCharge

**Purpose** — one monthly line item owed under a contract.

**Key fields** — `id`, `contractId`, `period`, `type`, `description`,
`amount`, `status`, `dueDate`.

**Important enums**:

- `type`: `RENT | EXPENSES | ABL | AYSA | ELECTRICITY | GAS | INTEREST |
  OTHER`.
- `status`: paid, outstanding, partial, credit balance (`saldo a favor`).

**Open question** — expense responsibility rules per concept (open question
1).

## Payment

**Purpose** — a recorded payment from a tenant, optionally applied to one or
more `ContractCharge` records.

**Key fields** — `id`, `contractId`, `date`, `amount`, `method`, `notes`.

**Explicitly not modeled**: cash registers, daily close, bank
reconciliation, general ledger — see
[architecture.md](architecture.md) and
[prototype-scope.md](prototype-scope.md#explicitly-out-of-scope-for-prototype-v1).

## Receipt

**Purpose** — a document issued to the tenant after a payment is recorded.

**Conceptual fields** — agency identity, tenant, property, period, paid
concepts, amounts, total, date.

**Prototype behavior** — mock preview/printable document; no ARCA
(electronic invoicing) integration.

## OwnerSettlement

**Purpose** — the periodic calculation of what the agency owes the property
owner after collecting rent and deducting its fee and any repairs.

**Conceptual calculation**:

```text
Rent collected       $650,000
Administration fee   -$32,500
Repair                -$20,000
--------------------------------
Net to owner          $597,500
```

**Open question** — exact fee rules (open question 2).

## Activity

**Purpose** — a generic activity/history log entry (note added, stage
changed, visit completed, payment registered, etc.) attached to a `Contact`,
`Opportunity`, `Property`, or `RentalContract`, powering "Historial"/
"Actividad" tabs.

**Key fields** (`src/types/activity.ts`, Milestone 3) — `id`, `entityType`
(`contact | opportunity`), `entityId`, `label`, `date`.

**Prototype implementation** — mostly **derived**, not stored: Contact and
Opportunity timeline tabs are built at render time
(`contact-activity.ts`/`opportunity-activity.ts`) from the entity's own
`createdAt`/`updatedAt`/notes/visits/linked-properties. The one exception
is `Opportunity` stage changes, whose previous value would otherwise be
lost — those are persisted through `activity-service.ts`
(`recordActivity`/`getRecordedActivity`, `localStorage`-backed) and merged
into the derived timeline. Property's "Historial" tab (Milestone 2) is
fully derived and untouched by this.
