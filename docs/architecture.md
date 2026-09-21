# Architecture

## Current state: frontend-only prototype

There is **no backend, database, or authentication** in this repository.
Everything runs client-side. Treat any reference to an "API" or "backend" in
this document as future direction, not current implementation.

## Stack

React, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router, React Hook
Form, Zod, Recharts, React Leaflet + Leaflet, Lucide React, date-fns, Framer
Motion. The repository (`package.json`) is the source of truth if this list
and the installed versions ever diverge.

## Folder organization

```text
src/
├── app/          # App shell: App.tsx, router.tsx, providers.tsx
├── assets/       # Static assets
├── components/
│   ├── ui/           # shadcn/ui primitives (Button, Card, ...)
│   ├── layout/        # App shell layout: sidebar, topbar, page containers
│   ├── data-display/  # Tables, cards, badges, charts wrappers
│   └── feedback/       # Empty states, skeletons, toasts, dialogs
├── features/     # One folder per business module (see below)
├── hooks/        # Shared React hooks
├── lib/          # Framework-agnostic utilities (e.g. cn())
├── mocks/        # Mock datasets and fixtures
├── pages/        # Route-level components composed from features
├── services/     # Service layer — the only thing pages/features call for data
└── types/        # Shared TypeScript types/interfaces
```

`features/` currently has one folder per module: `dashboard`,
`administration`, `contracts`, `properties`, `contacts`, `opportunities`,
`visits`, `reports`, `users`, `organizations`. Each feature folder owns its
module-specific components, hooks, and logic; cross-module UI stays in
`components/`.

## Page / feature / shared component separation

- **`pages/`** — thin route-level components. They compose feature
  components and pass data down; they do not contain business logic.
- **`features/<module>/`** — module-specific UI and logic (e.g.
  `features/contracts/ContractList.tsx`). May depend on `services/`,
  `components/`, `hooks/`, `types/`, `lib/`. Should not depend on another
  feature module directly — shared pieces move to `components/` or `lib/`.
- **`components/`** — reusable, module-agnostic UI. `ui/` is shadcn
  primitives; `layout/`, `data-display/`, `feedback/` are composed from
  those primitives for app-wide reuse (tables, badges, skeletons, etc.).

## Routing strategy

`react-router-dom`, configured in `src/app/router.tsx` via
`createBrowserRouter`. Routes map to `pages/`, one route per top-level nav
item plus nested routes for module sub-navigation (list/detail, tabs, etc.).
Route params carry entity IDs (e.g. `/propiedades/:propertyId`).

## Data flow / service layer

```text
UI (pages/features)
    ↓
services/            ← the only data-access boundary the UI talks to
    ↓
mocks/ (Prototype v1) → future: HTTP API → backend → database
```

Rule: **UI components never import mock arrays directly.** They call a
function in `services/` (e.g. `getContracts()`, `getContactById(id)`). The
service function is what currently reads from `mocks/` (optionally backed by
`localStorage`, see below). This keeps the migration to a real API a
service-layer change, not a UI rewrite.

## Mock data direction

