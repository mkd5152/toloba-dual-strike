import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

export type UserRole = 'organizer' | 'umpire' | 'spectator'

interface Profile {
  id: string
  email: string
  role: UserRole
  full_name: string | null
}

interface AuthStore {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  error: string | null

  // Actions
  initialize: () => Promise<void>
  signUp: (email: string, password: string, role: UserRole, fullName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      // Get initial session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) throw sessionError

      if (session?.user) {
        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          set({ user: session.user, session, profile: null, loading: false })
        } else {
          set({ user: session.user, session, profile, loading: false })
        }
      } else {
        set({ loading: false })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          set({ user: null, session: null, profile: null })
        } else if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          set({ user: session.user, session, profile: profile || null })
        } else {
          set({ user: null, session: null, profile: null })
        }
      })
    } catch (error: any) {
      console.error('Error initializing auth:', error)
      set({ loading: false, error: error.message })
    }
  },

  signUp: async (email, password, role, fullName) => {
    try {
      set({ loading: true, error: null })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      // Create profile
      if (data.user) {
        // @ts-ignore - Supabase browser client type inference limitation
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          role,
          full_name: fullName || null,
        })

        if (profileError) throw profileError

        // Fetch the created profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        set({
          user: data.user,
          session: data.session,
          profile: profile || null,
          loading: false,
        })
      }
    } catch (error: any) {
      console.error('Error signing up:', error)
      set({ loading: false, error: error.message })
      throw error
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Fetch profile
      if (data.user) {
        // @ts-ignore - Supabase browser client type inference limitation
        const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()

        if (profileError) {
          console.error('Auth store: Error fetching profile:', profileError)
        }

        console.log('Auth store: Profile fetched:', (profile as any)?.role, profile)

        set({
          user: data.user,
          session: data.session,
          profile: profile || null,
          loading: false,
        })
      }
    } catch (error: any) {
      console.error('Error signing in:', error)
      set({ loading: false, error: error.message })
      throw error
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null })
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null, session: null, profile: null, loading: false })
    } catch (error: any) {
      console.error('Error signing out:', error)
      set({ loading: false, error: error.message })
      throw error
    }
  },

  updateProfile: async (updates) => {
    try {
      const profile = get().profile
      if (!profile) throw new Error('No profile to update')

      set({ loading: true, error: null })

      // @ts-ignore - Supabase browser client type inference limitation
      const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id)

      if (error) throw error

      set({ profile: { ...profile, ...updates }, loading: false })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      set({ loading: false, error: error.message })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))
