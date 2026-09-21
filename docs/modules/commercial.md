# Commercial (Comercial)

## Objective

Describe how the commercial/CRM domain fits together: contacts,
opportunities, properties, and visits working as one workflow rather than
separate tools.

## Users

`AGENT` primarily; `MANAGER`/`ADMIN` for oversight and reporting.

## Main concepts

The `Comercial` top-level nav area contains two sub-modules:

```text
Oportunidades
Visitas
```

documented in detail in [opportunities.md](opportunities.md) and
[visits.md](visits.md) respectively. This document covers how they
connect, not their individual field-level detail (avoid duplicating that
here — link instead).

Terminology: use words understandable by real-estate staff (*Contacto*,
*Interesado*) rather than unnecessary English CRM jargon (*lead*).

## Main screens

No dedicated "Comercial" landing screen beyond its two sub-modules (and the
dashboard, which surfaces commercial highlights — see
[dashboard.md](dashboard.md)).

## Primary actions

See [opportunities.md](opportunities.md#primary-actions) and
[visits.md](visits.md#primary-actions).

## Main flows

```text
Contact
   │
   ▼
Opportunity
   │
   ├── Property
   │
   ▼
Visit
   │
   ▼
Reservation / Close
```

Demand-side and supply-side variants are documented in
[opportunities.md](opportunities.md).

## Entities and data

`Contact`, `Opportunity`, `Property`, `Visit` — see
[data-model.md](../data-model.md).

## Business rules

An `Opportunity` is always tied to exactly one `Contact`; a `Visit` is
always tied to exactly one `Opportunity`-relevant `Property` and `Contact`.
See the individual module docs for stage/status rules.

## Statuses and states

Defined per-entity in [opportunities.md](opportunities.md#statuses-and-states)
and [visits.md](visits.md#statuses-and-states) — not redefined here.

## Role / permission considerations

`AGENT` sees own/assigned contacts, opportunities, and visits by default;
broader visibility for `MANAGER`/`ADMIN` — see
[requirements.md open question 6](../requirements.md#open-questions).

## Desktop behavior

Standard list/detail patterns per sub-module.

## Mobile behavior

Standard card patterns per sub-module — see
[ui-design-system.md](../ui-design-system.md#responsive-behavior).

## Prototype behavior

Mock data, `localStorage`-persisted stage/status changes.

## Future behavior

See [opportunities.md](opportunities.md#future-behavior) and
[visits.md](visits.md#future-behavior).

## Out of scope

A generic, configurable CRM pipeline builder — the pipeline stages are
fixed (though provisional) product decisions, not end-user configuration,
for Prototype v1.

## Open questions

Commercial terminology (4); role permissions (6).

## Notes for future AI agents

This file is an index/connective document. Field-level and stage-level
detail belongs in [opportunities.md](opportunities.md) and
[visits.md](visits.md) — update those, not this file, when that detail
changes.
