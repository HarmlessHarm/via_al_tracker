// LocalStorage wrapper with type safety and error handling

const STORAGE_PREFIX = 'al_tracker_'

export const StorageKeys = {
  USERS: `${STORAGE_PREFIX}users`,
  CHARACTERS: `${STORAGE_PREFIX}characters`,
  LOOT_VOUCHERS: `${STORAGE_PREFIX}lootVouchers`,
  ATTENDANCE_TOKENS: `${STORAGE_PREFIX}attendanceTokens`,
  CURRENT_USER: `${STORAGE_PREFIX}currentUser`
} as const

/**
 * Get item from localStorage with JSON parsing
 */
export function getStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error)
    return null
  }
}

/**
 * Set item in localStorage with JSON stringification
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error)
    return false
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error)
    return false
  }
}

/**
 * Clear all app-related localStorage items
 */
export function clearAppStorage(): boolean {
  if (typeof window === 'undefined') return false

  try {
    Object.values(StorageKeys).forEach(key => {
      localStorage.removeItem(key)
    })
    return true
  } catch (error) {
    console.error('Error clearing app storage:', error)
    return false
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Get storage usage (approximate)
 */
export function getStorageUsage(): { used: number; limit: number } {
  if (typeof window === 'undefined') {
    return { used: 0, limit: 0 }
  }

  try {
    let used = 0
    Object.values(StorageKeys).forEach(key => {
      const item = localStorage.getItem(key)
      if (item) {
        used += item.length + key.length
      }
    })

    // Typical localStorage limit is 5MB (5 * 1024 * 1024 characters)
    const limit = 5 * 1024 * 1024

    return { used, limit }
  } catch {
    return { used: 0, limit: 0 }
  }
}
