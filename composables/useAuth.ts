// Auth composable - provides clean API for authentication

import { useAuthStore } from '~/stores/auth'
import type { UserRole } from '~/types'

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  /**
   * Login user
   */
  const login = async (email: string, password: string) => {
    const result = await authStore.login(email, password)

    if (result.success) {
      // Redirect based on role
      const role = authStore.currentUser?.role

      if (role === 'admin') {
        await router.push('/admin')
      } else if (role === 'dm') {
        await router.push('/dm/award')
      } else {
        await router.push('/')
      }
    }

    return result
  }

  /**
   * Logout user
   */
  const logout = async () => {
    authStore.logout()
    await router.push('/login')
  }

  /**
   * Check if user has specific role
   */
  const hasRole = (role: UserRole): boolean => {
    return authStore.currentUser?.role === role
  }

  /**
   * Check if user has at least specific role level
   * admin > dm > player
   */
  const hasRoleLevel = (minimumRole: UserRole): boolean => {
    const currentRole = authStore.currentUser?.role

    if (!currentRole) return false

    const roleLevels = { player: 1, dm: 2, admin: 3 }

    return roleLevels[currentRole] >= roleLevels[minimumRole]
  }

  return {
    // State
    currentUser: computed(() => authStore.currentUser),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    userRole: computed(() => authStore.userRole),
    isAdmin: computed(() => authStore.isAdmin),
    isDM: computed(() => authStore.isDM),
    isPlayer: computed(() => authStore.isPlayer),
    loading: computed(() => authStore.loading),
    error: computed(() => authStore.error),

    // Actions
    login,
    logout,
    hasRole,
    hasRoleLevel
  }
}
