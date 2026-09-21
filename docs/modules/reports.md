# Reports (Reportes)

## Objective

Provide basic operational reporting for both the commercial and rental
administration sides — **not** a BI platform.

## Users

`MANAGER`/`ADMIN` primarily; `ADMINISTRATION` for rental reports; `AGENT`
access, if any, limited to their own activity — pending open question 6.

## Main concepts

Reports are read-only aggregations over existing entities (no new entity
types). Two report groups: commercial and rental administration.

## Main screens

Report list/selection with filters, and a report view (table + optionally
one chart) per report.

## Primary actions

- Select a report.
- Apply filters (period, branch, agent).
- (Optional, future) export.

## Main flows

User opens `Reportes` → picks a report → applies filters → reviews results.

## Entities and data

Reads from `Contact`, `Opportunity`, `Property`, `Visit`, `RentalContract`
via `services/` — see [architecture.md](../architecture.md#data-flow).

## Business rules

### Commercial reports

New contacts, opportunities by state, completed operations, properties
added, visits completed.

### Rental administration reports

Active contracts, contracts with debt, upcoming expirations, upcoming
adjustments.

### Filters

Period, branch, agent, where applicable to the report.

## Statuses and states

Reuses statuses/stages defined in the source entities' module docs (no
report-specific status vocabulary).

## Role / permission considerations

Access must eventually respect user permissions — a report should not leak
data a role couldn't otherwise see (e.g. an agent should not see agency-wide
financials through a report if they can't see it on the dashboard). Pending
open question 6.

## Desktop behavior

Table-first, with a chart where it adds clarity (reuse Recharts patterns
from [dashboard.md](dashboard.md)).

## Mobile behavior

Simplified single-metric or card-based views rather than dense tables — see
[ui-design-system.md](../ui-design-system.md#responsive-behavior).

## Prototype behavior

Computed on the fly from mock data; no persisted report configuration.

## Future behavior

Export (CSV/PDF), scheduled reports, and deeper analytics are potential
future requirements, not part of Prototype v1.

## Out of scope

A full BI/analytics platform; custom report builder; data warehouse.

## Open questions

Role permissions (6); branch operation (5).

## Notes for future AI agents

If a request starts to look like "let the user build their own report,"
that's BI-platform territory and out of scope — redirect to the fixed
report list above unless the user explicitly expands scope.
