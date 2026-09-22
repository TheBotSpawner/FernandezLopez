import { useState } from 'react'
import { useSession } from '@/app/session-context'
import { OrganizationSettingsForm } from '@/features/settings/components/OrganizationSettingsForm'
import { can } from '@/lib/permissions'
import { getOrganization } from '@/services/organization-service'

export default function SettingsOrganization() {
  const { user } = useSession()
  // Local state, not useSession().organization: that copy is captured once at
  // app mount and would go stale after an edit here — see docs/architecture.md
  // known gaps for the same "frozen session snapshot" caveat on branches.
  const [organization, setOrganization] = useState(getOrganization)

  return (
    <OrganizationSettingsForm
      organization={organization}
      canEdit={can(user.role, 'settings.organization.edit')}
      onSaved={setOrganization}
    />
  )
}
