export type DateFormatPreference = 'dd/MM/yyyy' | 'MM/dd/yyyy'

// "Vista inicial de propiedades" is not duplicated here — it reuses the
// Properties page's own last-used-view storage (lib/property-view-preference.ts),
// which already is a "remembered default" for that screen.
export interface Preferences {
  dateFormat: DateFormatPreference
  currency: 'ARS' | 'USD'
}

export const DEFAULT_PREFERENCES: Preferences = {
  dateFormat: 'dd/MM/yyyy',
  currency: 'ARS',
}
