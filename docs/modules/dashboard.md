# Dashboard

## Objective

Answer, at a glance: *what is happening, and what requires my attention?*
Operational usefulness over decorative metrics — see
[product-overview.md](../product-overview.md#product-principles) principle
2.

## Users

All roles land here after sign-in; content scope varies by role — see
[Role / permission considerations](#role--permission-considerations).

## Main concepts

- **Metric cards** — small operational counts, not financial totals.
- **Attention panel** — actionable items needing follow-up.
- **Upcoming visits** — compact agenda preview.
- **Portfolio overview** — property status summary.

## Main screens

Single dashboard screen (`Inicio`) composed of the widgets below; no
sub-navigation.

## Primary actions

- Jump to a flagged item (contact, opportunity, contract, visit) from the
  attention panel or visit list.
- Switch branch (Manager/Admin) to filter the view.

## Main flows

User opens `Inicio` → scans metric cards → checks the attention panel for
anything overdue → checks upcoming visits → optionally drills into a flagged
item.

## Entities and data

Reads (via `services/`, never directly from mocks — see
[architecture.md](../architecture.md#data-flow)) from `Contact`,
`Property`, `Opportunity`, `Visit`, `RentalContract`. See
[data-model.md](../data-model.md).

## Business rules

### Primary metric cards

- **Contactos nuevos**
- **Propiedades ingresadas**
- **Alquileres administrados**
- **Operaciones concretadas**

Documented here for meaning, not hardcoded values — see
[prototype-scope.md](../prototype-scope.md) for demo data direction.

### Commercial activity chart

"Nuevos contactos — últimos 6 meses", plus a summary of active opportunity
distribution across pipeline stages (see
[modules/opportunities.md](opportunities.md) — stages are provisional).

### Requires attention

Surfaces:

- Contacts waiting for a response.
- Opportunities with no recent activity.
- Reservations close to expiration.
- Contracts expiring within 90 days.
- Upcoming rental adjustments.

### Upcoming visits

Compact agenda of today's/upcoming visits — see
[modules/visits.md](visits.md).

### Portfolio overview

Simple summary: rentals, for-sale, reserved, under valuation. Also
surfaces a "Propiedades con más actividad" widget (renamed from
"Propiedades con más interés" in Milestone 3): the properties with the
most combined linked opportunities + visits, each showing an explainable
count (e.g. "3 oportunidades · 2 visitas") instead of an opaque inquiries
number.

**Agency-wide revenue/profit must not be visible to every employee by
default** — see [Role / permission considerations](#role--permission-considerations).

## Statuses and states

Inherits statuses from the underlying entities (opportunity stage, contract
status, visit status) — no dashboard-specific status vocabulary.

## Role / permission considerations

Dashboard content should eventually change by role and permission scope:

- **Agent** — own new contacts, own active opportunities, upcoming visits,
  pending follow-up, personal closed operations.
- **Administration** — active managed rentals, contracts with debt,
  upcoming adjustments, upcoming expirations, administrative action items.
- **Manager/Admin** — organization- or branch-level views, filter by
  branch/agent, broader performance metrics.

Financial totals (revenue, profit) are never shown to every role by
default. *Prototype requirement: do not build fully separate hardcoded
dashboards per role unless a validated requirement justifies it* — favor
conditionally shown widgets over parallel dashboard implementations.

**Implemented in Milestone 1** as a single `DashboardPage` composed from
section components, with a small `getDashboardWidgetConfig(role)` lookup
controlling which metrics/sections render, and role-based data scoping
(branch, own-vs-org, attention category) handled in `dashboard-service.ts`.
The branch selector lives in the app-wide `TopBar` (visible to
`ADMIN`/`MANAGER` only), not inside the dashboard page itself, since branch
scope is shared session state other modules will also need — see
[architecture.md](../architecture.md#session-and-scope).

## Desktop behavior

Multi-column widget grid (metric cards row, chart + attention panel side by
side, visits + portfolio below).

## Mobile behavior

Single-column stack, cards instead of any tabular data — see
[ui-design-system.md](../ui-design-system.md#responsive-behavior).

## Prototype behavior

Mock data driven; role-based filtering may be simplified (e.g. simple
conditionals) rather than a generic widget/permission engine — see
[architecture.md](../architecture.md#permission-architecture-direction).

**Rewired to real CRM data in Milestone 3, then rental data in Milestone 4**
(`dashboard-service.ts`): all four metric cards, the contact-trend chart,
the opportunity-stage funnel, upcoming visits, and every "Requiere tu
atención" category (contact/opportunity/reservation/contract-expiration/
rent-adjustment) are derived from live `contact-service`/
`opportunity-service`/`visit-service`/`rental-contract-service` data — no
dashboard-only mock arrays remain for these. `alquileresAdministrados` is
now a real count of active rental contracts; contract-expiration/
rent-adjustment attention items use the same `expirationSeverity()`/
`isAdjustmentUpcoming()` utilities as the Administración module
(`features/administration/`), so the numbers always agree. Trend
percentage labels (e.g. "+12% vs. mes anterior") stay static; computing
them for real would require persisting historical snapshots, which isn't
worth it for a prototype. "Requiere tu atención" thresholds are simple and
documented in code, not client-validated business rules: a contact counts
as waiting after 3 days with no activity, an opportunity after 7.

## Future behavior

Fully configurable, permission-driven widget system; real-time data from a
backend.

## Out of scope

Full BI/analytics platform; agency-wide financial dashboards visible by
default.

## Open questions

Role/permission matrix (requirements.md open question 6); branch operation
rules (open question 5) affect how the branch filter behaves.

## Notes for future AI agents

Do not hardcode fake revenue numbers into the UI as if they were real
requirements — metrics here are operational counts, not money, unless a
role-gated financial view is explicitly requested later.
