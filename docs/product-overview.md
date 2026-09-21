# Product Overview

## Problem

Fernández López, an Argentine real estate agency, currently runs its
operation on paper, memory, scattered records, and a rental-administration
platform that creates excessive manual work. There is no single system that
covers rental administration, commercial CRM, and property management
together.

## Client context

- First and only current client: **Fernández López**.
- Manages roughly **100 rental properties**, which makes rental
  administration the highest-priority operational area.
- Also runs a commercial/sales operation (buying, selling, renting) and a
  property portfolio.
- Has previously complained that other software was too complex and hard to
  understand — see [Principle 1](#product-principles).

## Target users

See [requirements.md](requirements.md) and the role definitions below for
detail. In short:

| Role | Focus |
|---|---|
| `ADMIN` | Full organization access, configuration |
| `MANAGER` | Oversight, branch/org dashboards, reports |
| `ADMINISTRATION` | Rental contracts, charges, payments, settlements |
| `AGENT` | Contacts, opportunities, visits, properties |

## Product goals

1. Centralize the agency's operational workflow in one modern web app.
2. Make rental administration (~100 contracts) fast to review and act on.
3. Support the commercial CRM lifecycle: contact → opportunity → visit →
   reservation/close.
4. Give properties a single source of truth across list, card, and map
   views.
5. Prove the concept with Fernández López before building a real backend.
6. Design so the product can evolve into a **multi-tenant SaaS** for other
   agencies without a frontend rewrite (see
   [architecture.md](architecture.md#multi-tenant-and-organization-awareness)).

## Product principles

1. **Simplicity over feature density.** Small main navigation, progressive
   disclosure, real-estate terminology instead of CRM/technical jargon.
2. **Operational usefulness over decorative dashboards.** The dashboard
   answers "what is happening, and what requires my attention?" — see
   [modules/dashboard.md](modules/dashboard.md).
3. **Role-aware information.** Different roles see different data; agency
   financial information is not globally visible by default.
4. **Mobile usability.** Desktop tables become cards on mobile, not
   compressed tables — see
   [ui-design-system.md](ui-design-system.md#responsive-behavior).
5. **Modern but operational UI.** Clean, calm, premium-but-not-flashy,
   restrained animation — see [ui-design-system.md](ui-design-system.md).

## Main modules

- **Dashboard** ([modules/dashboard.md](modules/dashboard.md))
- **Rental administration** ([modules/rental-management.md](modules/rental-management.md),
  [modules/contracts.md](modules/contracts.md))
- **Properties** ([modules/properties.md](modules/properties.md))
- **Commercial / CRM** ([modules/commercial.md](modules/commercial.md),
  [modules/opportunities.md](modules/opportunities.md),
  [modules/visits.md](modules/visits.md))
- **Contacts** ([modules/contacts.md](modules/contacts.md))
- **Reports** ([modules/reports.md](modules/reports.md))
- **Settings** ([modules/settings.md](modules/settings.md))

Top-level navigation is intentionally limited to:

```text
Inicio
Administración
Propiedades
Comercial
Contactos
Reportes
Configuración
```

## High-level user journey

**Commercial (demand side):** a contact reaches out → becomes an
opportunity → gets matched to properties → visits a property → negotiates →
reserves/closes. See [modules/opportunities.md](modules/opportunities.md).

**Commercial (owner/supply side):** an owner inquires → property is valued
→ acquired → published → operated (sale or rental). See
[modules/opportunities.md](modules/opportunities.md#property-owner-acquisition-workflow).

**Rental administration:** a signed contract enters the system → generates
monthly charges → tenant pays → agency issues a receipt → agency settles
with the owner → contract eventually adjusts (IPC/ICL) and/or expires. See
[modules/contracts.md](modules/contracts.md) and
[modules/rental-management.md](modules/rental-management.md).

## Current prototype goal

Prototype v1 is a **frontend-only** interactive demo meant to validate the
product concept with Fernández López before any backend investment. See
[prototype-scope.md](prototype-scope.md) for the full scope, demo flows, and
what may be simulated vs. must not be implemented.

## Future SaaS direction

Fernández López is the first client, but the domain model is designed
around `Organization → Branch → User` so the same frontend can eventually
serve multiple organizations. Real multi-tenant isolation is a **future
backend responsibility** — see
[architecture.md](architecture.md#multi-tenant-and-organization-awareness).

## Unresolved client questions

The following require validation with Fernández López before they can be
treated as final. Full detail in
[requirements.md](requirements.md#open-questions).

1. Expense responsibility rules (rent, ABL, AYSA, electricity, gas,
   expensas, extraordinary expenses, repairs, other).
2. Owner settlement rules (fee calculation, deductions, timing).
3. Mandatory rental-contract fields beyond the prototype model.
4. Preferred commercial terminology/pipeline stages.
5. Branch operation rules (record visibility, cross-branch agents).
6. Final role/permission matrix.
