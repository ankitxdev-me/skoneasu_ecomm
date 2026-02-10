'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '@/lib/api'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setSession(session)
        setUser(session.user)
        loadProfile()
      } else {
        // Fallback: Check localStorage for token (from custom API login)
        const token = localStorage.getItem('auth_token')
        if (token) {
          const { data: { user }, error } = await supabase.auth.getUser(token)
          if (user && !error) {
            // Manually set session on the client
            const { data: { session: newSession }, error: sessionError } = await supabase.auth.setSession({
              access_token: token,
              refresh_token: '' // No refresh token available in this flow
            })

            if (newSession && !sessionError) {
              setSession(newSession)
              setUser(newSession.user)
              loadProfile()
            } else {
              // If setSession fails but getUser succeeded, we might have a valid token but can't establish session?
              // Fallback to just setting user but warning: RLS might fail if client relies on session.
              // Actually getUser(token) validates it.
              console.warn("Could not establish Supabase session from token", sessionError)
              setUser(user)
              loadProfile()
            }
          } else {
            localStorage.removeItem('auth_token') // Invalid token
            setLoading(false)
          }
        } else {
          setLoading(false)
        }
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user || null)
      if (session?.user) {
        loadProfile()
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await authAPI.getProfile()
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, fullName, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: fullName,
        phone,
        role: 'user'
      })

    if (profileError) throw profileError

    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (data) => {
    const updated = await authAPI.updateProfile(data)
    setProfile(updated)
    return updated
  }

  const updatePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }

  const resetPassword = async (email) => {
    // 1. Check if email exists in our system
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      throw new Error('This email is not registered with us')
    }

    // 2. Send reset link
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (error) throw error
  }

  const isAdmin = profile?.role === 'admin'

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
    resetPassword,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
