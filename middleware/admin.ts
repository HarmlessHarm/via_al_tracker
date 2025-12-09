// Admin middleware - ensures user is an admin

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Check if user is admin
  if (!authStore.isAdmin) {
    // Redirect to home with error message
    return navigateTo({
      path: '/',
      query: { error: 'admin_required' }
    })
  }
})
