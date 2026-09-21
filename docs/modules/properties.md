# Properties (Propiedades)

## Objective

Provide a single source of truth for every property the agency manages,
sells, or rents, across list, card, and map views.

## Users

All roles; `AGENT` for day-to-day commercial use, `ADMIN`/`MANAGER` for
oversight, `ADMINISTRATION` for the property behind an active rental
contract.

## Main concepts

One `Property` record powers three views (list, cards, map) — never
maintain separate datasets per view. See
[data-model.md](../data-model.md#property) for fields.

## Main screens

- **Lista** — dense table (desktop) / cards (mobile).
- **Tarjetas** — card grid with photo, price, key facts.
- **Mapa** — see [Map behavior](#map-behavior).
- **Detalle** — see [Property detail](#property-detail).

## Primary actions

- Search (address, neighborhood, reference code — accent-insensitive) and
  filter (operation, status, property type, neighborhood, price range) the
  portfolio; sort by recency, price, or interest.
- Switch between Lista / Tarjetas / Mapa — the last-used view persists via
  `localStorage`; filters do not (they reset on navigating away).
- Open property detail.
- (From detail) browse photos, see related commercial/visit/document/history
  context — all read-only in Prototype v1. **Editar, Registrar visita, Crear
  oportunidad, and Cambiar estado are shown as disabled quick actions**, not
  wired to anything, to avoid implying functionality this milestone doesn't
  build. A "Nueva propiedad" create flow was intentionally skipped —
  optional per scope, and out of the stated browsing/detail/map priority.

## Main flows

Feeds [Flow A](../prototype-scope.md#flow-a--commercial-inquiry) (property
selection) and [Flow B](../prototype-scope.md#flow-b--owner-acquisition)
(a property is the output of the acquisition workflow).

## Entities and data

`Property`, plus related `Contact` (owners), `Opportunity`, `Visit`,
`RentalContract` — see [data-model.md](../data-model.md#property).

## Business rules

### Property types

Apartment, house, PH, commercial property, office, parking, land, other —
Spanish labels in the UI (e.g. *Departamento, Casa, PH, Local comercial,
Oficina, Cochera, Terreno, Otro*).

### Operation types

For sale, for rent — a property may be both simultaneously.

### Property status

Available, reserved, rented, sold, paused, under valuation (*Disponible,
Reservada, Alquilada, Vendida, Pausada, En tasación*).

### Property views

Lista, Tarjetas, Mapa — same underlying dataset and filters apply across
all three (see [Main concepts](#main-concepts)).

### Property detail

Rich, scannable: photo gallery, address, neighborhood, property type,
operation type, price, surface, rooms, bedrooms, bathrooms, owner,
description, current status. Implemented tabs:

```text
Resumen
Comercial
Visitas
Documentos
Historial
```

`Resumen` shows description, key fields, owner (linked to the matching
`Contact` when one exists — see [contacts.md](contacts.md)), and a
single-marker location map. As of Milestone 3, `Comercial` and `Visitas`
are real-data tabs: `Comercial` lists the property's linked
`Opportunity` records (`getOpportunitiesByProperty()`) with
active/closed counts; `Visitas` lists its `Visit` records
(`getVisitsByProperty()`) via the shared `VisitListItem` component. The
property's static `interest` field (consultas, oportunidades activas,
visitas este mes) is **not** read by these tabs anymore — it still powers
the Properties "Mayor interés" sort and the property-card inquiries badge,
unchanged from Milestone 2 (a known inconsistency, not revisited this
milestone). `Documentos` and `Historial` are **derived at render time**
from the property's own fields (`property-detail-derivations.ts`), not
separately stored records — e.g. history always includes "Propiedad
ingresada" from `createdAt`, plus a status-change entry when `updatedAt`
differs.

### Map behavior

React Leaflet + Leaflet + OpenStreetMap tiles — no Google Maps dependency
for Prototype v1. Properties expose `latitude`/`longitude` where available;
the map only renders markers for properties with valid coordinates and
shows an explicit empty state otherwise. The map uses the *same* filtered/
sorted result set as Lista and Tarjetas — there is no map-specific filter
UI, filtering happens once in the shared toolbar. Marker color follows the
same status semantic tokens as everywhere else. Clicking a marker opens a
Leaflet popup (image, address, neighborhood, operation + status badges,
price, "Ver propiedad" link) — not a separate bottom sheet. The map fits
its bounds to the currently visible markers.

## Statuses and states

See [Property status](#property-status) above — reused everywhere a
property status badge appears (list, cards, map markers, detail).

## Role / permission considerations

All roles can view properties; edit/ownership actions likely restricted to
`AGENT` (assigned), `ADMIN`, `MANAGER` — exact matrix pending open question
6.

## Desktop behavior

Lista as a full table; Tarjetas as a multi-column grid; Mapa full-height.

## Mobile behavior

Lista and Tarjetas both render as the same two-column card grid on mobile
(no compressed table); Mapa remains usable full-screen, and tapping a
marker opens the same Leaflet popup used on desktop. Filters open in a
full-height sheet with touch-friendly toggle chips and explicit
`Limpiar`/`Aplicar filtros` actions.

## Prototype behavior

95 mock properties (`src/mocks/properties.ts`) — 4 hand-authored "featured"
listings shared with the dashboard, 41 seeded-random generated ones from
Milestone 2, plus 50 more rent-only generated properties
(`prop-rental-N`) added in Milestone 4. That last batch exists purely to
back a realistic ~100-contract managed-rental book (see
[data-model.md](../data-model.md#rentalcontract)) — only 24 of the
original 45 properties have `operationTypes` including `rent`, not enough
to link ~100 rental contracts without unrealistic same-property renewal
stacking. The Resumen tab shows a read-only "Contrato de alquiler" card
when the property has an active `RentalContract`
(`getActiveContractForProperty()`), linking to
[contract detail](contracts.md). No create/edit exists for properties
themselves in Prototype v1 (see
[prototype-scope.md](../prototype-scope.md#recommended-demo-data-scenarios));
only the selected view mode (Lista/Tarjetas/Mapa) persists via
`localStorage` — filters reset on navigation.

## Future behavior

Automatic publishing to external property portals is explicitly future/out
of scope — see below.

## Out of scope

Modeling every field used by public property portals; automatic
property-portal publishing (see
[prototype-scope.md](../prototype-scope.md#explicitly-out-of-scope-for-prototype-v1)).

## Open questions

Role/permission matrix (6); branch visibility of properties (5).

## Notes for future AI agents

Do not fork the property dataset per view (e.g. a separate "map properties"
mock array) — list, cards, and map must read from the same `services/`
function; the dashboard's property widgets also read from
`property-service.ts` now, not a separate mock.

When the real Opportunities module (Milestone 3) is built, the Comercial
tab's `interest` counters should likely become derived from real
`Opportunity`/`Visit` records scoped to the property, rather than staying a
static mock field on `Property` — treat the current `interest` object as a
placeholder for that, not a field to keep hand-editing indefinitely.

The quick action buttons on property detail (Editar, Registrar visita, Crear
oportunidad, Cambiar estado) are intentionally disabled. Wiring one up is a
different module's milestone (editing → this module later; visit/opportunity
creation → Milestone 3) — don't quietly enable one without that context.
