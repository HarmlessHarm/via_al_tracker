// Pinia store for attendance tokens using Supabase

import { defineStore } from 'pinia'
import type { AttendanceToken, AttendanceTokenFormData } from '~/types'
import { useSupabaseClient } from '~/lib/supabase.client'

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    tokens: [] as AttendanceToken[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    /**
     * Get attendance tokens by character ID
     */
    getTokensByCharacterId: (state) => {
      return (characterId: string): AttendanceToken[] => {
        return state.tokens
          .filter(t => t.characterId === characterId)
          .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
      }
    },

    /**
     * Get attendance count by character ID
     */
    getAttendanceCount: (state) => {
      return (characterId: string): number => {
        return state.tokens.filter(t => t.characterId === characterId).length
      }
    },

    /**
     * Get all tokens (for admin/DM views)
     */
    allTokens: (state): AttendanceToken[] => {
      return state.tokens.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
    },

    /**
     * Get recent tokens (last 10)
     */
    recentTokens: (state): AttendanceToken[] => {
      return state.tokens
        .sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime())
        .slice(0, 10)
    },

    /**
     * Get unique session names
     */
    uniqueSessions: (state): string[] => {
      const sessions = new Set(state.tokens.map(t => t.sessionName))
      return Array.from(sessions).sort()
    }
  },

  actions: {
    /**
     * Initialize attendance store
     */
    async initialize() {
      await this.fetchTokens()
    },

    /**
     * Fetch all tokens from Supabase
     */
    async fetchTokens() {
      const supabase = useSupabaseClient()
      this.loading = true

      try {
        const { data, error } = await supabase
          .from('attendance_tokens')
          .select('*')
          .order('session_date', { ascending: false })

        if (error) throw error

        this.tokens = data as AttendanceToken[]
      } catch (error: any) {
        console.error('Error fetching attendance tokens:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * Award attendance token (DM action)
     */
    async awardToken(dmId: string, formData: AttendanceTokenFormData): Promise<AttendanceToken> {
      const supabase = useSupabaseClient()

      try {
        const { data, error } = await supabase
          .from('attendance_tokens')
          .insert({
            characterId: formData.characterId,
            sessionName: formData.sessionName,
            sessionDate: formData.sessionDate,
            awardedBy: dmId
          })
          .select()
          .single()

        if (error) throw error

        const newToken = data as AttendanceToken

        // Add to local state
        this.tokens.push(newToken)

        return newToken
      } catch (error: any) {
        console.error('Error awarding attendance token:', error)
        throw new Error(error.message || 'Failed to award attendance token')
      }
    },

    /**
     * Award tokens to multiple characters (bulk award)
     */
    async awardTokensBulk(dmId: string, characterIds: string[], sessionName: string, sessionDate: string): Promise<AttendanceToken[]> {
      const supabase = useSupabaseClient()

      try {
        const insertData = characterIds.map(characterId => ({
          characterId,
          sessionName,
          sessionDate,
          awardedBy: dmId
        }))

        const { data, error } = await supabase
          .from('attendance_tokens')
          .insert(insertData)
          .select()

        if (error) throw error

        const newTokens = data as AttendanceToken[]

        // Add to local state
        this.tokens.push(...newTokens)

        return newTokens
      } catch (error: any) {
        console.error('Error bulk awarding attendance:', error)
        throw new Error(error.message || 'Failed to award attendance tokens')
      }
    },

    /**
     * Delete attendance token (admin only)
     */
    async deleteToken(tokenId: string): Promise<boolean> {
      const supabase = useSupabaseClient()

      try {
        const { error } = await supabase
          .from('attendance_tokens')
          .delete()
          .eq('id', tokenId)

        if (error) throw error

        // Remove from local state
        this.tokens = this.tokens.filter(t => t.id !== tokenId)

        return true
      } catch (error: any) {
        console.error('Error deleting token:', error)
        return false
      }
    },

    /**
     * Delete all tokens for a character
     */
    async deleteTokensByCharacter(characterId: string): Promise<number> {
      const supabase = useSupabaseClient()

      try {
        const { data, error } = await supabase
          .from('attendance_tokens')
          .delete()
          .eq('characterId', characterId)
          .select()

        if (error) throw error

        // Remove from local state
        this.tokens = this.tokens.filter(t => t.characterId !== characterId)

        return data?.length || 0
      } catch (error: any) {
        console.error('Error deleting character tokens:', error)
        return 0
      }
    },

    /**
     * Get tokens by session name
     */
    getTokensBySession(sessionName: string): AttendanceToken[] {
      return this.tokens.filter(t => t.sessionName === sessionName)
    },

    /**
     * Get sessions attended by character
     */
    getSessionsAttended(characterId: string): string[] {
      const sessions = this.tokens
        .filter(t => t.characterId === characterId)
        .map(t => t.sessionName)

      return Array.from(new Set(sessions))
    }
  }
})
