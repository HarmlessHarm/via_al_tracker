// DM middleware - ensures user is a DM or admin

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Check if user is DM or admin
  if (!authStore.isDM && !authStore.isAdmin) {
    // Redirect to home with error message
    return navigateTo({
      path: '/',
      query: { error: 'dm_required' }
    })
  }
})
