import { useEffect, useState } from 'react'
import { getDashboardData } from '@/services/dashboard-service'
import type { DashboardData } from '@/types/dashboard'
import type { UserRole } from '@/types/session'

interface UseDashboardDataResult {
  data: DashboardData | null
  loading: boolean
}

export function useDashboardData(branchId: string, role: UserRole, userId: string): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getDashboardData({ branchId, role, userId }).then((result) => {
      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [branchId, role, userId])

  return { data, loading }
}
