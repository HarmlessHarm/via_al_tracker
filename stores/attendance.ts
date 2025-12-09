// Pinia store for attendance tokens

import { defineStore } from 'pinia'
import type { AttendanceToken, AttendanceTokenFormData } from '~/types'
import { getStorageItem, setStorageItem, StorageKeys } from '~/utils/storage'
import { generateFixtureAttendanceTokens } from '~/utils/fixtures'

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
    initialize() {
      const storedTokens = getStorageItem<AttendanceToken[]>(StorageKeys.ATTENDANCE_TOKENS)

      if (storedTokens && storedTokens.length > 0) {
        this.tokens = storedTokens
      } else {
        // First time - load fixtures
        this.tokens = generateFixtureAttendanceTokens()
        setStorageItem(StorageKeys.ATTENDANCE_TOKENS, this.tokens)
      }
    },

    /**
     * Award attendance token (DM action)
     */
    awardToken(dmId: string, formData: AttendanceTokenFormData): AttendanceToken {
      const now = new Date().toISOString()

      const newToken: AttendanceToken = {
        id: `attendance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        characterId: formData.characterId,
        sessionName: formData.sessionName,
        sessionDate: formData.sessionDate,
        awardedBy: dmId,
        awardedAt: now
      }

      this.tokens.push(newToken)
      setStorageItem(StorageKeys.ATTENDANCE_TOKENS, this.tokens)

      return newToken
    },

    /**
     * Award tokens to multiple characters (bulk award)
     */
    awardTokensBulk(dmId: string, characterIds: string[], sessionName: string, sessionDate: string): AttendanceToken[] {
      const newTokens: AttendanceToken[] = []
      const now = new Date().toISOString()

      characterIds.forEach(characterId => {
        const newToken: AttendanceToken = {
          id: `attendance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          characterId,
          sessionName,
          sessionDate,
          awardedBy: dmId,
          awardedAt: now
        }

        newTokens.push(newToken)
        this.tokens.push(newToken)
      })

      setStorageItem(StorageKeys.ATTENDANCE_TOKENS, this.tokens)

      return newTokens
    },

    /**
     * Delete attendance token (admin only)
     */
    deleteToken(tokenId: string): boolean {
      const tokenIndex = this.tokens.findIndex(t => t.id === tokenId)

      if (tokenIndex === -1) return false

      this.tokens.splice(tokenIndex, 1)
      setStorageItem(StorageKeys.ATTENDANCE_TOKENS, this.tokens)

      return true
    },

    /**
     * Delete all tokens for a character
     */
    deleteTokensByCharacter(characterId: string): number {
      const initialLength = this.tokens.length
      this.tokens = this.tokens.filter(t => t.characterId !== characterId)

      setStorageItem(StorageKeys.ATTENDANCE_TOKENS, this.tokens)

      return initialLength - this.tokens.length
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
