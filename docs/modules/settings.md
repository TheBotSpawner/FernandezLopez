# Settings (Configuración)

## Objective

Manage organization, branch, user, role, and preference configuration; hold
clearly-labeled placeholders for future integrations.

## Users

`ADMIN` primarily; `MANAGER` for a subset (e.g. branch preferences), per
open question 6.

## Main concepts

```text
Inmobiliaria
Sedes
Usuarios
Roles
Preferencias
```

Plus documented (non-functional) future placeholders:

```text
WhatsApp
Integraciones
Notificaciones
```

## Main screens

One screen per section above, standard form/list patterns.

## Primary actions

- Edit organization (`Inmobiliaria`) details.
- Create/edit a branch (`Sede`).
- Create/edit a user and assign a role.
- View role definitions.
- Edit preferences.

## Main flows

Admin opens `Configuración` → selects a section → edits/creates a record.

## Entities and data

`Organization`, `Branch`, `User` — see [data-model.md](../data-model.md).

## Business rules

- **Inmobiliaria** — organization-level identity/details (name, branding
  placeholder — see
  [ui-design-system.md](../ui-design-system.md#semantic-colors) on brand
  colors not being finalized).
- **Sedes** — branch CRUD.
- **Usuarios** — user CRUD, role assignment.
- **Roles** — read-only view of the four roles and their intended scope
  (`ADMIN`, `MANAGER`, `ADMINISTRATION`, `AGENT`) — see
  [product-overview.md](../product-overview.md).
- **Preferencias** — general app preferences (exact scope TBD, small and
  non-critical for Prototype v1).
- **WhatsApp / Integraciones / Notificaciones** — must be clearly
  documented and displayed as **future functionality**, not working
  integrations. No real integration is implemented.

## Statuses and states

N/A beyond standard active/inactive on users and branches, if needed.

## Role / permission considerations

Settings as a whole is the most `ADMIN`-gated module. Do not expose
organization- or user-management actions to `AGENT`/`ADMINISTRATION`.

## Desktop behavior

Standard settings layout: section nav + form/list content area.

## Mobile behavior

Section nav collapses into a simple list/drawer; forms stack vertically.

## Prototype behavior

Mock organization/branches/users; edits persisted via `localStorage`.
Integration placeholders render as disabled/"coming soon" UI, not
functional toggles.

## Future behavior

Real WhatsApp, integrations, and notification delivery — explicitly future,
not started.

## Out of scope

Any real external integration; complex configurable RBAC/ABAC — see
[architecture.md](../architecture.md#permission-architecture-direction).

## Open questions

Role permissions (6); branch operation (5).

## Notes for future AI agents

Never wire the WhatsApp/Integraciones/Notificaciones placeholders to a real
API "since the UI is already there" — they exist to communicate future
scope to the client during the demo, not as a partially-done feature to
finish.
