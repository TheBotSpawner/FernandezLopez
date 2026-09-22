import { useEffect, useState } from 'react'
import { useSession } from '@/app/session-context'
import { getSettlements } from '@/services/owner-settlement-service'
import { currentPeriod } from './account-utils'
import type { OwnerSettlement, SettlementStatus } from '@/types/contract-account'

export interface SettlementFiltersState {
  period: string | 'all'
  status: SettlementStatus[]
}

const DEFAULT_FILTERS: SettlementFiltersState = {
  period: 'all',
  status: [],
}

export function useSettlementList() {
  const { user, branchScope } = useSession()
  const effectiveBranch = user.role === 'ADMIN' || user.role === 'MANAGER' ? branchScope : user.branchId

  const [filters, setFilters] = useState<SettlementFiltersState>(DEFAULT_FILTERS)
  const [settlements, setSettlements] = useState<OwnerSettlement[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getSettlements({
      branchId: effectiveBranch,
      period: filters.period === 'all' ? undefined : filters.period,
      status: filters.status.length ? filters.status : undefined,
    }).then((result) => {
      if (cancelled) return
      setSettlements(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [effectiveBranch, filters.period, filters.status, refreshToken])

  const activeFilterCount = (filters.period !== 'all' ? 1 : 0) + filters.status.length

  function clearFilters() {
    setFilters(DEFAULT_FILTERS)
  }

  return {
    filters,
    setFilters,
    settlements,
    loading,
    activeFilterCount,
    clearFilters,
    refetch: () => setRefreshToken((t) => t + 1),
    currentPeriod: currentPeriod(),
  }
}
