import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getBranches, getOrganization } from '@/services/organization-service'
import { getDefaultUser, getDemoUserForRole } from '@/services/user-service'
import type { Branch, Organization, User, UserRole } from '@/types/session'

const BRANCH_SCOPE_STORAGE_KEY = 'fl.session.branchScope'
const ROLE_STORAGE_KEY = 'fl.session.role'

interface SessionContextValue {
  organization: Organization
  branches: Branch[]
  user: User
  /** Selected branch scope for dashboards/lists — 'all' means every branch. */
  branchScope: string | 'all'
  setBranchScope: (branchId: string | 'all') => void
  /** Dev/demo-only role switcher — there is no real authentication yet. */
  setRole: (role: UserRole) => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

function readStoredBranchScope(): string | 'all' {
  try {
    return localStorage.getItem(BRANCH_SCOPE_STORAGE_KEY) ?? 'all'
  } catch {
    return 'all'
  }
}

function readStoredRole(): UserRole | null {
  try {
    return (localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null) ?? null
  } catch {
    return null
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const organization = useMemo(() => getOrganization(), [])
  const branches = useMemo(() => getBranches(), [])

  const [role, setRole] = useState<UserRole>(() => readStoredRole() ?? getDefaultUser().role)
  const [branchScope, setBranchScope] = useState<string | 'all'>(readStoredBranchScope)

  const user = useMemo(() => getDemoUserForRole(role), [role])

  useEffect(() => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, role)
    } catch {
      // localStorage unavailable (private mode, etc.) — demo persistence is best-effort only.
    }
  }, [role])

  useEffect(() => {
    try {
      localStorage.setItem(BRANCH_SCOPE_STORAGE_KEY, branchScope)
    } catch {
      // ignore
    }
  }, [branchScope])

  const value = useMemo<SessionContextValue>(
    () => ({ organization, branches, user, branchScope, setBranchScope, setRole }),
    [organization, branches, user, branchScope],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within a SessionProvider')
  return ctx
}
