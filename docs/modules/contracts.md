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

Contract detail (opened from [rental-management.md](rental-management.md)
or a property's Resumen tab): header (property, tenant, owner, status),
financial conditions, adjustment configuration, expiration status, and six
tabs — `Resumen`, `Conceptos` (applicable obligations), `Cuenta mensual`
(charges for the selected period), `Movimientos` (derived history),
`Documentos`, `Historial`.

## Primary actions

- View/edit contract conditions.
- Toggle which recurring concepts apply and who is responsible for each
  (`Conceptos` tab).
- Add/edit a monthly charge.
- Register a payment (with per-charge allocation).
- View/print a receipt.
- Create an owner settlement.
- Start the AI contract upload flow (simulated).

## Main flows

- **Create/review via AI upload** — see [AI-assisted contract upload](#ai-assisted-contract-upload).
- **Monthly cycle** — charges generated → payment registered → receipt
  issued → owner settlement calculated. See
  [data-model.md](../data-model.md#contractcharge) /
  [Payment](../data-model.md#payment) / [Receipt](../data-model.md#receipt) /
  [OwnerSettlement](../data-model.md#ownersettlement).

## Entities and data

`RentalContract`, `ContractObligation`, `ContractCharge`, `Payment`,
`ContractMovement`, `Receipt`, `OwnerSettlement` — full fields in
[data-model.md](../data-model.md).

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

### Contract obligations

Implemented in Milestone 5 — see
[data-model.md](../data-model.md#contractobligation). Which of the seven
recurring concepts apply to a contract, who is responsible for each
(`Inquilino | Propietario | Según contrato`), and — for `ELECTRICITY`/
`GAS` — which provider (`Edenor`/`Edesur`, fixed `Metrogas`). Configured
per contract, not assumed from a global rule; editable inline in the
`Conceptos` tab (toggle + selects, auto-saved).

### Monthly rental account

Implemented in Milestone 5 (`ContractAccountTab`,
`contract-charge-service.ts`). Charge types: `RENT | EXPENSES | ABL | AYSA |
ELECTRICITY | GAS | INTEREST | OTHER`. Only concepts `enabled` on the
contract's obligations generate recurring monthly charges — a disabled
concept never produces a charge row. The UI clearly distinguishes
paid / pending / partial / **vencido** using the semantic color mapping in
[ui-design-system.md](../ui-design-system.md#semantic-colors); `vencido`
(overdue) is computed from `dueDate` at display time
(`effectiveChargeStatus()`), not a stored charge state. Period navigation
(prev/next), a summary (total/paid/pending/saldo anterior/saldo a favor/
saldo actual — zero rows hidden), and "Agregar concepto"/"Editar concepto"
for manual charges.

### Payments

Implemented in Milestone 5 (`payment-service.ts`, `PaymentFormSheet`). A
payment records date, amount, method, notes, and allocations to specific
charges — a single payment may cover multiple concepts. Any amount not
explicitly allocated becomes **saldo a favor** (credit); applying existing
credit to a later charge is modeled as a zero-cash payment, so the credit
balance is always just the sum of unallocated amounts across the payment
history (no separately-maintained balance field). No accounting/
double-entry bookkeeping — see [rental-management.md](rental-management.md#out-of-scope).

### Movements

Implemented in Milestone 5 (`Movimientos` tab,
`movement-derivations.ts`). A chronological, filterable (Todos/Cargos/
Pagos/Ajustes/Recibos) operational history — charge generated, payment
received, payment applied per concept, credit applied, receipt issued,
settlement generated. Always **derived** from `ContractCharge`/`Payment`/
`Receipt`/`OwnerSettlement` at read time, not a separately stored ledger —
see [data-model.md](../data-model.md#contractmovement). This is
explicitly **not** a double-entry accounting journal.

### Receipts

Implemented in Milestone 5 (`receipt-service.ts`, `ReceiptPage`).
Auto-generated whenever a real (non-zero-cash) payment is registered —
agency identity, receipt number, date, property, tenant, contract
reference, period, paid concepts, amounts, total, payment method.
Print-friendly page (`window.print()`), no ARCA integration, no PDF
library dependency.

### Owner settlements

Implemented in Milestone 5 (`owner-settlement-service.ts`,
`SettlementsPage`/`SettlementDetailPage`/`SettlementFormSheet`) — a
separate document from the tenant `Receipt`. Conceptual calculation (fee %
or fixed amount, and deduction rules, pending validation — open question
2; the UI labels its 5%-default as "provisoria para el prototipo"):

```text
Rent collected       $650,000
Administration fee   -$32,500
Repair                -$20,000
--------------------------------
Net to owner          $597,500
```

Supports: list with period/status filters, detail preview with Fernández
López branding, ad-hoc deduction line items, administration fee as
percentage or fixed amount, status (`Borrador | Lista | Pagada`).

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
Milestone 4, still provisional pending open question 3. Expiration
severity bands (`normal | within90 | within60 | within30 | expired`).
Charge status (`PENDING | PARTIAL | PAID`, stored, plus the derived
`OVERDUE` display band) and settlement status (`DRAFT | READY | PAID`)
implemented in Milestone 5.

## Role / permission considerations

Same as [rental-management.md](rental-management.md#role--permission-considerations).

## Desktop behavior

Full contract detail page with sections for each concern (conditions,
charges, payments, settlements).

## Mobile behavior

Sections become stacked cards/accordions; charge/payment lists become
cards, not tables.

## Prototype behavior

Milestone 4 implemented contract conditions, expiration, adjustment
simulation, and the AI upload flow. Milestone 5 implemented everything
financial: `ContractObligation` (embedded, editable), `ContractCharge`
(monthly, generated from enabled obligations), `Payment` (with
allocations and credit balance), `ContractMovement` (derived), `Receipt`
(auto-issued per payment), `OwnerSettlement` (list/detail/create).
Contract detail tabs: `Resumen` (dates, rent, adjustment, deposit,
guarantee, owners, tenants, property), `Conceptos`, `Cuenta mensual`,
`Movimientos`, `Documentos` (mock document list, `Ver` disabled with an
explanatory tooltip since no real files exist), `Historial` (derived
timeline, `contract-detail-derivations.ts` — unrelated to the financial
`Movimientos` tab, which covers charges/payments/receipts/settlements
specifically). `localStorage`-backed throughout.

Mock dataset seeds ~5 months (May–Sep 2026) of charge/payment history for
every contract active during that window, plus the curated account
scenarios (fully paid, ABL unpaid, electricity unpaid, multiple
outstanding concepts, partial payment, previous-month debt, credit
balance, interest/penalty) required by the milestone spec, reusing the
Milestone 4 contract scenario letters — see
[prototype-scope.md](../prototype-scope.md#recommended-demo-data-scenarios).
Bulk (non-curated) contracts get a per-contract "account profile"
(current/minor gap/debtor, weighted 75/15/10) rather than an independent
per-charge coin-flip, so debt doesn't compound artificially across a
contract's several enabled concepts.

## Future behavior

Live IPC/ICL data, real AI extraction, real payment gateway integration,
real electronic receipts (ARCA).

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
