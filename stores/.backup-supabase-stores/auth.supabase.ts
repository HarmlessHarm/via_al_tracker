// Pinia store for authentication using Supabase Auth

import { defineStore } from 'pinia'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { User, UserRole } from '~/types'
import { useSupabaseClient } from '~/lib/supabase.client'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null as User | null,
    supabaseUser: null as SupabaseUser | null,
    users: [] as User[],
    loading: false,
    error: null as string | null,
    initialized: false
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
     * Initialize auth store - check for existing session
     */
    async initialize() {
      // Only initialize once
      if (this.initialized) {
        return
      }

      try {
        const supabase = useSupabaseClient()

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          this.supabaseUser = session.user
          await this.fetchCurrentUser(session.user.id)
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event: string, session: any) => {
          if (event === 'SIGNED_IN' && session?.user) {
            this.supabaseUser = session.user
            await this.fetchCurrentUser(session.user.id)
          } else if (event === 'SIGNED_OUT') {
            this.currentUser = null
            this.supabaseUser = null
          }
        })

        // Fetch all users for admin/DM views ONLY if authenticated
        if (session?.user) {
          await this.fetchUsers()
        }

        this.initialized = true
      } catch (error) {
        console.error('Auth initialization error:', error)
      }
    },

    /**
     * Fetch current user profile from database
     */
    async fetchCurrentUser(userId: string) {
      const supabase = useSupabaseClient()

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error

        this.currentUser = data as User
      } catch (error) {
        console.error('Error fetching user profile:', error)
        this.error = 'Failed to fetch user profile'
      }
    },

    /**
     * Fetch all users (for admin views)
     */
    async fetchUsers() {
      const supabase = useSupabaseClient()

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (error) throw error

        this.users = data as User[]
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    },

    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
      const supabase = useSupabaseClient()
      this.loading = true
      this.error = null

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          this.error = error.message
          return { success: false, message: error.message }
        }

        if (data.user) {
          this.supabaseUser = data.user
          await this.fetchCurrentUser(data.user.id)
        }

        return { success: true }
      } catch (error: any) {
        this.error = error.message || 'Login failed'
        console.error('Login error:', error)
        return { success: false, message: this.error || undefined }
      } finally {
        this.loading = false
      }
    },

    /**
     * Logout current user
     */
    async logout() {
      const supabase = useSupabaseClient()

      try {
        await supabase.auth.signOut()
        this.currentUser = null
        this.supabaseUser = null
      } catch (error) {
        console.error('Logout error:', error)
      }
    },

    /**
     * Sign up new user (creates auth user and profile)
     */
    async signup(email: string, password: string, name: string, role: UserRole = 'player'): Promise<{ success: boolean; message?: string }> {
      const supabase = useSupabaseClient()
      this.loading = true
      this.error = null

      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password
        })

        if (authError) {
          this.error = authError.message
          return { success: false, message: authError.message }
        }

        if (!authData.user) {
          this.error = 'Failed to create user'
          return { success: false, message: this.error }
        }

        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            name,
            role,
            is_active: true
          })

        if (profileError) {
          this.error = profileError.message
          return { success: false, message: profileError.message }
        }

        return { success: true }
      } catch (error: any) {
        this.error = error.message || 'Signup failed'
        console.error('Signup error:', error)
        return { success: false, message: this.error || undefined }
      } finally {
        this.loading = false
      }
    },

    /**
     * Update user role (admin only)
     */
    async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
      const supabase = useSupabaseClient()

      try {
        const { error } = await supabase
          .from('users')
          .update({ role: newRole })
          .eq('id', userId)

        if (error) throw error

        // Refresh users list
        await this.fetchUsers()

        // Update current user if it's the same user
        if (this.currentUser?.id === userId) {
          await this.fetchCurrentUser(userId)
        }

        return true
      } catch (error) {
        console.error('Error updating user role:', error)
        return false
      }
    },

    /**
     * Soft delete user (admin only)
     */
    async deleteUser(userId: string): Promise<boolean> {
      const supabase = useSupabaseClient()

      try {
        const { error } = await supabase
          .from('users')
          .update({ is_active: false })
          .eq('id', userId)

        if (error) throw error

        // Refresh users list
        await this.fetchUsers()

        return true
      } catch (error) {
        console.error('Error deleting user:', error)
        return false
      }
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
