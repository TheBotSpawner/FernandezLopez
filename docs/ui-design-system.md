# UI Design System

Visual and interaction direction for the prototype, built on Tailwind CSS +
shadcn/ui. This document sets principles and tokens; it does not lock in
final Fernández López branding.

## Visual principles

- Modern, minimal, spacious, high readability.
- Rounded cards, subtle borders, subtle shadows, clear hierarchy.
- Restrained use of color — color communicates meaning (status), not
  decoration.
- Polished filters and dropdowns; side panels/sheets for contextual detail
  instead of always navigating away.
- Skeleton loading states, small motion transitions (Framer Motion) used
  sparingly.
- **The product must not feel overloaded.** Expose complexity
  progressively — a user should not see 15–20 nav options because the
  business domain is complex underneath.

## Layout principles

- Persistent app shell (sidebar + top bar on desktop) around routed page
  content.
- Page content: clear title/header, primary action top-right, filters below
  header, content area below.
- Prefer a side panel/sheet over a full-page navigation for
  create/edit-in-context flows (e.g. adding a note, scheduling a visit).

## Navigation

Top-level navigation is fixed and small:

```text
Inicio
Administración
Propiedades
Comercial
Contactos
Reportes
Configuración
```

Do not add new top-level items without a validated requirement — see
[requirements.md](requirements.md). Sub-navigation (tabs, secondary nav)
lives inside each module instead.

## Cards

Primary content container: rounded corners, subtle border and/or shadow,
generous internal padding. Used for dashboard metrics, property cards,
summary blocks.

## Tables

Desktop-only pattern for dense, scannable lists (contracts, contacts,
properties in list view). Sticky header, row hover state, status shown as a
badge (see [Badges/statuses](#badgesstatuses)), row click opens detail (or a
side panel).

## Filters

Compact filter bar above lists/tables: text search + a small number of
dropdown filters (status, type, branch, agent, period). Avoid exposing every
possible field as a filter — see [Visual principles](#visual-principles).

## Side panels

Used for focused create/edit/detail interactions that don't warrant leaving
the current list context (e.g. quick contact edit, visit scheduling,
opportunity quick view). Prefer a side panel over a modal when the content
is substantial or benefits from keeping the list visible.

## Modals/dialogs

Reserved for short, blocking interactions: confirmations, small forms,
destructive-action confirmations. Not used for content-heavy flows (those
get a side panel or a route).

## Badges/statuses

Status is always shown as a colored badge using [semantic colors](#semantic-colors),
never a bare color swatch or inline style. One status vocabulary per entity
(contract status, opportunity stage, visit status, property status, charge
status) — do not invent ad hoc colors per screen.

## Typography

System font stack via Tailwind defaults (see `src/index.css` for the
current `--font-sans` token). Clear scale: page title > section heading >
body > caption. Avoid more than 3–4 type sizes on one screen.

## Spacing

Tailwind's default spacing scale. Generous whitespace between sections;
consistent internal card padding.

## Border-radius philosophy

One consistent radius scale (shadcn's `--radius` token family already
defined in `src/index.css`) applied uniformly to cards, inputs, buttons, and
badges — no per-component custom radii.

## Shadows

Subtle only — used to lift cards and panels off the background, not for
heavy drop-shadow decoration.

## Semantic colors

Defined as CSS variables in `src/index.css` and consumed through Tailwind,
never hardcoded hex values in components:

```text
background, foreground
card, card-foreground
primary, primary-foreground
muted, muted-foreground
border

success, warning, danger, info
```

Business meaning mapping (used consistently across modules):

| Token | Meaning |
|---|---|
| `success` | current / paid |
| `danger` | debt / overdue |
| `info` | credit balance / informational |
| `warning` | upcoming action / expiration |

**Final Fernández López brand colors are not yet defined.** The current
palette in `src/index.css` is a neutral shadcn default and must remain
easy to swap — do not hardcode brand-specific hex values across components.

## Loading states

Skeleton placeholders matching the shape of the content being loaded (card
skeleton, table-row skeleton), not spinners, for primary content areas.
Spinners are acceptable for small inline actions (button submit state).

## Empty states

Every list/table has a designed empty state: short explanation + a primary
action when applicable (e.g. "No hay contactos todavía — Agregar contacto").
Never show a bare empty table.

## Hover/focus behavior

All interactive elements have a visible hover state and a keyboard-visible
focus state (accessibility baseline). Table rows and cards that are
clickable show a hover affordance.

## Motion principles

Small, purposeful transitions only (page/panel enter-exit, subtle hover
lift). No looping or decorative animation. Respect
`prefers-reduced-motion`.

## Desktop / tablet / mobile behavior

### Desktop
Full sidebar, larger tables, multi-column dashboards, rich property
layouts.

### Tablet
Collapsible navigation, reduced multi-column layouts (2 columns instead of
3-4).

### Mobile
Compact navigation (e.g. bottom nav or collapsible drawer), **cards instead
of wide tables**, touch-friendly actions, information prioritized by
relevance — not a shrunk version of the desktop table.

Example mobile rental card:

```text
Monroe 2450 · 4°A

Juan Pérez
$650.000

Próximo ajuste
01/10

Vencimiento
31/01/27

Debe $56.800
```

## Property imagery

Photo galleries use a consistent aspect ratio and a lightweight lightbox/
carousel; a placeholder image/pattern is shown when a property has no
photos yet (never a broken image).

## Chart usage

Recharts, used sparingly: one clear chart per insight (e.g. "Nuevos
contactos — últimos 6 meses"), semantic colors for any status-based series,
no 3D or decorative chart types.

## Map usage

React Leaflet + Leaflet + OpenStreetMap tiles (no Google Maps dependency for
Prototype v1). Markers colored by property status using the same semantic
tokens as everywhere else; marker click shows a compact preview linking to
the property detail — see [modules/properties.md](modules/properties.md#map-behavior).
