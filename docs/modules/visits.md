# Visits (Visitas)

## Objective

Schedule and track property visits, and feed the outcome back into the
related opportunity.

## Users

`AGENT` primarily; `MANAGER`/`ADMIN` oversight; relevant to
[properties.md](properties.md) (a property's "Visitas" tab) and
[opportunities.md](opportunities.md).

## Main concepts

A `Visit` connects `Contact`, `Property`, `User` (agent), date/time, status,
notes, and outcome — see [data-model.md](../data-model.md#visit).

## Main screens

```text
Agenda
Listado
```

- **Agenda** — calendar/schedule-style view, visually modern and easy to
  scan (inspired by modern scheduling UIs, no external calendar
  integration).
- **Listado** — filterable table/list of visits.

## Primary actions

- Schedule a visit (from a contact, property, or opportunity).
- Confirm / cancel / reschedule a visit.
- Record the outcome after a completed visit.

## Main flows

Visit scheduled → confirmed → realized → outcome recorded → outcome updates
the related [Opportunity](opportunities.md).

## Entities and data

`Visit`, related `Contact`, `Property`, `User`, `Opportunity` — see
[data-model.md](../data-model.md#visit).

## Business rules

### Visit statuses

```text
Programada
Confirmada
Realizada
Cancelada
Reprogramada
```

### Visit outcomes (after `Realizada`)

```text
Interesado
Quiere reservar
No interesado
Reprogramar
```

The outcome should conceptually feed back into the related opportunity
(e.g. advance its stage, add an activity note).

## Statuses and states

See [Visit statuses](#visit-statuses) and
[Visit outcomes](#visit-outcomes-after-realizada) above.

## Role / permission considerations

`AGENT` manages their own scheduled visits; `MANAGER`/`ADMIN` see broader
agenda views (branch/org) — pending open question 6.

## Desktop behavior

Full calendar/agenda view with a list toggle.

## Mobile behavior

Agenda simplifies to a day/list view; visit cards show contact, property,
time, and status compactly — see
[ui-design-system.md](../ui-design-system.md#responsive-behavior).

## Prototype behavior

Mock visits (~20 per
[prototype-scope.md](../prototype-scope.md#recommended-demo-data-scenarios)),
`localStorage`-persisted scheduling/status/outcome changes. No external
calendar integration.

## Future behavior

Possible Google Calendar sync — explicitly out of scope for Prototype v1.

## Out of scope

External calendar integrations (Google Calendar or otherwise).

## Open questions

Role/permission matrix (6); branch operation for cross-branch visit
visibility (5).

## Notes for future AI agents

The outcome-to-opportunity feedback loop is a product requirement, not
optional polish — don't implement visit outcomes as a dead-end field that
never touches the related opportunity's state.
