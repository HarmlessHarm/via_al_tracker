// Supabase client setup

import { createClient } from '@supabase/supabase-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '~/drizzle/schema'

// Supabase client for auth and realtime
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

// Drizzle client for type-safe queries
export const useDrizzle = () => {
  const config = useRuntimeConfig()

  // Create postgres connection
  const connectionString = config.public.databaseUrl

  const client = postgres(connectionString)
  const db = drizzle(client, { schema })

  return db
}
