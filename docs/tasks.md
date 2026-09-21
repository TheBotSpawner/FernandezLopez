# Tasks / Milestones

Initial milestone backlog for Prototype v1. **Not implemented yet** — this
is planning only. See [prototype-scope.md](prototype-scope.md) for what each
milestone is trying to prove and [requirements.md](requirements.md) for the
functional requirement IDs referenced below.

## Milestone 0 — Foundation

Repository bootstrap and documentation baseline (this and the prior task).

**Acceptance criteria:**
- App builds and lints cleanly.
- `docs/` provides a complete, internally consistent product/technical
  baseline.

## Milestone 1 — Application shell + dashboard

- App layout: sidebar, top bar, responsive navigation shell.
- Mock current user + mock current organization/branch, branch selector.
- Dashboard cards, activity chart, attention panel, upcoming visits,
  portfolio summary, property cards. (FR-DASH-001 – FR-DASH-004)

**Acceptance criteria:**
- Navigation matches [ui-design-system.md](ui-design-system.md#navigation)
  exactly.
- Dashboard renders with mock data and adapts at least visually to role
  (even if full role-driven widgets are deferred).
- Responsive at desktop/tablet/mobile breakpoints.

## Milestone 2 — Properties

- Property list, cards, filters.
- Property detail (gallery, tabs).
- Property map. (FR-PROP-001 – FR-PROP-003)

**Acceptance criteria:**
- List/card/map share one dataset via `services/`.
- Map uses React Leaflet + OpenStreetMap, no Google Maps.
- Mobile view uses cards, not a compressed table.

## Milestone 3 — CRM

- Contacts. (FR-CONTACT-001, FR-CONTACT-002)
- Opportunities, pipeline. (FR-CRM-001 – FR-CRM-003)
- Visits, agenda. (FR-CRM-004, FR-CRM-005)

**Acceptance criteria:**
- A contact can hold multiple roles simultaneously and this is visible in
  the UI.
- Opportunity pipeline stage changes are reflected in the dashboard
  attention panel and reports.
- Visit outcome updates the related opportunity.

## Milestone 4 — Rental administration foundation

- Rental overview. (FR-RENT-001)
- Contracts list, contract detail. (FR-RENT-002)
- Expiration alerts. (FR-RENT-003)
- Adjustment information (simulated IPC/ICL/manual). (FR-RENT-008)

**Acceptance criteria:**
- Overview surfaces active/debt/upcoming-adjustment/expiring-≤90-days
  counts.
- Expiration severity bands (90/60/30 days) match
  [modules/contracts.md](modules/contracts.md#expiration-alerts).

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

**Next recommended step:** Milestone 1 — Application shell + Dashboard.
