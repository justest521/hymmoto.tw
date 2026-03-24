/**
 * HYMMOTO.TW Supabase Client Configuration
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Browser-side Supabase client (singleton)
 */
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Server-side Supabase client with service role for admin operations
 */
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createSupabaseClient(supabaseUrl, serviceKey)
}
