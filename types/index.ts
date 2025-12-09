// Core TypeScript interfaces for D&D Adventure League Tracker

export type UserRole = 'player' | 'dm' | 'admin'

export interface User {
  id: string
  email: string
  password: string // In POC: plain text (DO NOT do this in production!)
  role: UserRole
  name: string
  createdAt: string
  isActive?: boolean // For soft delete
}

export type CharacterSource = 'manual' | 'dndbeyond' | 'pdf'

export interface ClassLevel {
  class: string // e.g., "Fighter", "Wizard", "Rogue"
  level: number // 1-20
}

export interface Character {
  id: string
  playerId: string // Reference to User.id
  name: string
  classes: ClassLevel[] // Array for multiclass support
  race: string
  background: string
  characterSource: CharacterSource
  dndBeyondLink?: string
  pdfUrl?: string
  gold: number
  createdAt: string
  updatedAt: string
}

export type LootRarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary'

export interface LootVoucher {
  id: string
  characterId: string // Reference to Character.id
  name: string
  description: string
  rarity: LootRarity
  isUsed: boolean
  awardedBy: string // Reference to User.id (DM who awarded it)
  awardedAt: string
  usedAt?: string
}

export interface AttendanceToken {
  id: string
  characterId: string // Reference to Character.id
  sessionName: string
  sessionDate: string
  awardedBy: string // Reference to User.id (DM who awarded it)
  awardedAt: string
}

// Helper types for computed properties
export interface CharacterWithTotalLevel extends Character {
  totalLevel: number
}

// Form data types (for component props and v-model)
export interface LoginForm {
  email: string
  password: string
}

export interface CharacterFormData {
  name: string
  classes: ClassLevel[]
  race: string
  background: string
  characterSource: CharacterSource
  dndBeyondLink?: string
  pdfUrl?: string
  gold: number
}

export interface LootVoucherFormData {
  characterId: string
  name: string
  description: string
  rarity: LootRarity
}

export interface AttendanceTokenFormData {
  characterId: string
  sessionName: string
  sessionDate: string
}

export interface UserFormData {
  email: string
  password: string
  name: string
  role: UserRole
}

// Utility types for filtering and sorting
export interface LootVoucherFilters {
  rarity?: LootRarity
  isUsed?: boolean
  characterId?: string
}

export interface CharacterFilters {
  playerId?: string
  minimumLevel?: number
  maximumLevel?: number
  class?: string
}

// API/Store response types
export interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
}

export interface StoreState<T> {
  items: T[]
  loading: boolean
  error: string | null
}
