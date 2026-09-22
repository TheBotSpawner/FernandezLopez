# Reports (Reportes)

## Objective

Provide basic operational reporting for both the commercial and rental
administration sides — **not** a BI platform.

## Users

`ADMIN`/`MANAGER` get all three report groups. `ADMINISTRATION` gets only
the rental administration report. `AGENT` gets commercial and property
reports, scoped to their own activity — no branch selector, no "Responsable"
filter (they can't view anyone else's numbers), and no access to the
administration report (financial data). See
[Role / permission considerations](#role--permission-considerations).

## Main concepts

Reports are read-only aggregations over existing entities (no new entity
types, no separate report-only mock dataset). Three report groups:
commercial, property, and rental administration.

## Main screens

A single `/reports` page (`ReportsPage`) with a filter bar and three tabs —
`Comercial`, `Propiedades`, `Administración` — rendered only for the tabs
the signed-in role can see.

## Primary actions

- Switch report tab.
- Filter by period, branch (`ADMIN`/`MANAGER` only), and responsible agent
  (Comercial tab, non-`AGENT` roles only).

## Main flows

User opens `Reportes` → picks a tab → adjusts period/branch/responsable →
reviews metric cards and charts.

## Entities and data

Reads from `Contact`, `Opportunity`, `Visit`, `Property`, `RentalContract`,
`ContractCharge` via `services/` — see
[architecture.md](../architecture.md#data-flow). Aggregation lives in
`report-service.ts` (`getCommercialReport`/`getPropertyReport`/
`getAdministrationReport`), which composes existing leaf services rather
than reading mocks directly — see
[architecture.md](../architecture.md#service-dependency-graph-milestone-3-extended-in-milestones-4-6).

## Business rules

### Global filters

`Período` (Este mes / Mes anterior / Últimos 3 meses / Últimos 6 meses /
Este año — resolved to a month range in `report-service.ts`'s
`periodRange()`), `Sede` (reuses the same `useSession().branchScope` the
rest of the app uses — shown only to `ADMIN`/`MANAGER`, matching the
existing `TopBar` branch-selector gating), `Responsable` (Comercial tab
only, hidden for `AGENT`).

### Commercial report

Metric cards: Contactos nuevos, Oportunidades creadas, Visitas realizadas,
Operaciones concretadas, Seguimientos pendientes (opportunities open with an
overdue `nextActionAt` — the same definition `opportunity-service.ts`'s
`overdueOnly` query flag already uses). Charts: contactos nuevos por
período, oportunidades por estado (creadas en el período), visitas
realizadas por período. Conversion metric: operaciones cerradas /
oportunidades creadas, shown only when there's at least one opportunity
created in the period.

### Property report

Metric cards: Propiedades activas (`status !== 'sold'`), Propiedades
ingresadas (`createdAt` in period), En alquiler, En venta (`forRent`/
`forSale` from the existing `getPortfolioSummary()`). Charts: propiedades
por estado (bar), propiedades por barrio (horizontal bar, top 8). "Propiedades
con más actividad" reuses the dashboard's "opportunities + visits linked"
ranking logic (duplicated, not imported — see
[architecture.md](../architecture.md#dependency-boundaries) on why
`report-service.ts` doesn't depend on `dashboard-service.ts`), shown as an
explainable "N oportunidades · M visitas" label, never an opaque score.

### Rental administration report

Metric cards: Contratos activos, Contratos con deuda, Próximos ajustes
(≤30 días), Vencen en 90 días, plus Monto pendiente for roles that can see
rental financials (`ADMINISTRATION`/`MANAGER`/`ADMIN` — reuses
`getOverdueAmount()`, the same function backing the Administración
overview's "Con deuda" metric, so the numbers always agree). Charts:
contratos por estado, próximos vencimientos (0–30/31–60/61–90 días, active
contracts only), próximos ajustes por método (IPC/ICL/Manual/Otro, active
contracts with a `nextAdjustmentDate` set).

## Statuses and states

Reuses statuses/stages defined in the source entities' module docs (no
report-specific status vocabulary).

## Role / permission considerations

Implemented in Milestone 6 via a small centralized `can(role, capability)`
lookup (`src/lib/permissions.ts`) rather than scattered role conditionals —
see [architecture.md](../architecture.md#permission-architecture-direction).
`AGENT` never sees the Administración tab and is always scoped to their own
`assignedUserId` regardless of any filter state (the "Responsable" filter
doesn't even render for them). This keeps organization-wide rental
financial totals out of the agent-facing report, matching the same
boundary already enforced on the dashboard.

## Desktop behavior

Metric-card grid + 2-column chart grid, filter bar inline.

## Mobile behavior

Single-column metric cards and stacked charts; filters remain compact
`Select` dropdowns rather than a separate sheet (there are only 2–3 filters,
not enough to warrant one) — see
[ui-design-system.md](../ui-design-system.md#responsive-behavior).

## Prototype behavior

Computed on the fly from live mock/`localStorage` data on every tab/filter
change — no persisted report configuration, no separate report dataset.
Each report hook (`use-report-data.ts`) only fetches its tab's report when
that tab is active, so switching tabs doesn't pay for all three
aggregations up front.

## Future behavior

Export (CSV/PDF), scheduled reports, and deeper analytics are potential
future requirements, not part of Prototype v1.

## Out of scope

A full BI/analytics platform; custom report builder; data warehouse.

## Open questions

Role permissions (6) — the capability table in `lib/permissions.ts` is a
prototype-level proposal, not validated policy; branch operation (5).

## Notes for future AI agents

If a request starts to look like "let the user build their own report,"
that's BI-platform territory and out of scope — redirect to the fixed
report list above unless the user explicitly expands scope. Add new report
metrics through `report-service.ts` (composing existing services), never by
introducing a parallel report-only mock dataset.
