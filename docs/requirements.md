# Requirements

Scope: **Prototype v1**, frontend-only. See
[prototype-scope.md](prototype-scope.md) for demo flows and
[architecture.md](architecture.md) for technical constraints.

## Functional requirements

Grouped by module. IDs are stable identifiers for future reference, not an
exhaustive task breakdown — see [tasks.md](tasks.md) for the milestone plan.

### Dashboard (`FR-DASH`)

- **FR-DASH-001** — Show operational metric cards (new contacts, properties
  added, managed rentals, completed operations) instead of financial
  revenue.
- **FR-DASH-002** — Show a "requires attention" panel (stale contacts/
  opportunities, expiring reservations, contracts expiring ≤90 days,
  upcoming adjustments).
- **FR-DASH-003** — Show upcoming visits and a portfolio status summary.
- **FR-DASH-004** — Dashboard content adapts to the signed-in role (see
  [modules/dashboard.md](modules/dashboard.md#role-aware-dashboard)).
  *Planned: a fully role-driven widget system; Prototype v1 may hardcode
  role-based visibility rather than build a generic widget engine.*

### Rental administration (`FR-RENT`)

- **FR-RENT-001** — Rental overview listing ~100 contracts with property,
  tenant, current rent, next adjustment, expiration, and status.
- **FR-RENT-002** — Contract detail with property/owner/tenant relationship,
  financial conditions, and adjustment configuration.
- **FR-RENT-003** — Expiration alerts at 90/60/30-day severity bands (see
  [modules/contracts.md](modules/contracts.md#expiration-alerts)).
- **FR-RENT-004** — Monthly charges per contract (rent, expensas, ABL, AYSA,
  electricity, gas, interest, other) with paid/outstanding/partial/credit
  status.
- **FR-RENT-005** — Mock payment registration against a contract/charges.
- **FR-RENT-006** — Receipt preview/print for a recorded payment.
- **FR-RENT-007** — Owner settlement preview (rent collected, fee,
  deductions, net to owner).
- **FR-RENT-008** — Simulated IPC/ICL/manual adjustment calculation
  (no live INDEC/BCRA data).
- **FR-RENT-009** — Simulated AI contract upload flow: upload PDF → mocked
  extraction → human-reviewed pre-filled form → explicit confirmation.
  *No AI SDK or real PDF parsing in Prototype v1.*

### Properties (`FR-PROP`)

- **FR-PROP-001** — Property list, card, and map views over one shared
  dataset.
- **FR-PROP-002** — Property detail (gallery, address, type, operation,
  price, surface, rooms, owner, description, status) with tabs (Resumen,
  Comercial, Visitas, Documentos, Historial).
- **FR-PROP-003** — Interactive map (React Leaflet + OpenStreetMap tiles),
  filterable by operation/status, with marker preview linking to detail.

### Contacts (`FR-CONTACT`)

- **FR-CONTACT-001** — Single contact record supporting multiple concurrent
  roles (prospect, tenant, buyer, owner, seller).
- **FR-CONTACT-002** — Contact detail shows related opportunities,
  properties, visits, contracts, notes, and activity history.

### Commercial / CRM (`FR-CRM`)

- **FR-CRM-001** — Opportunity as a distinct entity from Contact, with type,
  status, budget, preferences, and next action.
- **FR-CRM-002** — Buyer/tenant pipeline (Nueva → Contactado → Propiedades
  seleccionadas → Visita → Negociación → Reserva → Cerrada, or Perdida).
- **FR-CRM-003** — Owner acquisition workflow (Nueva consulta → Contacto →
  Tasación → Captación → Propiedad publicada → Operación).
- **FR-CRM-004** — Visit scheduling connecting contact, property, agent,
  date/time, status, notes, outcome; agenda and list views.
- **FR-CRM-005** — Visit outcome feeds back into the related opportunity.

### Reports (`FR-REPORT`)

- **FR-REPORT-001** — Basic commercial reports (new contacts, opportunities
  by state, completed operations, properties added, visits completed).
- **FR-REPORT-002** — Basic rental reports (active contracts, contracts with
  debt, upcoming expirations, upcoming adjustments).
- **FR-REPORT-003** — Filter reports by period, branch, and agent where
  applicable.

### Settings (`FR-SET`)

- **FR-SET-001** — Organization, branches, users, roles, and preferences
  screens.
- **FR-SET-002** — Documented (non-functional) placeholders for WhatsApp,
  integrations, and notifications, clearly labeled as future.

## Non-functional requirements

- **Responsive behavior** — desktop, tablet, and mobile are first-class;
  complex tables become cards on mobile, not compressed. See
  [ui-design-system.md](ui-design-system.md#responsive-behavior).
- **Usability** — small main navigation, progressive disclosure, real-estate
  terminology in the UI (Spanish labels).
- **Role-aware visibility** — data shown must respect the signed-in role's
  scope; financial data is not globally visible by default.
- **Maintainability** — UI goes through a service layer, not direct imports
  of mock arrays (see [architecture.md](architecture.md#data-flow)); avoid
  overengineering (no config for values that never change, no interfaces
  with a single implementation).
- **Multi-organization awareness** — business entities are modeled with
  `organizationId` (and `branchId` where relevant) even though real
  multi-tenant isolation is a future backend concern.
- **Performance** — prototype-appropriate only: fast local interactions over
  a mock/local dataset; no large-scale performance engineering required.
- **Accessibility basics** — sufficient color contrast, keyboard-navigable
  interactive elements, semantic HTML, labeled form fields.
- **Data privacy direction** — no real personal/financial data in the
  prototype; demo data must be fictional.

## Out of scope (Prototype v1)

See the full list in [prototype-scope.md](prototype-scope.md#explicitly-out-of-scope-for-prototype-v1).
Summary: production backend, MySQL, Prisma, real auth/authorization, real
multi-tenant isolation, real WhatsApp/AI/IPC/ICL/BCRA/INDEC/Google
Calendar/Google Maps/ARCA integrations, full accounting or cash management,
bank reconciliation, digital signatures, tenant/owner portals, automatic
portal publishing, legal/notary workflows.

## Open questions

These are preserved intentionally — do not invent answers when implementing
against them. Reference them by number from module docs.

1. **Expense responsibility** — how responsibility for rent, ABL, AYSA,
   electricity, gas, expensas, extraordinary expenses, repairs, and other
   concepts is assigned, and whether it varies by contract.
2. **Owner settlement rules** — administration fee calculation
   (percentage vs. fixed), deductions, repairs, taxes, exceptional charges,
   settlement timing.
3. **Mandatory rental-contract fields** — which fields Fernández López
   requires operationally/legally beyond the prototype model in
   [data-model.md](data-model.md#rentalcontract).
4. **Commercial terminology** — preferred pipeline stage names (e.g.
   Consulta / Visita / Reserva / Cierre vs. the proposed pipeline in
   [modules/opportunities.md](modules/opportunities.md)).
5. **Branch operation** — which records belong to one branch vs. are
   cross-branch visible, whether agents operate across branches.
6. **Role permissions** — the initial role matrix in this document is
   proposed, not validated production policy.
