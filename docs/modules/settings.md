# Settings (Configuración)

## Objective

Manage organization, branch, user, role, and preference configuration; hold
clearly-labeled placeholders for future integrations.

## Users

`ADMIN` gets full read/write access. `MANAGER` gets read access to every
section plus edit rights on Preferencias (personal, not organizational
data) — organization/branch/user edits stay `ADMIN`-only.
`ADMINISTRATION`/`AGENT` have no access at all: `/settings` shows an
access-restricted message instead of the module, per
[requirements.md open question 6](../requirements.md#open-questions).

## Main concepts

```text
Inmobiliaria
Sedes
Usuarios
Roles
Preferencias
Integraciones
```

Plus documented (non-functional) future placeholders inside Integraciones:

```text
WhatsApp
Email
Google Calendar
Portales inmobiliarios
ARCA
Notificaciones
```

## Main screens

Implemented in Milestone 6 as nested routes under `/settings`
(`SettingsLayout` + a `NavLink` sub-nav, mirroring `AdministrationLayout`'s
pattern):

```text
/settings                  Inmobiliaria (index route)
/settings/branches         Sedes
/settings/users            Usuarios
/settings/roles            Roles (read-only matrix)
/settings/preferences      Preferencias + Zona de demostración
/settings/integrations     Integraciones + Notificaciones (placeholders)
```

## Primary actions

- Edit organization (`Inmobiliaria`) details.
- Create/edit/activate/deactivate a branch (`Sede`).
- Create/edit/activate/deactivate a user and assign a role + sede principal.
- View the role matrix (read-only).
- Edit preferences (tema, vista inicial de propiedades, formato de fecha,
  moneda predeterminada).
- Restore demo data (`Zona de demostración`).

## Main flows

Admin opens `Configuración` → selects a section → edits/creates a record.

## Entities and data

`Organization`, `Branch`, `User` — see [data-model.md](../data-model.md).
All three now have real CRUD services (`organization-service.ts`,
`user-service.ts`), `localStorage`-backed like every other module.

## Business rules

- **Inmobiliaria** — organization identity/details (nombre comercial,
  teléfono, email, dirección, zona horaria, moneda predeterminada, CUIT) via
  `updateOrganization()`. Shows the current branding (compact `FL` mark,
  full "Fernández López & Asociados" wordmark, primary color swatch) as a
  read-only preview — no upload/storage infrastructure, per
  [prototype-scope.md](../prototype-scope.md).
- **Sedes** — branch CRUD via `createBranch`/`updateBranch`/
  `setBranchStatus`. Deactivating never deletes a branch (contracts/
  properties keep referencing it by `branchId`) — status only.
- **Usuarios** — user CRUD via `createUser`/`updateUser`/`setUserStatus`.
  No real invitations, no passwords, no auth provider — just name, email,
  role, sede principal, estado.
- **Roles** — read-only view of the four roles (`ROLE_LABELS`) plus a
  read-only permission matrix (`RoleMatrix` component, data in
  `settings-labels.ts#ROLE_MATRIX`) — a static table, not a permission
  editor (see [Out of scope](#out-of-scope)).
- **Preferencias** — tema (delegates to the existing `ThemeProvider`), vista
  inicial de propiedades (reuses the Properties page's own "last used view"
  `localStorage` key via `lib/property-view-preference.ts` rather than a
  second, competing preference), formato de fecha, moneda predeterminada
  (`preferences-service.ts`, `fl.settings.preferences`).
- **WhatsApp / Email / Google Calendar / Portales / ARCA / Notificaciones**
  — rendered as disabled cards labeled "No configurado"/"Próximamente" —
  see [Out of scope](#out-of-scope).
- **Zona de demostración** — `Restaurar datos de demostración` button
  (confirmation required) clears every `localStorage` key under the `fl.`
  prefix and reloads (`lib/demo-reset.ts#resetDemoData()`). Every service in
  the app already persists under that prefix (`fl.crm.*`, `fl.administration.*`,
  `fl.settings.*`, `fl.session.*`, `fl.theme`, `fl.properties.view`), so this
  restores every module's seed data in one step without an explicit
  per-entity list to maintain, and never touches non-`fl.` browser storage.

## Statuses and states

`Branch.status`/`User.status`: `active | inactive`.

## Role / permission considerations

Settings as a whole is the most `ADMIN`-gated module — enforced via the same
`can(role, capability)` helper the Reports module uses
(`src/lib/permissions.ts`), not ad hoc role conditionals. `settings.view`
gates the whole module (`ADMIN`/`MANAGER`); `settings.organization.edit`/
`settings.branches.edit`/`settings.users.edit` are `ADMIN`-only, so
`MANAGER` sees every section but forms render read-only (no Save/Create/
Editar controls) outside Preferencias.

## Desktop behavior

Sub-nav tabs + table (Sedes/Usuarios), form panels for Inmobiliaria/
Preferencias, `Sheet` panels for create/edit (`BranchFormSheet`,
`UserFormSheet`).

## Mobile behavior

Sub-nav scrolls horizontally; Sedes/Usuarios render as stacked cards
instead of squeezed tables — see
[ui-design-system.md](../ui-design-system.md#responsive-behavior).

## Prototype behavior

Mock organization/branches/users, `localStorage`-persisted edits. Because
`useSession()`'s `organization`/`branches` are captured once at app mount
(see [architecture.md known gaps](../architecture.md#known-gaps)), Settings
pages keep their own local state (fetched fresh, updated after each
mutation) rather than depending on that frozen session copy — edits made in
Settings are correct on the Settings pages themselves, but a still-open
`TopBar`/`BranchSelector` elsewhere in the app won't reflect them until a
reload. Acceptable prototype limitation, not revisited this milestone.
Integration placeholders render as disabled/"coming soon" UI, not
functional toggles.

## Future behavior

Real WhatsApp, integrations, and notification delivery — explicitly future,
not started.

## Out of scope

Any real external integration; complex configurable RBAC/ABAC — see
[architecture.md](../architecture.md#permission-architecture-direction). The
role matrix is a static read-only summary, not an editable permission
engine.

## Open questions

Role permissions (6); branch operation (5).

## Notes for future AI agents

Never wire the WhatsApp/Integraciones/Notificaciones placeholders to a real
API "since the UI is already there" — they exist to communicate future
scope to the client during the demo, not as a partially-done feature to
finish. When adding a new persisted setting, follow the `fl.` key prefix
convention so `resetDemoData()` keeps covering it automatically — don't
special-case a new key into the reset function.
