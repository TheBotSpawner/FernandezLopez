# Fernández López Platform — Instructions for Claude Code

## Project purpose

A frontend-only prototype (React + Vite + TypeScript + Tailwind +
shadcn/ui) that will become the Fernández López real estate platform:
rental administration, commercial CRM, and property management in one app,
built with a future multi-tenant SaaS direction in mind. There is currently
no backend, database, or authentication.

## Source-of-truth hierarchy

1. Read this file first.
2. Read the relevant files under `docs/` **before** editing anything they
   describe — start with [docs/product-overview.md](docs/product-overview.md),
   then the specific module doc in `docs/modules/`.
3. Treat `docs/modules/*.md` as the expected product behavior for that
   module — not a suggestion.
4. Inspect the current implementation (`src/`) before making changes; do
   not assume the docs describe what's already built.
5. **Never assume a planned feature is already implemented.** Docs
   frequently describe `Planned`/`Future`/`Prototype requirement` behavior
   that does not exist in code yet — check `src/` to be sure.

## Working rules

- Inspect before editing: read the surrounding code and the relevant doc(s)
  first.
- Preserve existing functionality — do not remove or break working code as
  a side effect of an unrelated change.
- Keep changes scoped to what was asked; do not modify unrelated modules.
- Do not add future/planned functionality without it being explicitly
  requested — check [docs/prototype-scope.md](docs/prototype-scope.md) and
  [docs/requirements.md](docs/requirements.md#out-of-scope-prototype-v1)
  before building something that sounds adjacent but isn't asked for.
- Do not change data-model or API assumptions silently — if a change
  touches [docs/data-model.md](docs/data-model.md), update that doc too.
- Explain impact before introducing anything that looks like a
  database/backend/API — this repo is frontend-only by design (see
  [docs/architecture.md](docs/architecture.md)).
- UI code goes through the service layer (`src/services/`), never directly
  importing `src/mocks/` — see
  [docs/architecture.md](docs/architecture.md#data-flow).
- Preserve organization/branch awareness in any new entity or list (carry
  `organizationId`/`branchId` conceptually) — see
  [docs/architecture.md](docs/architecture.md#multi-tenant-and-organization-awareness).
- Keep responsive behavior in mind for every screen — desktop tables become
  mobile cards, not compressed tables — see
  [docs/ui-design-system.md](docs/ui-design-system.md#responsive-behavior).
- Use the semantic design tokens (`success`/`warning`/`danger`/`info`, etc.)
  from `src/index.css` — never hardcode colors — see
  [docs/ui-design-system.md](docs/ui-design-system.md#semantic-colors).
- Prefer Spanish business labels in the UI (e.g. `Inquilino`,
  `Propietario`, opportunity stage names); keep code, identifiers, and
  comments in English.
- Avoid overengineering: no interface with a single implementation, no
  config for values that never change, no speculative abstractions for
  modules not yet built.
- Update the relevant `docs/` file(s) when you change behavior they
  describe, so documentation doesn't drift from the code.

## Prototype rules

Currently, and until explicitly told otherwise:

- The app is **frontend-only**.
- Mock data (`src/mocks/`) and `localStorage` persistence are allowed and
  expected — see
  [docs/architecture.md](docs/architecture.md#localstorage-persistence).
- External integrations (WhatsApp, AI contract extraction, IPC/ICL/BCRA/
  INDEC, Google Maps/Calendar, ARCA) are **simulated only**.
- Real authentication, a real backend, a real database, or any real
  external integration are **out of scope** unless the user explicitly
  requests that specific piece of work.

## Validation

For implementation tasks:

- Run `npm run build` and `npm run lint`.
- For UI/frontend changes, run the dev server and manually verify the
  feature in a browser (golden path + edge cases) before reporting done.
- Explain what was manually verified and what could not be verified.

## Documentation map

- [docs/product-overview.md](docs/product-overview.md) — problem, users,
  principles, roles, modules.
- [docs/requirements.md](docs/requirements.md) — functional/non-functional
  requirements, scope, open questions.
- [docs/architecture.md](docs/architecture.md) — frontend architecture,
  data flow, future backend direction.
- [docs/data-model.md](docs/data-model.md) — conceptual domain entities.
- [docs/ui-design-system.md](docs/ui-design-system.md) — visual/interaction
  principles, semantic tokens.
- [docs/prototype-scope.md](docs/prototype-scope.md) — what Prototype v1
  must prove, demo flows, demo data plan.
- [docs/tasks.md](docs/tasks.md) — milestone backlog.
- [docs/modules/](docs/modules/) — per-module behavior (dashboard, rental
  management, contracts, properties, contacts, commercial, opportunities,
  visits, reports, settings).
