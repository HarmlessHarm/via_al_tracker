// Attendance composable

import { useAttendanceStore } from '~/stores/attendance'
import { useAuthStore } from '~/stores/auth'
import type { AttendanceTokenFormData } from '~/types'

export const useAttendance = () => {
  const attendanceStore = useAttendanceStore()
  const authStore = useAuthStore()

  // Initialize store on first use
  if (attendanceStore.tokens.length === 0) {
    attendanceStore.initialize()
  }

  /**
   * Award attendance token (DM/Admin only)
   */
  const awardToken = (formData: AttendanceTokenFormData) => {
    const currentUser = authStore.currentUser

    if (!currentUser) {
      throw new Error('Must be logged in')
    }

    if (currentUser.role !== 'dm' && currentUser.role !== 'admin') {
      throw new Error('Only DMs and Admins can award attendance tokens')
    }

    return attendanceStore.awardToken(currentUser.id, formData)
  }

  /**
   * Award tokens to multiple characters (bulk)
   */
  const awardTokensBulk = (characterIds: string[], sessionName: string, sessionDate: string) => {
    const currentUser = authStore.currentUser

    if (!currentUser) {
      throw new Error('Must be logged in')
    }

    if (currentUser.role !== 'dm' && currentUser.role !== 'admin') {
      throw new Error('Only DMs and Admins can award attendance tokens')
    }

    return attendanceStore.awardTokensBulk(currentUser.id, characterIds, sessionName, sessionDate)
  }

  /**
   * Get attendance tokens for a specific character
   */
  const getCharacterTokens = (characterId: string) => {
    return attendanceStore.getTokensByCharacterId(characterId)
  }

  /**
   * Get attendance count for a character
   */
  const getCharacterAttendanceCount = (characterId: string) => {
    return attendanceStore.getAttendanceCount(characterId)
  }

  return {
    // State
    allTokens: computed(() => attendanceStore.allTokens),
    recentTokens: computed(() => attendanceStore.recentTokens),
    uniqueSessions: computed(() => attendanceStore.uniqueSessions),
    loading: computed(() => attendanceStore.loading),
    error: computed(() => attendanceStore.error),

    // Actions
    awardToken,
    awardTokensBulk,
    deleteToken: attendanceStore.deleteToken,
    getCharacterTokens,
    getCharacterAttendanceCount,
    getTokensBySession: attendanceStore.getTokensBySession,
    getSessionsAttended: attendanceStore.getSessionsAttended
  }
}
