import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { MobileNav } from './MobileNav'
import { TopBar } from './TopBar'

export function AppShell() {
  return (
    <div className="flex min-h-svh w-full bg-background">
      <div className="print:hidden">
        <AppSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="print:hidden">
          <TopBar />
        </div>
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-20 md:px-6 md:pt-6 md:pb-12 print:p-0">
          <Outlet />
        </main>
      </div>
      <div className="print:hidden">
        <MobileNav />
      </div>
    </div>
  )
}
