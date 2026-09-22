import { useEffect, useState } from 'react'
import { useSession } from '@/app/session-context'
import { getContracts } from '@/services/rental-contract-service'
import { getDebtorContractIds } from '@/services/contract-charge-service'
import { daysUntilAdjustment } from './adjustment-utils'
import { expirationSeverity } from './expiration-utils'
import type { RentalContract } from '@/types/rental-contract'

export interface AdministrationOverview {
  activeCount: number
  upcomingAdjustmentsCount: number
  expiringWithin90Count: number
  withDebtCount: number
  expiredCount: number
  draftCount: number
  upcomingAdjustments: RentalContract[]
  expiringSoon: RentalContract[]
}

export function useAdministrationOverview() {
  const { user, branchScope } = useSession()
  const effectiveBranch = user.role === 'ADMIN' || user.role === 'MANAGER' ? branchScope : user.branchId

  const [overview, setOverview] = useState<AdministrationOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getContracts({ branchId: effectiveBranch }).then((contracts) => {
      if (cancelled) return

      const active = contracts.filter((c) => c.status === 'ACTIVE')
      const upcomingAdjustments = active
        .filter((c) => {
          const days = daysUntilAdjustment(c.nextAdjustmentDate)
          return days != null && days >= 0 && days <= 30
        })
        .sort((a, b) => (daysUntilAdjustment(a.nextAdjustmentDate) ?? 0) - (daysUntilAdjustment(b.nextAdjustmentDate) ?? 0))
      const expiringSoon = active
        .filter((c) => expirationSeverity(c.endDate) !== 'normal')
        .sort((a, b) => a.endDate.localeCompare(b.endDate))

      const debtorIds = getDebtorContractIds()
      const withDebtCount = active.filter((c) => debtorIds.has(c.id)).length

      // A property with a newer ACTIVE/UPCOMING contract was already renewed — its
      // EXPIRED record is just history, not something admin needs to act on. Only
      // count a genuinely lapsed contract (no replacement) as needing attention.
      const supersededPropertyIds = new Set(
        contracts.filter((c) => c.status === 'ACTIVE' || c.status === 'UPCOMING').map((c) => c.propertyId),
      )
      const lapsedCount = contracts.filter((c) => c.status === 'EXPIRED' && !supersededPropertyIds.has(c.propertyId)).length

      setOverview({
        activeCount: active.length,
        upcomingAdjustmentsCount: upcomingAdjustments.length,
        expiringWithin90Count: expiringSoon.length,
        withDebtCount,
        expiredCount: lapsedCount,
        draftCount: contracts.filter((c) => c.status === 'DRAFT').length,
        upcomingAdjustments: upcomingAdjustments.slice(0, 5),
        expiringSoon: expiringSoon.slice(0, 5),
      })
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [effectiveBranch])

  return { overview, loading }
}
