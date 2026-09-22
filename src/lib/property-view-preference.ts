export type PropertyViewMode = 'list' | 'cards' | 'map'

const VIEW_STORAGE_KEY = 'fl.properties.view'

/** Shared by the Properties page (remembers last-used view) and Settings' "Vista inicial de propiedades" preference. */
export function readStoredPropertyView(): PropertyViewMode {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY)
    if (stored === 'list' || stored === 'cards' || stored === 'map') return stored
  } catch {
    // ignore
  }
  return 'cards'
}

export function writeStoredPropertyView(view: PropertyViewMode): void {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, view)
  } catch {
    // localStorage unavailable — preference just won't persist.
  }
}
