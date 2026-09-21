# Contracts

## Objective

Model a single rental contract in enough detail to support expiration
alerts, adjustments, monthly charges, payments, receipts, and owner
settlements.

## Users

`ADMINISTRATION` primarily; `MANAGER`/`ADMIN` read access.

## Main concepts

A `RentalContract` connects a `Property`, its owner(s), and tenant(s), plus
financial conditions and an adjustment method. See
[data-model.md](../data-model.md#rentalcontract) for the full field list —
not repeated here.

## Main screens

Contract detail (opened from
[rental-management.md](rental-management.md) or a property's "Comercial"/
contract tab): header (property, tenant, owner, status), financial
conditions, adjustment configuration, expiration status, monthly charges
list, payments, receipts, settlements.

## Primary actions

- View/edit contract conditions.
- Register a payment.
- Preview a receipt.
- Preview an owner settlement.
- Start the AI contract upload flow (simulated).

## Main flows

- **Create/review via AI upload** — see [AI-assisted contract upload](#ai-assisted-contract-upload).
- **Monthly cycle** — charges generated → payment registered → receipt
  issued → owner settlement calculated. See
  [data-model.md](../data-model.md#contractcharge) /
  [Payment](../data-model.md#payment) / [Receipt](../data-model.md#receipt) /
  [OwnerSettlement](../data-model.md#ownersettlement).

## Entities and data

`RentalContract`, `ContractCharge`, `Payment`, `Receipt`,
`OwnerSettlement` — full fields in [data-model.md](../data-model.md).

## Business rules

### Adjustment methods

`IPC | ICL | MANUAL | OTHER`, with configurable frequency (quarterly,
four-monthly, semiannual, other/custom). The prototype may **simulate**
adjustment calculations; it must **not** connect to INDEC or BCRA. A future
production integration may retrieve official IPC/ICL data.

### Expiration alerts

Visible from at least 90 days before `endDate`, using severity bands:

| Band | Severity |
|---|---|
| 90–61 days | Informational warning |
| 60–31 days | Warning |
| 30–0 days | Urgent |

Shown in: contract detail, rental administration overview, dashboard
attention section. Colors come from the semantic tokens in
[ui-design-system.md](../ui-design-system.md#semantic-colors) (`info` /
`warning` / `danger`-leaning per band), never hardcoded per screen.

### Monthly rental account

Charge types: `RENT | EXPENSES | ABL | AYSA | ELECTRICITY | GAS | INTEREST |
OTHER`. The UI must clearly distinguish paid / outstanding / partial /
credit balance (`saldo a favor`) using the semantic color mapping in
[ui-design-system.md](../ui-design-system.md#semantic-colors).

### Payments

A payment records date, amount, method, notes, related contract, and
(optionally) applied charges. No accounting/double-entry bookkeeping — see
[rental-management.md](rental-management.md#out-of-scope).

### Receipts

Generated after a payment: agency identity, tenant, property, period, paid
concepts, amounts, total, date. Prototype: mock preview/printable document.
No ARCA integration.

### Owner settlements

Conceptual calculation (fee % and deduction rules pending validation — open
question 2):

```text
Rent collected       $650,000
Administration fee   -$32,500
Repair                -$20,000
--------------------------------
Net to owner          $597,500
```

Supports: preview, deductions, administration fee, final amount, historical
settlements.

### AI-assisted contract upload

Desired future flow:

1. User uploads a contract PDF.
2. AI analyzes it.
3. Relevant fields are extracted (property, owner, tenant, start/end date,
   initial amount, adjustment method/frequency, deposit, guarantee).
4. A pre-filled review form is shown.
5. User validates the extracted information.
6. User explicitly confirms creation.

**AI must never silently create the final contract without human review.**
Low-confidence fields should eventually be highlighted. **In Prototype v1
this flow is simulated only** — no AI SDK or real PDF extraction.

## Statuses and states

Contract `status`: `DRAFT | UPCOMING | ACTIVE | EXPIRED | TERMINATED`
(Borrador / Próximo / Activo / Vencido / Finalizado) — implemented in
Milestone 4, still provisional pending open question 3. Plus the
expiration severity bands above (`normal | within90 | within60 | within30 |
expired`) and the charge statuses (paid/outstanding/partial/credit, not
yet implemented).

## Role / permission considerations

Same as [rental-management.md](rental-management.md#role--permission-considerations).

## Desktop behavior

Full contract detail page with sections for each concern (conditions,
charges, payments, settlements).

## Mobile behavior

Sections become stacked cards/accordions; charge/payment lists become
cards, not tables.

## Prototype behavior

Implemented in Milestone 4 (`src/features/administration/`,
`src/services/rental-contract-service.ts`) for contract conditions,
expiration, adjustment simulation, and the AI upload flow —
`ContractCharge`/`Payment`/`Receipt`/`OwnerSettlement` remain unimplemented
pending Milestone 5. Contract detail tabs actually built: `Resumen`
(dates, rent, adjustment, deposit, guarantee, owners, tenants, property —
all read/write via `ContractFormSheet`), `Cuenta mensual` (intentional
placeholder — see below), `Documentos` (mock document list, `Ver` disabled
with an explanatory tooltip since no real files exist), `Historial`
(derived timeline, same pattern as Property's Historial tab —
`contract-detail-derivations.ts`). `localStorage`-backed edits.

### Cuenta mensual (placeholder)

Deliberately not built in Milestone 4 — shows one sentence explaining that
the monthly account (rent, expenses, services, payments, balances) arrives
in Milestone 5, with no fake controls that look functional. Do not add
charge/payment UI here without first implementing the underlying
`ContractCharge`/`Payment` model.

## Future behavior

Live IPC/ICL data, real AI extraction, real receipt/settlement documents.

## Out of scope

See [prototype-scope.md](../prototype-scope.md#explicitly-out-of-scope-for-prototype-v1):
no ARCA, no INDEC/BCRA live data, no real AI SDK, no digital signatures, no
full accounting.

## Open questions

Expense responsibility (1), owner settlement rules (2), mandatory contract
fields (3).

## Notes for future AI agents

Never implement the "AI contract upload" flow as an automatic
create-without-review action, even in the simulated prototype version — the
human confirmation step is a product requirement, not an implementation
detail to skip for convenience.
