// Pinia store for authentication

import { defineStore } from 'pinia'
import type { User, UserRole } from '~/types'
import { getStorageItem, setStorageItem, removeStorageItem, StorageKeys } from '~/utils/storage'
import { generateFixtureUsers } from '~/utils/fixtures'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null as User | null,
    users: [] as User[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    isAuthenticated: (state) => state.currentUser !== null,

    userRole: (state): UserRole | null => state.currentUser?.role || null,

    isAdmin: (state) => state.currentUser?.role === 'admin',

    isDM: (state) => state.currentUser?.role === 'dm' || state.currentUser?.role === 'admin',

    isPlayer: (state) => state.currentUser?.role === 'player'
  },

  actions: {
    /**
     * Initialize auth store - load from localStorage or create fixtures
     */
    initialize() {
      // Load users from storage or create fixtures
      const storedUsers = getStorageItem<User[]>(StorageKeys.USERS)

      if (storedUsers && storedUsers.length > 0) {
        this.users = storedUsers
      } else {
        // First time - load fixtures
        this.users = generateFixtureUsers()
        setStorageItem(StorageKeys.USERS, this.users)
      }

      // Check if user is already logged in
      const storedCurrentUser = getStorageItem<User>(StorageKeys.CURRENT_USER)
      if (storedCurrentUser) {
        this.currentUser = storedCurrentUser
      }
    },

    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
      this.loading = true
      this.error = null

      try {
        // Find user by email
        const user = this.users.find(u => u.email === email && u.isActive !== false)

        if (!user) {
          this.error = 'Invalid email or password'
          return { success: false, message: this.error }
        }

        // Check password (WARNING: Plain text comparison for POC only!)
        if (user.password !== password) {
          this.error = 'Invalid email or password'
          return { success: false, message: this.error }
        }

        // Set current user
        this.currentUser = user
        setStorageItem(StorageKeys.CURRENT_USER, user)

        return { success: true }
      } catch (error) {
        this.error = 'Login failed'
        console.error('Login error:', error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    /**
     * Logout current user
     */
    logout() {
      this.currentUser = null
      removeStorageItem(StorageKeys.CURRENT_USER)
    },

    /**
     * Create a new user (admin only)
     */
    createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        isActive: true
      }

      this.users.push(newUser)
      setStorageItem(StorageKeys.USERS, this.users)

      return newUser
    },

    /**
     * Update user role (admin only)
     */
    updateUserRole(userId: string, newRole: UserRole): boolean {
      const user = this.users.find(u => u.id === userId)

      if (!user) return false

      user.role = newRole
      setStorageItem(StorageKeys.USERS, this.users)

      // Update current user if it's the same user
      if (this.currentUser?.id === userId) {
        this.currentUser = user
        setStorageItem(StorageKeys.CURRENT_USER, user)
      }

      return true
    },

    /**
     * Soft delete user (admin only)
     */
    deleteUser(userId: string): boolean {
      const user = this.users.find(u => u.id === userId)

      if (!user) return false

      user.isActive = false
      setStorageItem(StorageKeys.USERS, this.users)

      return true
    },

    /**
     * Get all active users
     */
    getActiveUsers(): User[] {
      return this.users.filter(u => u.isActive !== false)
    },

    /**
     * Get users by role
     */
    getUsersByRole(role: UserRole): User[] {
      return this.users.filter(u => u.role === role && u.isActive !== false)
    },

    /**
     * Get user by ID
     */
    getUserById(userId: string): User | undefined {
      return this.users.find(u => u.id === userId)
    }
  }
})
