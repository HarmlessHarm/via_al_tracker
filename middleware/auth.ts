// Auth middleware - ensures user is logged in

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Initialize store if not already done
  if (authStore.users.length === 0) {
    authStore.initialize()
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Save intended destination
    const intendedPath = to.fullPath

    // Redirect to login
    return navigateTo({
      path: '/login',
      query: { redirect: intendedPath !== '/login' ? intendedPath : undefined }
    })
  }
})
