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
Calendario
Listado
```

- **Agenda** — day-by-day list view (prev/next/Hoy navigation), visually
  modern and easy to scan (inspired by modern scheduling UIs, no external
  calendar integration).
- **Calendario** — month grid (added mid-Milestone-3 on explicit request);
  each day cell shows up to 3 visit chips (time + contact, colored by
  status) plus a "+N más" overflow, click opens the same detail sheet as
  Agenda/Listado.
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

### Outcome-to-opportunity feedback

Implemented in `VisitDetailSheet.handleComplete()` +
`VISIT_OUTCOME_STAGE_MAP` (`features/visits/visit-labels.ts`):

```text
Interesado       → Negociación
Quiere reservar  → Reserva
No interesado    → (no automatic change — agent decides, e.g. mark Perdida)
Reprogramar      → (no automatic change — visit gets rescheduled instead)
```

The map only applies when the target stage is valid for the linked
opportunity's type (`stagesFor(type)`), so it never fires for owner-side
opportunities (`Tasación`/`Captación`/... don't include `Reserva` or
`Negociación`). A visit with no `opportunityId` (allowed — not every visit
originates from a tracked opportunity) skips this entirely.

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

Implemented in Milestone 3 (`src/features/visits/`,
`src/services/visit-service.ts`). 25 mock visits
(`src/mocks/visits.ts` — 7 hand-crafted scenarios + 18 generated),
`localStorage`-persisted scheduling/status/outcome changes. A visit may
optionally reference an `opportunityId` (not every visit originates from a
tracked opportunity). `hasConflict()` warns on same-agent double-booking in
the scheduling form — a soft warning, not a hard block. No external
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
