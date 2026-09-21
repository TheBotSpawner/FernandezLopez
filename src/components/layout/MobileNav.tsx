import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { MOBILE_PRIMARY_PATHS, NAV_ITEMS } from './nav-items'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const primaryItems = NAV_ITEMS.filter((item) => MOBILE_PRIMARY_PATHS.includes(item.path))
  const moreItems = NAV_ITEMS.filter((item) => !MOBILE_PRIMARY_PATHS.includes(item.path))
  const isMoreActive = moreItems.some((item) => item.path === location.pathname)

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-card md:hidden">
        {primaryItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground',
                isActive && 'text-primary',
              )
            }
          >
            <item.icon className="size-5" />
            {item.label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground',
            isMoreActive && 'text-primary',
          )}
        >
          <MoreHorizontal className="size-5" />
          Más
        </button>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Más opciones</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-4 pb-4">
            {moreItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted',
                    isActive && 'bg-primary/10 text-primary',
                  )
                }
              >
                <item.icon className="size-4.5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
