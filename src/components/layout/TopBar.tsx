import logo from '@/assets/fernandez-lopez-logo-800x800.png'
import { useSession } from '@/app/session-context'
import { BranchSelector } from './BranchSelector'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'

export function TopBar() {
  const { user, organization } = useSession()
  const canFilterByBranch = user.role === 'ADMIN' || user.role === 'MANAGER'

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <img src={logo} alt="" className="size-7 rounded-md" />
        <span className="text-sm font-semibold text-foreground">{organization.name}</span>
      </div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        {canFilterByBranch && <BranchSelector />}
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
