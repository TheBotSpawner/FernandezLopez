import { useEffect, useState } from 'react'
import { useSession } from '@/app/session-context'
import { getContacts } from '@/services/contact-service'
import type { Contact, ContactQuery, ContactRole } from '@/types/contact'

export type ActivityFilter = 'all' | 'week' | 'month'

export interface ContactFiltersState {
  search: string
  roles: ContactRole[]
  assignedUserId: string | 'all'
  activity: ActivityFilter
}

const DEFAULT_FILTERS: ContactFiltersState = {
  search: '',
  roles: [],
  assignedUserId: 'all',
  activity: 'all',
}

function activityThreshold(activity: ActivityFilter): string | null {
  if (activity === 'all') return null
  const date = new Date()
  date.setDate(date.getDate() - (activity === 'week' ? 7 : 30))
  return date.toISOString()
}

export function useContactList() {
  const { user, branchScope } = useSession()
  const effectiveBranch = user.role === 'ADMIN' || user.role === 'MANAGER' ? branchScope : user.branchId

  const [filters, setFilters] = useState<ContactFiltersState>(DEFAULT_FILTERS)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshToken, setRefreshToken] = useState(0)
  const refetch = () => setRefreshToken((token) => token + 1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const query: ContactQuery = {
      search: filters.search || undefined,
      branchId: effectiveBranch,
      roles: filters.roles.length ? filters.roles : undefined,
      assignedUserId: filters.assignedUserId === 'all' ? undefined : filters.assignedUserId,
    }
    getContacts(query).then((result) => {
      if (cancelled) return
      const threshold = activityThreshold(filters.activity)
      const filtered = threshold ? result.filter((contact) => contact.lastActivityAt >= threshold) : result
      setContacts(filtered)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [effectiveBranch, filters.search, filters.roles, filters.assignedUserId, filters.activity, refreshToken])

  const activeFilterCount =
    filters.roles.length + (filters.assignedUserId !== 'all' ? 1 : 0) + (filters.activity !== 'all' ? 1 : 0)

  function clearFilters() {
    setFilters((prev) => ({ ...DEFAULT_FILTERS, search: prev.search }))
  }

  return { filters, setFilters, contacts, loading, activeFilterCount, clearFilters, refetch }
}
