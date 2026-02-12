import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'dual-strike-scoring',
    },
  },
  // Increase timeout for long-running operations like match initialization
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
