import { useEffect, useState } from 'react'
import { useSession } from '@/app/session-context'
import { getContracts } from '@/services/rental-contract-service'
import { daysUntilAdjustment } from './adjustment-utils'
import { expirationSeverity } from './expiration-utils'
import type { RentalContract } from '@/types/rental-contract'

export interface AdministrationOverview {
  activeCount: number
  upcomingAdjustmentsCount: number
  expiringWithin90Count: number
  /**
   * ponytail: temporary seeded placeholder (12% of active contracts) — real
   * monthly charges/payments arrive in Milestone 5, which should replace this
   * with an actual outstanding-balance count.
   */
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

      setOverview({
        activeCount: active.length,
        upcomingAdjustmentsCount: upcomingAdjustments.length,
        expiringWithin90Count: expiringSoon.length,
        withDebtCount: Math.round(active.length * 0.12),
        expiredCount: contracts.filter((c) => c.status === 'EXPIRED').length,
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
