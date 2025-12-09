// Supabase client setup for browser

import { createClient } from '@supabase/supabase-js'

// Supabase client for auth and realtime (browser-safe)
export const useSupabaseClient = () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    }
  )

  return supabase
}
