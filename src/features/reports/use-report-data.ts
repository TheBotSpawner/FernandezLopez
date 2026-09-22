import { useEffect, useState } from 'react'
import { getAdministrationReport, getCommercialReport, getPropertyReport } from '@/services/report-service'
import type { AdministrationReport, CommercialReport, PropertyReport, ReportScope } from '@/types/report'

export function useCommercialReport(scope: ReportScope, allBranchIds: string[], enabled: boolean) {
  const [data, setData] = useState<CommercialReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    getCommercialReport(scope, allBranchIds).then((result) => {
      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, scope.period, scope.branchId, scope.assignedUserId, scope.userId, scope.role])

  return { data, loading }
}

export function usePropertyReport(scope: ReportScope, enabled: boolean) {
  const [data, setData] = useState<PropertyReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    getPropertyReport(scope).then((result) => {
      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [enabled, scope.period, scope.branchId])

  return { data, loading }
}

export function useAdministrationReport(scope: ReportScope, includeFinancials: boolean, enabled: boolean) {
  const [data, setData] = useState<AdministrationReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    getAdministrationReport(scope, includeFinancials).then((result) => {
      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [enabled, scope.period, scope.branchId, includeFinancials])

  return { data, loading }
}
