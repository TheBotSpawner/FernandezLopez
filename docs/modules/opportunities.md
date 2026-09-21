# Opportunities (Oportunidades)

## Objective

Track a contact's specific commercial intention separately from the
contact's identity, so one person can have several intentions over time
without record duplication.

## Users

`AGENT` primarily (own/assigned opportunities); `MANAGER`/`ADMIN` oversight.

## Main concepts

### Opportunity vs. Contact

A `Contact` is a person. An `Opportunity` is that person's specific
commercial intention at a point in time.

```text
Contact:
Juan Pérez

Opportunity:
Juan busca un departamento de 3 ambientes en Coghlan.
```

See [data-model.md](../data-model.md#opportunity) for fields.

## Main screens

Opportunity list (filterable by stage/type/agent) and opportunity detail
(contact, preferences, matched properties, activity, next action).

## Primary actions

- Create an opportunity from a contact.
- Advance/change pipeline stage.
- Attach candidate properties.
- Schedule a visit from an opportunity.
- Mark as lost (with optional reason).

## Main flows

### Buyer/tenant opportunity pipeline

```text
Nueva
↓
Contactado
↓
Propiedades seleccionadas
↓
Visita
↓
Negociación
↓
Reserva
↓
Cerrada
```

An opportunity may also become `Perdida` (with an optional reason) from any
active stage. **These exact labels are provisional** — see
[requirements.md open question 4](../requirements.md#open-questions).

### Property-owner acquisition workflow

For an owner who wants to sell (implemented stage names, `OWNER_STAGES` —
adjusted slightly from the original sketch during Milestone 3):

```text
Nueva
↓
Contactado
↓
Tasación
↓
Captación
↓
Publicada
↓
Cerrada
```

An owner-side opportunity may also become `Perdida`, same as demand-side.
A similar workflow applies when an owner wants to offer a property for
rent. This is **not** a separate CRM architecture — it is the same
`Opportunity` entity with `type` set to the owner-side values below.

## Entities and data

`Opportunity` (fields in [data-model.md](../data-model.md#opportunity)),
related `Contact`, `Property`, `Visit`.

## Business rules

### Opportunity types

```text
RENT_SEARCH  → Busca alquilar
BUY_SEARCH   → Busca comprar
OWNER_RENT   → Quiere alquilar una propiedad
OWNER_SELL   → Quiere vender una propiedad
```

Supports both demand-side (buyer/tenant) and supply-side (owner) workflows
through the same entity — `isOwnerOpportunity(type)` distinguishes them.

## Statuses and states

Buyer/tenant pipeline stages and owner acquisition stages as listed above,
plus terminal `Perdida` (buyer/tenant side) with an optional reason field.

## Role / permission considerations

`AGENT` sees/owns their assigned opportunities by default; `MANAGER`/`ADMIN`
get broader (org/branch) visibility — pending open question 6.

## Desktop behavior

List/kanban-style board by stage, or filterable table; detail as a full
page or side panel.

## Mobile behavior

Stage shown as a prominent badge on a card list; stage advancement via a
simple action rather than drag-and-drop.

## Prototype behavior

Implemented in Milestone 3 (`src/features/opportunities/`,
`src/services/opportunity-service.ts`). Field name is `stage` (not
`status`) in the implementation. 35 mock opportunities
(`src/mocks/opportunities.ts` — 7 hand-crafted scenarios tied to specific
contacts/properties + 28 generated), stage changes persisted via
`localStorage`. Two views: kanban `Pipeline` (default, grouped by stage,
stage change via a card dropdown) and a filterable `Lista` table — both
switchable per the "Búsqueda"/"Captación" (demand/owner) toggle. Candidate
properties for demand-side opportunities are suggested via a deliberately
simple, explainable heuristic (`getCompatibleProperties()` — budget range,
preferred neighborhood, property type, room count; each match shows its
matching reasons as badges), not a recommendation engine. Completing a
linked visit with certain outcomes automatically advances the opportunity's
stage — see [visits.md](visits.md#outcome-to-opportunity-feedback). Reflected
in the dashboard attention panel and the "Propiedades con más actividad"
widget — see [dashboard.md](dashboard.md).

## Future behavior

Validated final terminology/pipeline from Fernández López (open question
4); possibly configurable stages per organization in the SaaS future.

## Out of scope

A generic, tenant-configurable pipeline builder for Prototype v1.

## Open questions

Commercial terminology/pipeline (4); role permissions (6).

## Notes for future AI agents

Treat the pipeline stage names as **provisional data, not fixed code
constants that are safe to hardcode deeply** — keep them centralized (one
enum/config) so a terminology change from the client is a small diff, not a
find-and-replace across the codebase.
