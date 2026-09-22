import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import AdministrationLayout from '@/pages/AdministrationLayout'
import AdministrationOverview from '@/pages/AdministrationOverview'
import CommercialLayout from '@/pages/CommercialLayout'
import ContactDetail from '@/pages/ContactDetail'
import Contacts from '@/pages/Contacts'
import ContractDetail from '@/pages/ContractDetail'
import ContractReceipt from '@/pages/ContractReceipt'
import Contracts from '@/pages/Contracts'
import Dashboard from '@/pages/Dashboard'
import Expirations from '@/pages/Expirations'
import OpportunityDetail from '@/pages/OpportunityDetail'
import Opportunities from '@/pages/Opportunities'
import PropertyDetail from '@/pages/PropertyDetail'
import Properties from '@/pages/Properties'
import Reports from '@/pages/Reports'
import SettingsBranches from '@/pages/SettingsBranches'
import SettingsIntegrations from '@/pages/SettingsIntegrations'
import SettingsLayout from '@/pages/SettingsLayout'
import SettingsOrganization from '@/pages/SettingsOrganization'
import SettingsPreferences from '@/pages/SettingsPreferences'
import SettingsRoles from '@/pages/SettingsRoles'
import SettingsUsers from '@/pages/SettingsUsers'
import SettlementDetail from '@/pages/SettlementDetail'
import Settlements from '@/pages/Settlements'
import Visits from '@/pages/Visits'

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
          { path: 'contracts/:contractId/receipts/:receiptId', element: <ContractReceipt /> },
          { path: 'expirations', element: <Expirations /> },
          { path: 'settlements', element: <Settlements /> },
          { path: 'settlements/:settlementId', element: <SettlementDetail /> },
        ],
      },
      { path: '/reports', element: <Reports /> },
      {
        path: '/settings',
        element: <SettingsLayout />,
        children: [
          { index: true, element: <SettingsOrganization /> },
          { path: 'branches', element: <SettingsBranches /> },
          { path: 'users', element: <SettingsUsers /> },
          { path: 'roles', element: <SettingsRoles /> },
          { path: 'preferences', element: <SettingsPreferences /> },
          { path: 'integrations', element: <SettingsIntegrations /> },
        ],
      },
    ],
  },
])
