# Consorcios

> **Prototype reference module.** Carlos mentioned Fernández López would
> like to manage consorcios too, but the real scope has **not been
> validated**. This module exists to give the client something concrete to
> react to. It is not a spec. Do not extend it without validated answers to
> the [open questions](#open-questions-for-fernández-lópez).

## Objective

Show how administering consorcios (buildings under propiedad horizontal)
could fit into the same platform as properties, contacts and rentals, and
use the demo to find out which consorcio workflows Fernández López actually
performs.

## Screens

- **`/consorcios`**: a "módulo de referencia" banner, four metrics
  (Consorcios administrados, Unidades, Expensas del período as % collected,
  Pendientes units) and the list. The list is a table on desktop
  (Consorcio, Dirección, Unidades, Período actual, Estado de expensas,
  Pendientes, Reclamos) and cards on mobile. It follows the global branch
  selector.
- **`/consorcios/:consorcioId`** has five tabs:
  - **Resumen**: unit count, current period, responsible user, encargado,
    CUIT, reserve fund, notes, open issues, and a period status card.
  - **Unidades**: owner, occupant, coefficient, the period's expensas and
    status (Pagado / Pendiente / Pago parcial). Owners and occupants are
    existing `Contact` records and link to them. A unit linked to a
    `Property` shows "Ver propiedad".
  - **Expensas**: a read-only period summary (gastos del período, fondo
    de reserva, total a distribuir, cobrado, pendiente) and the amount
    each unit pays.
  - **Gastos y mantenimiento**: common-building expenses (description,
    category, provider, date, amount, Pagado/A pagar) and reclamos
    (Pendiente / En curso / Resuelto).
  - **Documentos y asambleas**: mock document list (no file storage) and
    assembly records (Programada / Finalizada).
- An unknown id shows a "Consorcio no encontrado" state.

## Entities

Defined in `src/types/consorcio.ts`, seeded by `src/mocks/consorcios.ts`
(6 consorcios, 16–42 units each; Monroe 2450, Av. Congreso 2890 and
Olazábal 2200 have the most detail), read through
`src/services/consorcio-service.ts`. See
[data-model.md](../data-model.md#consorcio-prototype-reference).

- `Consorcio` (carries `organizationId`/`branchId`)
- `ConsorcioUnit` (with optional `ownerContactId`/`occupantContactId`/`linkedPropertyId`)
- `ConsorcioExpense`, `ConsorcioIssue`, `ConsorcioDocument`, `ConsorcioAssembly`

The period summary (totals, collected, pending, pending units, open issues)
is always **derived** from units and expenses, never stored. Unit amounts
are split by a simple per-unit weight so they look realistic. They are
**not** a legal coefficient-based liquidation.

## Prototype behavior

Read-only. Data is built relative to today (current period = current
month), is not persisted to localStorage, and has no create/edit flows.

## Explicit scope limitations

Not implemented and not planned until validated: formal accounting,
general ledger, bank reconciliation, salaries/payroll and employer
obligations, tax filings, legal books, debt certificates, judicial
collections, online voting, owner/consorcista portal, bank payments,
supplier payment workflows, automatic expensas generation from legal
coefficients, production billing.

## Open questions for Fernández López

Do not invent answers to these.

- ¿Qué parte de la administración de consorcios realizan actualmente?
- ¿Liquidan expensas?
- ¿Cobran expensas?
- ¿Controlan morosidad?
- ¿Administran proveedores?
- ¿Administran reclamos/mantenimiento?
- ¿Gestionan encargados/personal?
- ¿Gestionan asambleas?
- ¿Qué documentación necesitan guardar?
- ¿Necesitan conectar unidades con alquileres administrados?
