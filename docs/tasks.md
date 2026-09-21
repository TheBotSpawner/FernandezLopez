# Tasks / Milestones

Initial milestone backlog for Prototype v1. See
[prototype-scope.md](prototype-scope.md) for what each milestone is trying
to prove and [requirements.md](requirements.md) for the functional
requirement IDs referenced below. Status is noted per milestone; unmarked
milestones are still planning only.

## Milestone 0 — Foundation ✅ Done

Repository bootstrap and documentation baseline.

**Acceptance criteria:**
- App builds and lints cleanly.
- `docs/` provides a complete, internally consistent product/technical
  baseline.

## Milestone 1 — Application shell + dashboard ✅ Done

- App layout: sidebar, top bar, responsive navigation shell.
- Mock current user + mock current organization/branch, branch selector.
- Dashboard cards, activity chart, attention panel, upcoming visits,
  portfolio summary, property cards. (FR-DASH-001 – FR-DASH-004)

Implementation notes:
- Session state (current user, org, branches, branch scope, dev-only role
  switcher) lives in a `SessionProvider`/`useSession` app-wide context
  (`src/app/session-context.tsx`), not scoped to the dashboard — other
  modules (Administración, Reportes) will read the same branch scope later.
  See [architecture.md](architecture.md#session-and-scope).
- The branch selector lives in the global `TopBar`, not inside the
  dashboard page itself, since it is app-wide scope state — see
  [modules/dashboard.md](modules/dashboard.md#role--permission-considerations).
- Role-aware widget visibility uses a small `getDashboardWidgetConfig(role)`
  lookup (`src/features/dashboard/dashboard-widgets.config.ts`); data
  scoping (branch/own-vs-org/attention category) happens in
  `dashboard-service.ts`. No period filter (Este mes/Mes anterior/Últimos 3
  meses) was implemented — it was explicitly optional in scope and adds
  meaningful mock-data complexity for limited demo value; revisit if a
  future task needs it.

**Acceptance criteria:**
- Navigation matches [ui-design-system.md](ui-design-system.md#navigation)
  exactly.
- Dashboard renders with mock data and adapts at least visually to role
  (even if full role-driven widgets are deferred).
- Responsive at desktop/tablet/mobile breakpoints.

## Milestone 2 — Properties ✅ Done

- Property list, cards, filters.
- Property detail (gallery, tabs).
- Property map. (FR-PROP-001 – FR-PROP-003)

Implementation notes:
- Mock dataset: 45 properties (`src/mocks/properties.ts`) — 4 hand-authored
  "featured" listings (the same ones the dashboard already showcased, now
  sourced from one place) plus 41 seeded-random generated ones, across the 7
  documented neighborhoods with realistic Buenos Aires coordinates.
- The dashboard's "Propiedades con más interés" widget and portfolio counts
  now read from `property-service.ts` instead of their own separate mock
  (`HIGH_INTEREST_PROPERTIES` / `PORTFOLIO_BY_BRANCH` were removed) — one
  dataset powering both the dashboard and the Properties module, per
  [architecture.md](architecture.md#data-flow).
- `getProperties(query)` does branch scoping, search, all filters, and sort
  in one place (`property-service.ts`); UI components only render.
- Branch scope: `ADMIN`/`MANAGER` follow the global branch selector; `AGENT`/
  `ADMINISTRATION` are scoped to their own `user.branchId` (no selector
  shown to them, consistent with Milestone 1's dashboard pattern).
- Skipped: the "Nueva propiedad" mock create/edit flow — explicitly optional
  in scope, and browsing + detail + map was the stated priority. Quick
  actions on the detail page (Editar, Registrar visita, Crear oportunidad,
  Cambiar estado) are shown disabled rather than faked.
- Skipped: marker clustering — optional per scope, 45 markers render fine
  without it.

**Acceptance criteria:**
- List/card/map share one dataset via `services/`.
- Map uses React Leaflet + OpenStreetMap, no Google Maps.
- Mobile view uses cards, not a compressed table.

## Milestone 3 — CRM ✅ Done

- Contacts. (FR-CONTACT-001, FR-CONTACT-002)
- Opportunities, pipeline. (FR-CRM-001 – FR-CRM-003)
- Visits, agenda. (FR-CRM-004, FR-CRM-005)

Implementation notes:
- Service dependency graph (`contact-service`/`property-service` as leaves,
  `opportunity-service` depending on `property-service`, `visit-service`
  independent, `dashboard-service` as top-level composer) — see
  [architecture.md](architecture.md#service-dependency-graph-milestone-3).
- A narrow, documented exception to "features don't import other features"
  lets small preview components (`OpportunityListItem`,
  `OpportunityStageBadge`, `VisitListItem`, `PropertyCard`) be shared across
  `contacts`/`opportunities`/`visits`/`properties` — see
  [architecture.md](architecture.md#dependency-boundaries).
- Most activity-timeline entries are derived at render time from entity
  timestamps; only `Opportunity` stage changes are persisted (the previous
  stage would otherwise be lost) — see
  [data-model.md](data-model.md#activity).
- Visits added a third view (`Calendario`, a month grid) alongside
  `Agenda`/`Listado` after an early demo review.
- Completing a visit linked to an opportunity feeds back into that
  opportunity's stage for outcomes that clearly imply forward movement
  (`Interesado → Negociación`, `Quiere reservar → Reserva`) — see
  [modules/visits.md](modules/visits.md#outcome-to-opportunity-feedback).
- Property's "Propietario" card now links to a real `Contact` — Milestone 3
  generated one `Contact` (role `owner`) per existing `PropertyOwner` mock
  record with a matching phone number so the link resolves; the two ID
  spaces are not yet formally unified — see
  [architecture.md](architecture.md#known-gaps).
- Dashboard metrics/chart/attention panel/upcoming-visits/"Propiedades con
  más actividad" now derive from real contact/opportunity/visit data
  instead of separate dashboard-only mocks;
  `alquileresAdministrados` and contract-expiration/rent-adjustment
  attention items stay static pending Milestone 4 — see
  [modules/dashboard.md](modules/dashboard.md#prototype-behavior).
- Property detail's Comercial/Visitas tabs now read real linked
  `Opportunity`/`Visit` records instead of the property's static
  `interest` field (which still powers the Properties "Mayor interés" sort
  and card badge, unchanged from Milestone 2) — see
  [modules/properties.md](modules/properties.md#property-detail).
- Skipped: a generic tenant/owner deduplication tool — out of scope per
  [modules/contacts.md](modules/contacts.md#future-behavior).

**Acceptance criteria:**
- A contact can hold multiple roles simultaneously and this is visible in
  the UI. ✅
- Opportunity pipeline stage changes are reflected in the dashboard
  attention panel and reports. ✅ (dashboard; reports module not built yet)
- Visit outcome updates the related opportunity. ✅

## Milestone 4 — Rental administration foundation ✅ Done

- Rental overview. (FR-RENT-001)
- Contracts list, contract detail. (FR-RENT-002)
- Expiration alerts. (FR-RENT-003)
- Adjustment information (simulated IPC/ICL/manual). (FR-RENT-008)
- AI-assisted contract upload simulation (human review required).

Implementation notes:
- `RentalContract` (`src/types/rental-contract.ts`) and
  `rental-contract-service.ts` follow the same service-layer pattern as
  the CRM entities — see
  [architecture.md](architecture.md#service-dependency-graph-milestone-3-extended-in-milestone-4).
- Routes nested under `/administration` (`AdministrationLayout`, mirroring
  `/commercial`'s pattern): `Resumen` at the index route, `Contratos`,
  `Vencimientos`, and a `Liquidaciones` placeholder for Milestone 5.
- Milestone 2's 45 properties only had 24 rent-eligible ones — not enough
  to back ~100 realistic contracts, so `mocks/properties.ts` was
  additively extended with 50 more rent-only generated properties; see
  [modules/properties.md](modules/properties.md#prototype-behavior).
  105 mock contracts total (`mocks/rental-contracts.ts`): the 10 curated
  scenarios (A–J) from the milestone spec plus 2 more (DRAFT, TERMINATED)
  for tab/status coverage, generated primary contracts for the remaining
  rent-eligible properties, and renewal-history (always `EXPIRED`)
  contracts on a subset of properties to reach the target count.
- Found and fixed a real sort-order bug while building the contracts list:
  sorting by raw ascending `daysUntil(endDate)` put the most-overdue
  contract first for "Vencimiento más próximo" — fixed with a
  `soonestFirst()` comparator that treats not-yet-due and overdue as two
  ordered buckets (`rental-contract-service.ts`).
- `Con deuda` on the overview is an explicitly-labeled temporary
  placeholder (12% of active contracts, `ponytail:`-commented) — see
  [modules/rental-management.md](modules/rental-management.md#overview-metrics).
  Not real debt logic; Milestone 5 replaces it.
- Cross-module integration: Property detail's Resumen tab shows a
  read-only active-contract card; Contact detail's Resumen tab shows a
  read-only "Contratos de alquiler" block for tenants/owners; the
  dashboard's `alquileresAdministrados` metric and contract-expiration/
  rent-adjustment attention items are now fully derived from real contract
  data (no dashboard-only mocks left for those) — see
  [modules/dashboard.md](modules/dashboard.md#prototype-behavior).
- While fixing the property-owner→contact link (a mid-Milestone-3 request),
  found `PropertyOwnerCard.tsx` importing `mocks/contacts.ts` directly,
  violating the service-layer rule — moved `findContactByPhone` into
  `contact-service.ts` properly; see
  [architecture.md](architecture.md#known-gaps).
- Skipped (explicitly out of scope this milestone): `ContractCharge`,
  `Payment`, `Receipt`, `OwnerSettlement`, real debt calculation, real
  IPC/ICL retrieval, real AI/OCR — all deferred to Milestone 5.

**Acceptance criteria:**
- Overview surfaces active/debt/upcoming-adjustment/expiring-≤90-days
  counts. ✅ (debt is the documented temporary placeholder)
- Expiration severity bands (90/60/30 days) match
  [modules/contracts.md](modules/contracts.md#expiration-alerts). ✅

## Milestone 5 — Monthly administration

- Monthly charges. (FR-RENT-004)
- Payment registration. (FR-RENT-005)
- Balances (paid/outstanding/partial/credit).
- Receipt preview. (FR-RENT-006)
- Owner settlement preview. (FR-RENT-007)

**Acceptance criteria:**
- Charge status colors follow the semantic mapping in
  [ui-design-system.md](ui-design-system.md#semantic-colors).
- Owner settlement preview shows the deduction breakdown from
  [data-model.md](data-model.md#ownersettlement).

## Milestone 6 — Reports + settings

- Reports (commercial, rental, filters). (FR-REPORT-001 – FR-REPORT-003)
- Users, roles, branches, settings. (FR-SET-001, FR-SET-002)

**Acceptance criteria:**
- Reports respect role-based access.
- Settings clearly labels WhatsApp/integrations/notifications as future
  placeholders, not working features.

## Milestone 7 — Demo hardening

- Responsive pass across all modules.
- Interaction polish (loading/empty states, transitions).
- Mock-data quality pass against
  [prototype-scope.md](prototype-scope.md#recommended-demo-data-scenarios).
- Bug fixes.
- Client demo preparation.

**Acceptance criteria:**
- All scenarios in
  [prototype-scope.md](prototype-scope.md#recommended-demo-data-scenarios)
  are represented in the dataset.
- All five demo flows in
  [prototype-scope.md](prototype-scope.md#major-demo-flows) run end-to-end
  without dead ends.

---

**Next recommended step:** Milestone 5 — Monthly Administration: charges,
services/taxes, payments, debt, credit balance, receipts and owner
settlements.
