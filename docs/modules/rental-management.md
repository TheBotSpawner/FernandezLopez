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

Suggested internal sections:

```text
Resumen
Contratos
Liquidaciones
Vencimientos
```

- **Resumen** — overview metrics (see below).
- **Contratos** — full contract list, links to
  [contract detail](contracts.md).
- **Liquidaciones** — owner settlements list/history, see
  [data-model.md](../data-model.md#ownersettlement).
- **Vencimientos** — expiring contracts, see
  [Expiration alerts](contracts.md#expiration-alerts).

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

`RentalContract`, `ContractCharge`, `Payment`, `Receipt`, `OwnerSettlement`
— see [data-model.md](../data-model.md).

## Business rules

### Overview metrics

- Active contracts.
- Contracts with outstanding debt.
- Upcoming rent adjustments.
- Contracts expiring within 90 days.

### Overview list fields

Property, tenant, current rent, next adjustment, contract expiration,
status.

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

Simulated adjustment math (IPC/ICL/manual), mock payments, and
localStorage-backed state changes — see
[architecture.md](../architecture.md#localstorage-persistence).

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
