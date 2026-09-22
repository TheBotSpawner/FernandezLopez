import { loadOrSeed, persist } from '@/lib/local-store'
import { DEFAULT_PREFERENCES } from '@/types/preferences'
import type { Preferences } from '@/types/preferences'

const KEY = 'fl.settings.preferences'

let preferences: Preferences = loadOrSeed(KEY, [DEFAULT_PREFERENCES])[0]

export function getPreferences(): Preferences {
  return preferences
}

export async function updatePreferences(input: Partial<Preferences>): Promise<Preferences> {
  preferences = { ...preferences, ...input }
  persist(KEY, [preferences])
  return preferences
}