`mocks/` holds fixture data and, for Prototype v1, simple in-memory/JSON
datasets. See [prototype-scope.md](prototype-scope.md#recommended-demo-data-scenarios)
for the intended scale and scenarios. Mock data generation is **not** part
of this documentation task — see [tasks.md](tasks.md).

## localStorage persistence

Prototype interactions (creating/editing a contact, changing an opportunity
stage, scheduling a visit, editing a property, registering a mock payment)
may persist to `localStorage` so a demo session survives a page reload. This
is prototype convenience only — it is not a production storage strategy and
must not be treated as one. A future "reset demo data" action may restore
the original fixtures.

## Session and scope

Introduced in Milestone 1. `src/app/session-context.tsx` exposes a
`SessionProvider`/`useSession()` pair holding the current mock
`organization`, `branches`, `user`, and the selected `branchScope`
(`'all'` or a branch id). It is mounted once in `src/app/providers.tsx`, so
any module can read the same organization/branch/user context — this is
not dashboard-specific. `branchScope` and the dev-only role switcher persist
to `localStorage` (two small keys, not the dataset itself — see
[localStorage persistence](#localstorage-persistence)). There is no real
authentication behind `user`; switching role via the user menu is a
demo/dev affordance only, per
[prototype-scope.md](prototype-scope.md#what-must-not-be-implemented).

## Future API migration

```text
UI → services/ → HTTP API → backend → database
```

Because the UI only talks to `services/`, migrating from mocks/localStorage
to real HTTP calls means rewriting the inside of `services/` functions, not
the components that call them. Function signatures in `services/` should
already look like what an API client would return (plain data, not mock
implementation details).

## Future backend architecture (not implemented)

```text
Frontend   React + TypeScript (this repo)
Backend    Node.js + TypeScript
ORM        Prisma
Database   MySQL
```

No backend code, Prisma schema, or database connection exists or should be
added as part of documentation or early frontend milestones. This section
exists so frontend decisions don't foreclose it (e.g. services return
plain serializable data, not framework-specific objects).

## Multi-tenant and organization awareness

The conceptual hierarchy is:

```text
Organization
├── Branch
├── Branch
└── User
```

Fernández López is the only organization today, but entities are modeled
with `organizationId` (and `branchId` where relevant — see
[data-model.md](data-model.md)) so the frontend does not assume a single
organization or branch. **Real multi-tenant isolation (auth, data
partitioning, access control across organizations) is a future backend
responsibility** — the prototype does not implement or enforce it; a mock
"current organization" and "current branch" are enough for the UI.

## Permission architecture direction

Roles: `ADMIN`, `MANAGER`, `ADMINISTRATION`, `AGENT` — see
[data-model.md](data-model.md#user) and
[requirements.md](requirements.md#open-questions) (role matrix is not yet
validated). Do not scatter role checks as ad hoc conditionals
(`if (user.role === 'ADMIN')` sprinkled across components) or, worse,
identity-specific conditionals (`if (user.name === 'Martín')`). Prefer a
small centralized helper, e.g. `can(user, "administration.view")`, even in
the prototype, so the real permission matrix can be swapped in later without
touching every screen.

## Dependency boundaries

- `mocks/` and `services/` are the only places allowed to know the shape of
  fixture data.
- `features/<module>/` does not import from another `features/<other>/`.
  Shared logic goes in `lib/`, `hooks/`, or `components/`.
- **Narrow exception (Milestone 3, extended in Milestone 4):** small,
  purely-presentational preview/list-item components — `OpportunityListItem`,
  `OpportunityStageBadge`, `VisitListItem`, `PropertyCard`,
  `ContractStatusBadge` — plus a couple of pure label/constant maps
  (`contract-labels.ts`, `property-labels.ts`) are imported directly across
  `features/contacts`, `features/opportunities`, `features/visits`,
  `features/properties`, and `features/administration`. These render one
  entity summary (or map an enum to a Spanish label) from props with no
  cross-feature business logic or data fetching; moving them into
  `components/` would strip their module-specific formatting helpers for no
  real reuse benefit elsewhere. If a component grows business logic beyond
  "format and render one entity", it no longer qualifies for this
  exception and should move to `components/` or be duplicated per-feature
  instead.
- `components/ui/` (shadcn) stays generic — no business logic or copy in
  Spanish business terms inside primitives.
- No new runtime dependency (state management, data fetching library, UI kit,
  etc.) without a clear technical reason — see the dependency list in
  [README.md](../README.md#stack).

## Service dependency graph (Milestone 3, extended in Milestone 4)

To avoid circular imports between the CRM/rental services, dependencies
flow one way only:

```text
contact-service.ts   (leaf — no dependency on other CRM services)
property-service.ts  (leaf — no dependency on other CRM services)
        ↑                    ↑
        └──────────┬─────────┘
                    │
opportunity-service.ts   (depends on property-service, for
                           getCompatibleProperties / linked properties)
rental-contract-service.ts  (depends on contact-service + property-service,
                              for search text and cross-reference lookups —
                              same role as opportunity-service, one level
                              above the leaves)
        ↑
visit-service.ts is independent (does not import opportunity-service,
rental-contract-service, or vice versa)
        ↑
dashboard-service.ts   (top-level composer — depends on contact-service,
                         opportunity-service, visit-service,
                         rental-contract-service, property-service)
```

Consequence: `property-service.ts` never imports from `opportunity-service`,
`visit-service`, or `rental-contract-service`, even though the reverse
(property detail showing its opportunities/visits/active contract) is a
real UI need — that composition happens one layer up, in the feature hook
(`use-property-detail.ts`) or in `dashboard-service.ts`, which are allowed
to depend on multiple services. Any new cross-CRM-entity logic should
follow the same rule: put it in the higher-level caller, not in a leaf
service.

## Known gaps

- **`Property.ownerIds` vs. `Contact`**: Milestone 2 introduced a small,
  separate `PropertyOwner` pool (`src/mocks/property-owners.ts`) before the
  `Contact` module existed. Milestone 3 added a `Contact` (role `owner`)
  per `PropertyOwner` with a matching phone number so the property detail
  page's "Propietario" card can link to a real contact
  (`findContactByPhone` — a service-layer function on
  `contact-service.ts`; a separate, mock-generation-time function of the
  same name also lives in `mocks/contacts.ts` for other mock files like
  `rental-contracts.ts` to use at seed time, operating on the static seed
  array rather than the live/mutable one), but the two ID spaces
  (`owner-N` vs. `contact-owner-N`) are still formally separate —
  `Property.ownerIds` was not remodeled to reference `Contact` directly. A
  future milestone should fold `PropertyOwner` into `Contact` and drop the
  phone-matching lookup.
- **`Property.status` doesn't reflect `RentalContract.status`**: a
  property with an `ACTIVE` rental contract can still show `status:
  'available'` on its own record (e.g. Monroe 2450) — the two fields are
  independently seeded/edited, Milestone 4 did not add a sync step. Not a
  correctness issue for the features actually built (the contract card
  shows the real contract status), but worth resolving before a "which
  properties are currently rented" property-level filter is built.
- **`Con deuda` metric is a placeholder**: `use-administration-overview.ts`
  computes it as 12% of active contracts, not real data — see
  [modules/rental-management.md](modules/rental-management.md#overview-metrics).

## Technical constraints

- Design tokens for color are semantic (`background`, `primary`, `success`,
  `danger`, ...), not hardcoded per screen — see
  [ui-design-system.md](ui-design-system.md#semantic-colors).
- Responsive behavior is required, not a follow-up pass.
- TypeScript strict-ish settings, `@/` alias to `src/`, see root
  `tsconfig.app.json`.
