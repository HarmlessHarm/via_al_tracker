// Supabase client composable - accesses client from plugin

export const useSupabaseClient = () => {
  const nuxtApp = useNuxtApp()

  if (!nuxtApp.$supabase) {
    throw new Error('Supabase client not initialized. Make sure the supabase plugin is loaded.')
  }

  return nuxtApp.$supabase
}
