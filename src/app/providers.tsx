import type { ReactNode } from 'react'
import { SessionProvider } from './session-context'
import { ThemeProvider } from './theme-context'
import { ToastProvider } from './toast-context'

// Composition root for app-wide providers.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <ToastProvider>{children}</ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
