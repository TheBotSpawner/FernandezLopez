import { useSession } from '@/app/session-context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { UserRole } from '@/types/session'

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  ADMINISTRATION: 'Administración',
  AGENT: 'Agente comercial',
}

export function UserMenu() {
  const { user, setRole } = useSession()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-left outline-none hover:bg-muted">
        <Avatar className="size-8">
          <AvatarFallback>{user.avatarInitials}</AvatarFallback>
        </Avatar>
        <div className="hidden text-sm leading-tight sm:block">
          <p className="font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={user.role} onValueChange={(value) => setRole(value as UserRole)}>
          <DropdownMenuLabel>Ver como (demo)</DropdownMenuLabel>
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
            <DropdownMenuRadioItem key={role} value={role}>
              {ROLE_LABELS[role]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
