# Rental Administration (Administración)

## Objective

Let administration staff quickly understand and act on ~100 managed rental
contracts — the agency's highest-priority operational area. See
[product-overview.md](../product-overview.md#problem).

## Users

Primarily `ADMINISTRATION`; read access for `MANAGER`/`ADMIN`; not a primary
area for `AGENT`.

## Main concepts

This module is the **overview and operations layer** on top of the entities
detailed in [modules/contracts.md](contracts.md). It does not duplicate
contract/charge/payment modeling — see that document for entity-level
detail.

## Main screens

Internal sections (`AdministrationLayout`, routes under `/administration`):

```text
Resumen        /administration
Contratos      /administration/contracts, /administration/contracts/:id
Liquidaciones  /administration/settlements
Vencimientos   /administration/expirations
```

- **Resumen** — overview metrics + "Requieren atención" + "Próximos
  vencimientos"/"Próximos ajustes" previews (see below). Implemented in
  Milestone 4.
- **Contratos** — full contract list/filters, links to
  [contract detail](contracts.md). Implemented in Milestone 4, including
  "Nuevo contrato" (manual) and "Cargar contrato" (simulated AI intake).
- **Liquidaciones** — list with period/status filters, detail preview,
  "Nueva liquidación". Implemented in Milestone 5, see
  [data-model.md](../data-model.md#ownersettlement).
- **Vencimientos** — expiring contracts grouped into 30/60/90-day windows
  plus vencidos, see [Expiration alerts](contracts.md#expiration-alerts).
  Implemented in Milestone 4.

## Primary actions

- Open a contract from the overview list.
- Filter by status/debt/expiration window.
- Open a settlement preview for a contract.

## Main flows

See [prototype-scope.md Flow C](../prototype-scope.md#flow-c--rental-administration)
(contract → monthly charges → payment → receipt → owner settlement) and
[Flow D](../prototype-scope.md#flow-d--adjustment-and-expiration)
(adjustment + expiration).

## Entities and data

`RentalContract`, `ContractObligation`, `ContractCharge`, `Payment`,
`ContractMovement`, `Receipt`, `OwnerSettlement` — see
[data-model.md](../data-model.md).

## Business rules

### Overview metrics

All four derive from real data as of Milestone 5 (`use-administration-overview.ts`):

- **Contratos activos** — real count of `RentalContract` records with
  `status === 'ACTIVE'`, branch-scoped.
- **Próximos ajustes** — real count of active contracts with
  `nextAdjustmentDate` within 30 days.
- **Vencen en 90 días** — real count of active contracts inside any
  expiration severity band.
- **Con deuda** — real count of active contracts with at least one
  overdue `ContractCharge` (`getDebtorContractIds()`,
  `contract-charge-service.ts`) — replaced the Milestone 4 seeded
  placeholder now that `ContractCharge`/`Payment` exist.

### Overview list fields

Property, tenant, current rent, next adjustment, contract expiration,
status — implemented in `ContractListView` (desktop table / mobile cards),
reused by the Contratos page.

## Statuses and states

Contract status vocabulary and expiration severity bands are defined once in
[modules/contracts.md](contracts.md#expiration-alerts) and reused here, not
redefined.

## Role / permission considerations

`ADMINISTRATION` is the primary role; `MANAGER`/`ADMIN` get read access
(and broader, potentially cross-branch, visibility per open question 5).
`AGENT` does not get a rental-administration nav entry by default.

## Desktop behavior

Table-based overview with filters and sortable columns.

## Mobile behavior

Card-based list (see the example rental card in
[ui-design-system.md](../ui-design-system.md#desktop--tablet--mobile-behavior)),
not a compressed table.

## Prototype behavior

Milestone 4 implemented simulated adjustment math (IPC/ICL/manual;
`features/administration/adjustment-utils.ts`), the AI contract intake
simulation, and `localStorage`-backed state changes — see
[architecture.md](../architecture.md#localstorage-persistence). Milestone 5
added the full financial layer: contract obligations, monthly charges,
payments with allocations and credit balance, derived movements, receipts,
and owner settlements — see [contracts.md](contracts.md#prototype-behavior).
Administration fee/honorarium rules and per-concept expense responsibility
remain open questions (1, 2) — the prototype supports configuring them, it
does not assert a validated business rule.

## Future behavior

Real backend-calculated balances; live IPC/ICL data sources (still not
ARCA/AFIP integration by default — out of scope beyond this prototype's
timeframe too, unless explicitly requested later).

## Out of scope

This module is explicitly **not** a full cash-management/accounting system:
no cash registers, daily close, bank reconciliation, multi-cashbox, general
ledger, or treasury management. It may know operational balances per
contract without becoming accounting software.

## Open questions

Expense responsibility (open question 1), owner settlement rules (open
question 2), mandatory contract fields (open question 3), branch operation
(open question 5).

## Notes for future AI agents

Resist the urge to build accounting features "since they're related" —
balances here are operational summaries per contract, not a ledger. If a
request implies double-entry bookkeeping, flag it against
[prototype-scope.md](../prototype-scope.md#explicitly-out-of-scope-for-prototype-v1)
before building it.
