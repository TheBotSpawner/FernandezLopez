import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { NAV_ITEMS } from '@/components/layout/nav-items'
import AdministrationLayout from '@/pages/AdministrationLayout'
import AdministrationOverview from '@/pages/AdministrationOverview'
import CommercialLayout from '@/pages/CommercialLayout'
import ContactDetail from '@/pages/ContactDetail'
import Contacts from '@/pages/Contacts'
import ContractDetail from '@/pages/ContractDetail'
import Contracts from '@/pages/Contracts'
import Dashboard from '@/pages/Dashboard'
import Expirations from '@/pages/Expirations'
import ModulePlaceholder from '@/pages/ModulePlaceholder'
import OpportunityDetail from '@/pages/OpportunityDetail'
import Opportunities from '@/pages/Opportunities'
import PropertyDetail from '@/pages/PropertyDetail'
import Properties from '@/pages/Properties'
import Settlements from '@/pages/Settlements'
import Visits from '@/pages/Visits'

const PLACEHOLDER_DESCRIPTIONS: Record<string, string> = {
  '/reports': 'Reportes operativos comerciales y de administración.',
  '/settings': 'Inmobiliaria, sedes, usuarios, roles y preferencias.',
}

const HANDLED_PATHS = ['/', '/properties', '/commercial', '/contacts', '/administration']

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/properties', element: <Properties /> },
      { path: '/properties/:propertyId', element: <PropertyDetail /> },
      { path: '/contacts', element: <Contacts /> },
      { path: '/contacts/:contactId', element: <ContactDetail /> },
      {
        path: '/commercial',
        element: <CommercialLayout />,
        children: [
          { index: true, element: <Navigate to="opportunities" replace /> },
          { path: 'opportunities', element: <Opportunities /> },
          { path: 'opportunities/:opportunityId', element: <OpportunityDetail /> },
          { path: 'visits', element: <Visits /> },
        ],
      },
      {
        path: '/administration',
        element: <AdministrationLayout />,
        children: [
          { index: true, element: <AdministrationOverview /> },
          { path: 'contracts', element: <Contracts /> },
          { path: 'contracts/:contractId', element: <ContractDetail /> },
          { path: 'expirations', element: <Expirations /> },
          { path: 'settlements', element: <Settlements /> },
        ],
      },
      ...NAV_ITEMS.filter((item) => !HANDLED_PATHS.includes(item.path)).map((item) => ({
        path: item.path,
        element: (
          <ModulePlaceholder
            title={item.label}
            description={PLACEHOLDER_DESCRIPTIONS[item.path] ?? ''}
            icon={item.icon}
          />
        ),
      })),
    ],
  },
])
