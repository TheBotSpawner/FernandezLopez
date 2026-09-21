import { useEffect, useState } from 'react'
import { useSession } from '@/app/session-context'
import { getVisits } from '@/services/visit-service'
import type { Visit, VisitStatus } from '@/types/visit'

export interface VisitFiltersState {
  assignedUserId: string | 'all'
  status: VisitStatus[]
}

const DEFAULT_FILTERS: VisitFiltersState = {
  assignedUserId: 'all',
  status: [],
}

export function useVisitList() {
  const { user, branchScope } = useSession()
  const effectiveBranch = user.role === 'ADMIN' || user.role === 'MANAGER' ? branchScope : user.branchId

  const [filters, setFilters] = useState<VisitFiltersState>(DEFAULT_FILTERS)
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getVisits({
      branchId: effectiveBranch,
      assignedUserId: filters.assignedUserId === 'all' ? undefined : filters.assignedUserId,
      status: filters.status.length ? filters.status : undefined,
    }).then((result) => {
      if (cancelled) return
      setVisits(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [effectiveBranch, filters.assignedUserId, filters.status, refreshToken])

  const activeFilterCount = (filters.assignedUserId !== 'all' ? 1 : 0) + filters.status.length

  function clearFilters() {
    setFilters(DEFAULT_FILTERS)
  }

  return {
    filters,
    setFilters,
    visits,
    loading,
    activeFilterCount,
    clearFilters,
    refetch: () => setRefreshToken((t) => t + 1),
  }
}
