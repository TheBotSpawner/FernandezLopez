# Fernández López — Real Estate Platform Prototype

Internal working name for a platform that centralizes rental
administration, commercial CRM, and property management for **Fernández
López**, an Argentine real estate agency, with an eye toward a future
multi-tenant SaaS product. See [docs/product-overview.md](docs/product-overview.md)
for the full product context.

## Current project status

**Prototype v1 — feature-complete, frontend-only.** All seven planned
milestones are implemented and demo-ready: Dashboard, Properties, CRM
(Contacts/Opportunities/Visits), Rental Administration (contracts,
concepts, monthly account, payments, movements, receipts, owner
settlements), Reports, and Settings (organization, branches, users, roles,
preferences, demo reset). No backend, database, or authentication exists —
everything runs on mock data and `localStorage`. Full scope:
[docs/prototype-scope.md](docs/prototype-scope.md); milestone-by-milestone
detail: [docs/tasks.md](docs/tasks.md).

## Stack

React + Vite + TypeScript, Tailwind CSS, shadcn/ui, React Router, React Hook
Form + Zod, Recharts, React Leaflet + Leaflet, Lucide React, date-fns,
Framer Motion. Details: [docs/architecture.md](docs/architecture.md).

## Setup

```bash
npm install
npm run dev      # start local dev server
npm run build    # type-check and production build
npm run lint      # lint
```

## Project structure

```text
src/
├── app/          # App shell, router, providers
├── components/   # ui (shadcn), layout, data-display, feedback
├── features/     # one folder per business module: dashboard, properties,
│                 # contacts, opportunities, visits, administration,
│                 # reports, settings
├── lib/
├── mocks/        # mock data, replaced by a real API later
├── pages/
├── services/     # UI → services → mocks (later: HTTP API)
└── types/
```

See [docs/architecture.md](docs/architecture.md) for the reasoning behind
this layout and the service-layer/data-flow direction.

## Documentation index

- [docs/product-overview.md](docs/product-overview.md) — problem, users,
  principles, roles, modules.
- [docs/requirements.md](docs/requirements.md) — functional/non-functional
  requirements, scope, open questions.
- [docs/architecture.md](docs/architecture.md) — frontend architecture,
  data flow, future backend direction.
- [docs/data-model.md](docs/data-model.md) — conceptual domain entities and
  relationships.
- [docs/ui-design-system.md](docs/ui-design-system.md) — visual and
  interaction principles, semantic tokens.
- [docs/prototype-scope.md](docs/prototype-scope.md) — what the Prototype
  v1 demo must prove, demo flows, demo data plan.
- [docs/tasks.md](docs/tasks.md) — milestone backlog.
- [docs/modules/](docs/modules/) — per-module detail (dashboard, rental
  management, contracts, properties, contacts, commercial, opportunities,
  visits, reports, settings).

## Prototype limitations

This is a **frontend-only, mock-data-driven prototype**. There is no real
authentication, no backend, no database, and no external integrations
(WhatsApp, AI extraction, IPC/ICL/BCRA/INDEC, Google Maps/Calendar, ARCA).
See [docs/prototype-scope.md](docs/prototype-scope.md#explicitly-out-of-scope-for-prototype-v1)
for the complete list.

For working with this repository, start with [CLAUDE.md](CLAUDE.md).
