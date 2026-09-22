/**
 * Restores prototype demo data: every persisted key follows the `fl.` prefix
 * convention (see each service's `loadOrSeed`/`persist` calls), so clearing
 * just that prefix and reloading is enough to fall back to seed data
 * everywhere without touching unrelated browser storage.
 */
export function resetDemoData(): void {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('fl.')) localStorage.removeItem(key)
    }
  } catch {
    // localStorage unavailable — nothing to reset.
  }
  window.location.reload()
}
