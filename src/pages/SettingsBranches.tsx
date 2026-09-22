import { useState } from 'react'
import { useSession } from '@/app/session-context'
import { BranchesSection } from '@/features/settings/components/BranchesSection'
import { can } from '@/lib/permissions'
import { getBranches } from '@/services/organization-service'
import { getDemoUsers } from '@/services/user-service'

export default function SettingsBranches() {
  const { user } = useSession()
  const [branches, setBranches] = useState(getBranches)

  return (
    <BranchesSection
      branches={branches}
      users={getDemoUsers()}
      canEdit={can(user.role, 'settings.branches.edit')}
      onChanged={setBranches}
    />
  )
}
