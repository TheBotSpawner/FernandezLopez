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

- Filter/search properties.
- Switch between Lista / Tarjetas / Mapa.
- Open property detail.
- (From detail) manage photos, see related contacts/opportunities/visits/
  contract.

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
description, current status. Suggested tabs:

```text
Resumen
Comercial
Visitas
Documentos
Historial
```

Related data shown: interested contacts, opportunities, visits, active
rental contract, activity history.

### Map behavior

React Leaflet + Leaflet + OpenStreetMap tiles — no Google Maps dependency
for Prototype v1. Properties expose `latitude`/`longitude` where available.
Filterable by sale/rent/available/reserved/rented. Selecting a marker shows
a compact preview and links to the property detail.

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

Lista and Tarjetas both render as a single-column card list on mobile (no
compressed table); Mapa remains usable full-screen with a bottom sheet for
the selected property preview.

## Prototype behavior

Mock property dataset (see
[prototype-scope.md](../prototype-scope.md#recommended-demo-data-scenarios)),
edits persisted via `localStorage`.

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
function.
