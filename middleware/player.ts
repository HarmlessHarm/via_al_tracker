// Player middleware - ensures user is a player (any role)

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // All logged-in users are considered players
  // (admin and dm have player privileges too)
  return
})
