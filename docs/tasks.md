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
  [architecture.md](architecture.md#service-dependency-graph-milestone-3-extended-in-milestones-4-6).
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
  [architecture.md](architecture.md#service-dependency-graph-milestone-3-extended-in-milestones-4-6).
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
- `Con deuda` on the overview shipped as an explicitly-labeled temporary
  placeholder (12% of active contracts) — replaced with real debt logic in
  Milestone 5, see
  [modules/rental-management.md](modules/rental-management.md#overview-metrics).
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
  counts. ✅ (debt was the documented temporary placeholder, replaced in
  Milestone 5)
- Expiration severity bands (90/60/30 days) match
  [modules/contracts.md](modules/contracts.md#expiration-alerts). ✅

## Milestone 5 — Monthly administration ✅ Done

- Monthly charges. (FR-RENT-004)
- Payment registration. (FR-RENT-005)
- Balances (paid/outstanding/partial/credit).
- Receipt preview. (FR-RENT-006)
- Owner settlement preview. (FR-RENT-007)

Implementation notes:
- `ContractObligation` (which recurring concepts apply, responsibility,
  provider) is embedded directly on `RentalContract` rather than a
  separate store — 1:1 owned data edited as a whole, not a growing
  collection. Editable inline in the new `Conceptos` tab.
- `ContractCharge`/`Payment`/`Receipt`/`OwnerSettlement` each got their own
  type + service (`contract-charge-service.ts`, `payment-service.ts`,
  `receipt-service.ts`, `owner-settlement-service.ts`), following the same
  leaf/composer dependency-graph rule as the CRM services — see
  [architecture.md](architecture.md#service-dependency-graph-milestone-3-extended-in-milestones-4-6).
- `ContractMovement` (the "Movimientos" tab) is **derived at read time**
  from charges/payments/receipts/settlements, never a separately stored
  log — same principle as the M3 activity-timeline pattern. A contract's
  credit balance is likewise derived (`sum` of unallocated
  `PaymentAllocation`s), not a maintained field — see
  [architecture.md](architecture.md#derive-dont-duplicate-milestone-5-addition).
- Charge `status` only ever stores `PENDING | PARTIAL | PAID`; `OVERDUE` is
  computed at display time from `dueDate` (`effectiveChargeStatus()`), so
  there's no fourth stored state to keep in sync as days pass.
- Every real (non-zero-cash) payment auto-generates its receipt — no
  separate "issue receipt" action, matching how a small agency actually
  works, and directly satisfying "issuing a receipt creates a movement"
  without extra plumbing.
- `ReceiptPage`/`SettlementDetailPage` are print-friendly via Tailwind's
  `print:hidden` on the app shell/sub-nav chrome — no separate print
  layout or PDF dependency — see
  [architecture.md](architecture.md#print-friendly-pages-milestone-5-addition).
- Found and fixed a mock-data realism issue while seeding: deciding
  payment/debt status per **charge** (independently) made "con deuda"
  compound across a contract's several enabled concepts, pushing the
  overview's debt count to ~77% of active contracts. Fixed by deciding a
  per-**contract** account profile (current/minor gap/debtor, weighted
  75/15/10) instead, landing on a more realistic ~30%.
- Mock dataset: ~5 months (May–Sep 2026) of charges for every contract
  active during that window, plus curated scenarios A–L from the milestone
  spec, reusing the Milestone 4 contract scenario letters (A/B/C also
  double as the Edenor/Edesur/"some services don't apply" obligation
  scenarios) — see [modules/contracts.md](modules/contracts.md#prototype-behavior).
- Cross-module integration: dashboard's `contract-expiration` attention
  category now also surfaces "N contratos con deuda" (gated the same way
  as everything else in that category, so `AGENT` never sees it); the
  Contratos list and Contact detail's linked-contracts block both show a
  compact "Al día"/"Debe $X"/"Saldo a favor $X" indicator, the latter
  hidden for `AGENT`.
- Skipped (explicitly out of scope): real accounting/double-entry
  bookkeeping, cash registers, bank reconciliation, ARCA electronic
  invoicing, real payment gateway, real IPC/ICL/utility-provider APIs.

**Acceptance criteria:**
- Charge status colors follow the semantic mapping in
  [ui-design-system.md](ui-design-system.md#semantic-colors). ✅
- Owner settlement preview shows the deduction breakdown from
  [data-model.md](data-model.md#ownersettlement). ✅

## Milestone 6 — Reports + settings ✅ Done

- Reports (commercial, property, rental, filters). (FR-REPORT-001 – FR-REPORT-003)
- Users, roles, branches, settings. (FR-SET-001, FR-SET-002)

Implementation notes:
- `report-service.ts` (`getCommercialReport`/`getPropertyReport`/
  `getAdministrationReport`) is a new top-level composer service, sibling to
  `dashboard-service.ts` — same pattern, no dependency between the two (see
  [architecture.md](architecture.md#service-dependency-graph-milestone-3-extended-in-milestones-4-6)).
  No separate report-only mock dataset; period filtering resolves to a
  month range (`periodRange()`) and reuses the same "bucket by ISO month"
  trend-point shape the dashboard's contact-trend chart already uses.
- Role-based visibility for both Reports and Settings goes through a new
  small centralized `can(role, capability)` helper
  (`src/lib/permissions.ts`) instead of scattered role conditionals — the
  permission-architecture direction called for in
  [architecture.md](architecture.md#permission-architecture-direction) since
  Milestone 1, now implemented at the point it was actually needed.
- `Organization`/`Branch`/`User` (`types/session.ts`) got additive fields
  (`Organization.phone/email/address/timezone/currency/cuit`,
  `Branch.address/phone/status`, `User.email/status`) and real CRUD
  services (`organization-service.ts`, `user-service.ts`), both now
  `localStorage`-backed like every other entity — previously both were
  read-only mock lookups. `getDemoUserForRole()` (used by the dev-only role
  switcher) now prefers an active user per role so deactivating a demo user
  in Settings can't break it.
- Settings uses nested routes under `/settings` (`SettingsLayout` + a
  `NavLink` sub-nav) mirroring `AdministrationLayout`'s established pattern,
  rather than client-side tab state — consistent with how the rest of the
  app structures multi-section modules.
- "Vista inicial de propiedades" in Preferencias does **not** introduce a
  second, competing preference: it reads/writes the Properties page's own
  existing "last used view" `localStorage` key
  (`lib/property-view-preference.ts`, extracted from `use-property-list.ts`
  so both `features/properties` and `features/settings` can use it without
  a forbidden cross-feature import).
- "Restaurar datos de demostración" (`lib/demo-reset.ts#resetDemoData()`)
  clears every `localStorage` key under the existing `fl.` prefix and
  reloads — no explicit per-entity key list to maintain, and formalizes the
  `fl.` prefix convention as load-bearing (documented in
  [architecture.md](architecture.md#localstorage-persistence)).
- Found and fixed a small pre-existing-pattern regression while testing:
  lengthening the mock org name to "Fernández López & Asociados" (for the
  Settings branding preview) wrapped awkwardly in the mobile-only compact
  `TopBar` header, which had no `truncate`/`min-w-0` — fixed with the same
  truncation pattern already used elsewhere (receipt/settlement headers).
- Settings pages intentionally do **not** read `organization`/`branches`
  from `useSession()` for display after an edit — that context value is
  captured once at app mount (existing known gap, see
  [architecture.md](architecture.md#known-gaps)) and would show stale data
  after a save. Each Settings page keeps its own local state instead,
  fetched fresh and updated from each mutation's return value.
- Verified via Playwright: role-gated report tabs (`AGENT` → Comercial +
  Propiedades only, personally-scoped numbers; `ADMINISTRATION` →
  Administración only; `MANAGER`/`ADMIN` → all three), branch/user create +
  edit + activate/deactivate, demo reset (confirmed it restores exactly the
  8 seeded users and clears session-only test data), and no horizontal
  overflow at 1440/900/390px.
- Skipped (explicitly out of scope): a generic/configurable permission
  editor (the role matrix is read-only, per spec), real integrations,
  export/CSV for reports, scheduled reports.

**Acceptance criteria:**
- Reports respect role-based access. ✅
- Settings clearly labels WhatsApp/integrations/notifications as future
  placeholders, not working features. ✅

## Milestone 7 — Demo hardening ✅ Done

- Responsive pass across all modules.
- Interaction polish (loading/empty states, transitions).
- Mock-data quality pass against
  [prototype-scope.md](prototype-scope.md#recommended-demo-data-scenarios).
- Bug fixes.
- Client demo preparation.

Implementation notes:
- **Cross-module consistency fix**: `use-administration-overview.ts`'s
  "Requieren atención" panel counted *every* `EXPIRED` contract as needing
  attention, including renewal-history records whose property already has
  a newer `ACTIVE`/`UPCOMING` contract (i.e. already renewed — not
  actionable). Fixed to only count a property's expired contract when
  nothing superseded it, dropping a misleading "37 contratos vencidos"
  down to a realistic "13". `ExpirationsPage`/`dashboard-service.ts` were
  already scoped to `ACTIVE` contracts only and didn't have this bug.
- **Property image optimization**: the 4 real Pexels photo sets under
  `public/properties/` were uncompressed camera-resolution JPEGs
  (4000–7728px wide, 31.7MB total) reused across every generated property
  card. One-time resize/recompress pass (max width 1920px, quality 78) cut
  this to 4.1MB — no code changes needed since filenames were preserved.
  No image-processing dependency was added to the project; the resize
  script was run once and discarded.
- **Terminology fix** (per this milestone's explicit guidance not to let
  one word mean two things): "Agregar concepto"/"Editar concepto" in the
  Cuenta Mensual tab — which creates/edits a `ContractCharge`, not a
  `ContractObligation` — renamed to "Agregar cargo"/"Editar cargo"
  throughout `ChargeFormSheet.tsx` and `ContractAccountTab.tsx` (button,
  sheet title, toasts, aria-labels). The **Conceptos** tab itself (which
  really does configure which concepts apply to the contract) was left
  unchanged — it was already using the term correctly.
- **Dead code removal**: `PaymentFormSheet.tsx` (the old multi-charge
  "Registrar pago" form, unused since that button was removed from
  `ContractAccountTab` in a Milestone 5 follow-up) and `ModulePlaceholder.tsx`
  (unused since Milestone 6 gave `/reports` and `/settings` real routes).
- **Terminology audit**: confirmed "Propiedades con más actividad" (not
  "más interés") is used consistently everywhere — the Milestone 3 rename
  had no stragglers.
- **Demo data realism**: no placeholder text (`Lorem ipsum`, `Test`,
  `John Doe`, `Property 1`, etc.) found anywhere in `mocks/` or `features/`.
- **Docs**: `README.md` no longer describes the app as an empty shell —
  updated to reflect all seven completed milestones.
- QA sweep (Playwright): role-aware dashboard (`AGENT` sees only personal
  metrics, no org-wide financials; `ADMINISTRATION`/`MANAGER`/`ADMIN` scale
  up correctly), mobile (390px) and tablet (900px) passes across
  Dashboard/Contacts/Visits/Administration/Properties/Opportunities — no
  horizontal overflow, no console errors — and a numeric cross-check
  confirming Reports → Administración and the Administración overview page
  report identical contract counts (activos/con deuda/próximos
  ajustes/vencen en 90 días) for the same branch scope.
- Not re-verified line-by-line in this pass (already covered by their own
  milestone's QA and unchanged since): Milestone 1–2 dashboard chart edge
  cases, Milestone 2 map clustering behavior, Milestone 3 visit-outcome
  feedback loop. No regressions found in the areas this pass did touch.

**Acceptance criteria:**
- All scenarios in
  [prototype-scope.md](prototype-scope.md#recommended-demo-data-scenarios)
  are represented in the dataset. ✅ (unchanged from Milestones 4–5 seeding)
- All five demo flows in
  [prototype-scope.md](prototype-scope.md#major-demo-flows) run end-to-end
  without dead ends. ✅

---

**Prototype v1 is feature-complete.** Next step is client validation with
Fernández López, not further prototype milestones — see the open questions
in [requirements.md](requirements.md#open-questions).

---

**Next recommended step:** Milestone 7 — Demo Hardening.
