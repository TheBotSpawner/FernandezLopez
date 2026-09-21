import type { ReactNode } from 'react'

// Composition root for future app-wide providers (theme, query client, etc.)
export function Providers({ children }: { children: ReactNode }) {
  return children
}
