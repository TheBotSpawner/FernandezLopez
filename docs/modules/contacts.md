# Contacts (Contactos)

## Objective

Maintain one central, de-duplicated database of every person the agency
interacts with, regardless of how many business roles they hold.

## Users

`AGENT` primarily (own/assigned contacts); `ADMIN`/`MANAGER` broader access;
`ADMINISTRATION` reads contacts referenced by contracts (tenants/owners).

## Main concepts

**Do not create separate person records per role.** A `Contact` may
simultaneously be, e.g., `Inquilino` and `Interesado en compra`. See
[data-model.md](../data-model.md#contact).

Conceptual roles: `prospect | tenant | buyer | owner | seller`, shown in the
UI as:

```text
Interesado
Inquilino
Comprador
Propietario
Vendedor
```

## Main screens

Contact list (search/filter) and contact detail (profile + related data
tabs/sections).

## Primary actions

- Create/edit a contact.
- Add a note.
- Assign a contact to a user.
- Create an opportunity from a contact.
- Schedule a visit for a contact.

## Main flows

A contact is the entry point for both commercial demand-side and
owner/supply-side flows — see
[opportunities.md](opportunities.md#opportunity-vs-contact) and
[prototype-scope.md](../prototype-scope.md#major-demo-flows) Flows A and B.

## Entities and data

`Contact`, related `Opportunity`, `Visit`, `RentalContract` (as
tenant/owner), `Property` (as owner), `Activity` — see
[data-model.md](../data-model.md#contact).

## Business rules

Contact information supports: full name, phone, email, assigned user,
notes, roles, and links to opportunities, related properties, visits,
contracts, and activity history. A contact's role list grows as their
relationship with the agency grows (e.g. a prospect becomes a tenant without
creating a new record).

## Statuses and states

Roles are additive (a set), not a single status — a contact does not
"transition" between roles, it accumulates them.

## Role / permission considerations

An `AGENT` primarily works with their own/assigned contacts. Full-database
visibility for `ADMIN`/`MANAGER` pending open question 6 (role matrix) and
open question 5 (branch scoping).

## Desktop behavior

List as a table with role badges per row; detail as a full page with
tabs/sections for related data.

## Mobile behavior

List as cards (name, primary role badge(s), phone); detail sections stack
vertically.

## Prototype behavior

Mock contact dataset (~120 per
[prototype-scope.md](../prototype-scope.md#recommended-demo-data-scenarios)),
edits persisted via `localStorage`.

## Future behavior

Deduplication tooling, richer activity/history timeline, possible import
from external sources.

## Out of scope

Tenant/owner self-service portals (contacts do not log in themselves in
Prototype v1) — see
[prototype-scope.md](../prototype-scope.md#explicitly-out-of-scope-for-prototype-v1).

## Open questions

Role/permission matrix (6); branch operation (5).

## Notes for future AI agents

If a request implies creating a second record for the same person under a
different role, that is almost certainly wrong — check whether the existing
`Contact` should instead gain a role and/or a new `Opportunity`.
