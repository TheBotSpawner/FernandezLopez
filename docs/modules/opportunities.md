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

For an owner who wants to sell:

```text
Nueva consulta
↓
Contacto
↓
Tasación
↓
Captación
↓
Propiedad publicada
↓
Operación
```

A similar workflow applies when an owner wants to offer a property for
rent. This is **not** a separate CRM architecture — it is the same
`Opportunity` entity with `type` set to the owner-side values below.

## Entities and data

`Opportunity` (fields in [data-model.md](../data-model.md#opportunity)),
related `Contact`, `Property`, `Visit`.

## Business rules

### Opportunity types

```text
Busca alquilar
Busca comprar
Quiere alquilar una propiedad
Quiere vender una propiedad
```

Supports both demand-side (buyer/tenant) and supply-side (owner) workflows
through the same entity.

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

Mock opportunities (~25 per
[prototype-scope.md](../prototype-scope.md#recommended-demo-data-scenarios)),
stage changes persisted via `localStorage`, reflected in the dashboard
attention panel.

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
