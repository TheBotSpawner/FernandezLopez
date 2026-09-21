import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { MobileNav } from './MobileNav'
import { TopBar } from './TopBar'

export function AppShell() {
  return (
    <div className="flex min-h-svh w-full bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-20 md:px-6 md:pt-6 md:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
