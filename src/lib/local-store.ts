/** Load a persisted array from localStorage, falling back to seed data on first run or failure. */
export function loadOrSeed<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T[]
  } catch {
    // localStorage unavailable or corrupt — fall back to seed data.
  }
  return seed
}

export function persist<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // localStorage unavailable — change just won't survive a reload.
  }
}
