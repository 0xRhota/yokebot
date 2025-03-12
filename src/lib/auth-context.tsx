'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

// Mock user for development
const MOCK_USER = process.env.NODE_ENV === 'development' ? {
  id: 'mock-user-id',
  email: 'user@example.com',
  created_at: new Date().toISOString(),
} : null

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_USER as User | null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      if (process.env.NODE_ENV === 'development') {
        // In development, use mock user
        setIsLoading(false)
        return
      }

      try {
        const { data } = await supabase.auth.getSession()
        setUser(data.session?.user || null)
        
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, session: Session | null) => {
            setUser(session?.user || null)
          }
        )

        return () => {
          authListener.subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Auth error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (process.env.NODE_ENV === 'development') {
      // In development, simulate successful sign-in
      setUser(MOCK_USER as User)
      return { error: null }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    if (process.env.NODE_ENV === 'development') {
      // In development, simulate successful sign-up
      setUser(MOCK_USER as User)
      return { error: null }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    if (process.env.NODE_ENV === 'development') {
      // In development, simulate sign-out
      setUser(null)
      return
    }

    await supabase.auth.signOut()
  }

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useUser() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider')
  }
  return context
} 