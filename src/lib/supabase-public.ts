import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const DEFAULT_URL = 'https://xxbecnvdtvbopmuuxswf.supabase.co'
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4YmVjbnZkdHZib3BtdXV4c3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDI0MDQsImV4cCI6MjA5ODU3ODQwNH0.z-iRQnKf9hdvcEbogMNinlJVVVCgDvUYytuhIYbtAIA'

export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || DEFAULT_ANON_KEY
  return createClient<Database>(url, key, { auth: { persistSession: false } })
}
