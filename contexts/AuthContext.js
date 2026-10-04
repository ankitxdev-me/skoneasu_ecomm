// original code 

// 'use client'

// import { createContext, useContext, useState, useEffect } from 'react'
// import { authAPI } from '@/lib/api'
// import { supabase } from '@/lib/supabase'

// const AuthContext = createContext({})

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null)
//   const [profile, setProfile] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [session, setSession] = useState(null)

//   useEffect(() => {
//     // Check for existing session
//     supabase.auth.getSession().then(async ({ data: { session } }) => {
//       if (session?.user) {
//         setSession(session)
//         setUser(session.user)
//         loadProfile()
//       } else {
//         // Fallback: Check localStorage for token (from custom API login)
//         const token = localStorage.getItem('auth_token')
//         if (token) {
//           const { data: { user }, error } = await supabase.auth.getUser(token)
//           if (user && !error) {
//             // Manually set session on the client
//             const { data: { session: newSession }, error: sessionError } = await supabase.auth.setSession({
//               access_token: token,
//               refresh_token: '' // No refresh token available in this flow
//             })

//             if (newSession && !sessionError) {
//               setSession(newSession)
//               setUser(newSession.user)
//               loadProfile()
//             } else {
//               // If setSession fails but getUser succeeded, we might have a valid token but can't establish session?
//               // Fallback to just setting user but warning: RLS might fail if client relies on session.
//               // Actually getUser(token) validates it.
//               console.warn("Could not establish Supabase session from token", sessionError)
//               setUser(user)
//               loadProfile()
//             }
//           } else {
//             localStorage.removeItem('auth_token') // Invalid token
//             setLoading(false)
//           }
//         } else {
//           setLoading(false)
//         }
//       }
//     })

//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session)
//       setUser(session?.user || null)
//       if (session?.user) {
//         loadProfile()
//       } else {
//         setProfile(null)
//         setLoading(false)
//       }
//     })

//     return () => subscription.unsubscribe()
//   }, [])

//   const loadProfile = async () => {
//     try {
//       const data = await authAPI.getProfile()
//       setProfile(data)
//     } catch (error) {
//       console.error('Error loading profile:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const signUp = async (email, password, fullName, phone) => {
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//     })

//     if (error) throw error

//     // Create profile
//     const { error: profileError } = await supabase
//       .from('profiles')
//       .insert({
//         id: data.user.id,
//         full_name: fullName,
//         phone,
//         role: 'user'
//       })

//     if (profileError) throw profileError

//     return data
//   }

//   const signIn = async (email, password) => {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     })

//     if (error) throw error

//     return data
//   }

//   const signOut = async () => {
//     await supabase.auth.signOut()
//     setUser(null)
//     setProfile(null)
//   }

//   const updateProfile = async (data) => {
//     const updated = await authAPI.updateProfile(data)
//     setProfile(updated)
//     return updated
//   }

//   const updatePassword = async (password) => {
//     const { error } = await supabase.auth.updateUser({ password })
//     if (error) throw error
//   }

//   // const resetPassword = async (email) => {
//   //   // 1. Check if email exists in our system
//   //   const { data: profile, error: profileError } = await supabase
//   //     .from('profiles')
//   //     .select('id')
//   //     .eq('email', email)
//   //     .single()

//   //   if (profileError || !profile) {
//   //     throw new Error('This email is not registered with us')
//   //   }

//   //   // 2. Send reset link
//   //   const { error } = await supabase.auth.resetPasswordForEmail(email, {
//   //     redirectTo: `${window.location.origin}/auth/update-password`,
//   //   })

//   //   if (error) throw error
//   // }


//   const resetPassword = async (email) => {
//     const { error } = await supabase.auth.resetPasswordForEmail(email, {
//       redirectTo: `${window.location.origin}/auth/update-password`,
//     })

//     if (error) {
//       throw error
//     }
//   }

//   const isAdmin = profile?.role === 'admin'

//   const value = {
//     user,
//     profile,
//     session,
//     loading,
//     signUp,
//     signIn,
//     signOut,
//     updateProfile,
//     updatePassword,
//     resetPassword,
//     isAdmin,
//   }

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider')
//   }
//   return context
// }


// fisrt update

// 'use client'

// import { createContext, useContext, useState, useEffect } from 'react'
// import { authAPI } from '@/lib/api'
// import { supabase } from '@/lib/supabase'

// const AuthContext = createContext({})

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null)
//   const [profile, setProfile] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [session, setSession] = useState(null)

//   // Load user profile from our API
//   const loadProfile = async () => {
//     try {
//       const data = await authAPI.getProfile()
//       setProfile(data)
//     } catch (error) {
//       console.error('Error loading profile:', error)
//       setProfile(null)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     // Get existing Supabase session
//     const initializeAuth = async () => {
//       try {
//         const {
//           data: { session },
//         } = await supabase.auth.getSession()

//         if (session?.user) {
//           setSession(session)
//           setUser(session.user)
//           await loadProfile()
//         } else {
//           setSession(null)
//           setUser(null)
//           setProfile(null)
//           setLoading(false)
//         }
//       } catch (error) {
//         console.error('Error initializing auth:', error)
//         setSession(null)
//         setUser(null)
//         setProfile(null)
//         setLoading(false)
//       }
//     }

//     initializeAuth()

//     // Listen for Supabase auth changes
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange(async (_event, session) => {
//       setSession(session)
//       setUser(session?.user || null)

//       if (session?.user) {
//         await loadProfile()
//       } else {
//         setProfile(null)
//         setLoading(false)
//       }
//     })

//     return () => {
//       subscription.unsubscribe()
//     }
//   }, [])

//   // -----------------------------
//   // SIGN UP
//   // -----------------------------

//   const signUp = async (email, password, fullName, phone) => {
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//     })

//     if (error) {
//       throw error
//     }

//     // Create profile
//     if (data.user) {
//       const { error: profileError } = await supabase
//         .from('profiles')
//         .insert({
//           id: data.user.id,
//           full_name: fullName,
//           phone,
//           role: 'user',
//         })

//       if (profileError) {
//         throw profileError
//       }
//     }

//     return data
//   }

//   // -----------------------------
//   // SIGN IN
//   // -----------------------------

//   const signIn = async (email, password) => {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     })

//     if (error) {
//       throw error
//     }

//     return data
//   }

//   // -----------------------------
//   // SIGN OUT
//   // -----------------------------

//   const signOut = async () => {
//     const { error } = await supabase.auth.signOut()

//     if (error) {
//       throw error
//     }

//     setUser(null)
//     setProfile(null)
//     setSession(null)
//   }

//   // -----------------------------
//   // UPDATE PROFILE
//   // -----------------------------

//   const updateProfile = async (data) => {
//     const updated = await authAPI.updateProfile(data)

//     setProfile(updated)

//     return updated
//   }

//   // -----------------------------
//   // UPDATE PASSWORD
//   // -----------------------------

//   const updatePassword = async (password) => {
//     const { error } = await supabase.auth.updateUser({
//       password,
//     })

//     if (error) {
//       throw error
//     }
//   }

//   // -----------------------------
//   // FORGOT PASSWORD
//   // -----------------------------

//   const resetPassword = async (email) => {
//     const { error } = await supabase.auth.resetPasswordForEmail(email, {
//       redirectTo: `${window.location.origin}/auth/update-password`,
//     })

//     if (error) {
//       throw error
//     }
//   }

//   const isAdmin = profile?.role === 'admin'

//   const value = {
//     user,
//     profile,
//     session,
//     loading,
//     signUp,
//     signIn,
//     signOut,
//     updateProfile,
//     updatePassword,
//     resetPassword,
//     isAdmin,
//   }

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const context = useContext(AuthContext)

//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider')
//   }

//   return context
// }




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

  // IMPORTANT:
  // true = Supabase recovery session is active
  // false = normal authentication flow
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  // --------------------------------------------------
  // LOAD USER PROFILE
  // --------------------------------------------------

  const loadProfile = async () => {
    try {
      const data = await authAPI.getProfile()
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------
  // INITIALIZE AUTH
  // --------------------------------------------------

  // useEffect(() => {
  //   let mounted = true

  //   // First listen for auth changes.
  //   // This is important because PASSWORD_RECOVERY
  //   // event can happen when the reset link is opened.

  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange(async (event, session) => {
  //     if (!mounted) return

  //     console.log('Supabase Auth Event:', event)

  //     // -----------------------------------------------
  //     // PASSWORD RECOVERY
  //     // -----------------------------------------------

  //     if (event === 'PASSWORD_RECOVERY') {
  //       setIsPasswordRecovery(true)

  //       // Keep the recovery session internally because
  //       // Supabase needs it for updateUser()
  //       setSession(session)

  //       // VERY IMPORTANT:
  //       // Do NOT expose recovery user as normal logged-in user
  //       setUser(null)
  //       setProfile(null)
  //       setLoading(false)

  //       return
  //     }

  //     // -----------------------------------------------
  //     // SIGNED OUT
  //     // -----------------------------------------------

  //     if (event === 'SIGNED_OUT') {
  //       setIsPasswordRecovery(false)
  //       setSession(null)
  //       setUser(null)
  //       setProfile(null)
  //       setLoading(false)

  //       return
  //     }

  //     // -----------------------------------------------
  //     // NORMAL AUTHENTICATED SESSION
  //     // -----------------------------------------------

  //     if (session?.user) {
  //       setIsPasswordRecovery(false)
  //       setSession(session)
  //       setUser(session.user)

  //       await loadProfile()
  //     } else {
  //       setIsPasswordRecovery(false)
  //       setSession(null)
  //       setUser(null)
  //       setProfile(null)
  //       setLoading(false)
  //     }
  //   })

  //   // -----------------------------------------------
  //   // CHECK EXISTING SESSION
  //   // -----------------------------------------------

  //   const initializeAuth = async () => {
  //     try {
  //       const {
  //         data: { session },
  //       } = await supabase.auth.getSession()

  //       if (!mounted) return

  //       /*
  //        * Check whether this is a password-recovery URL.
  //        *
  //        * Supabase recovery links commonly contain:
  //        * type=recovery
  //        */

  //       const hash =
  //         typeof window !== 'undefined'
  //           ? window.location.hash
  //           : ''

  //       const search =
  //         typeof window !== 'undefined'
  //           ? window.location.search
  //           : ''

  //       const isRecoveryUrl =
  //         hash.includes('type=recovery') ||
  //         search.includes('type=recovery')

  //       if (isRecoveryUrl) {
  //         setIsPasswordRecovery(true)
  //         setSession(session)
  //         setUser(null)
  //         setProfile(null)
  //         setLoading(false)

  //         return
  //       }

  //       // Normal existing session
  //       if (session?.user) {
  //         setIsPasswordRecovery(false)
  //         setSession(session)
  //         setUser(session.user)

  //         await loadProfile()
  //       } else {
  //         setIsPasswordRecovery(false)
  //         setSession(null)
  //         setUser(null)
  //         setProfile(null)
  //         setLoading(false)
  //       }
  //     } catch (error) {
  //       console.error('Error initializing auth:', error)

  //       if (!mounted) return

  //       setIsPasswordRecovery(false)
  //       setSession(null)
  //       setUser(null)
  //       setProfile(null)
  //       setLoading(false)
  //     }
  //   }

  //   initializeAuth()

  //   return () => {
  //     mounted = false
  //     subscription.unsubscribe()
  //   }
  // }, [])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
        try {
            const {
                data: { session },
                error
            } = await supabase.auth.getSession()

            if (error) throw error
            if (!mounted) return

            if (session?.user) {
                setSession(session)
                setUser(session.user)

                // Auth callback ke bahar profile load
                await loadProfile()
            } else {
                setSession(null)
                setUser(null)
                setProfile(null)
                setLoading(false)
            }
        } catch (error) {
            if (error?.name === 'AbortError') {
                console.log('Auth initialization aborted')
                return
            }

            console.error('Error initializing auth:', error)

            if (!mounted) return

            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false)
        }
    }

    initializeAuth()

    const {
        data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return

        console.log('Supabase Auth Event:', event)

        if (event === 'PASSWORD_RECOVERY') {
            setIsPasswordRecovery(true)
            setSession(session)
            setUser(null)
            setProfile(null)
            setLoading(false)
            return
        }

        if (event === 'SIGNED_OUT') {
            setIsPasswordRecovery(false)
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false)
            return
        }

        if (event === 'SIGNED_IN' && session?.user) {
            setIsPasswordRecovery(false)
            setSession(session)
            setUser(session.user)

            // callback ke andar loadProfile() mat karo
            setTimeout(() => {
                if (mounted) {
                    loadProfile()
                }
            }, 0)

            return
        }

        if (!session) {
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false)
        }
    })

    return () => {
        mounted = false
        subscription.unsubscribe()
    }
}, [])

  // --------------------------------------------------
  // SIGN UP
  // --------------------------------------------------

  const signUp = async (email, password, fullName, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      throw error
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          phone,
          role: 'user',
        })

      if (profileError) {
        throw profileError
      }
    }

    return data
  }

  // --------------------------------------------------
  // SIGN IN
  // --------------------------------------------------

  const signIn = async (email, password) => {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      throw error
    }

    // Make sure normal login exits recovery mode
    setIsPasswordRecovery(false)
    setSession(data.session)
    setUser(data.user)

    return data
  }

  // --------------------------------------------------
  // SIGN OUT
  // --------------------------------------------------

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    setIsPasswordRecovery(false)
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  // --------------------------------------------------
  // UPDATE PROFILE
  // --------------------------------------------------

  const updateProfile = async (data) => {
    const updated = await authAPI.updateProfile(data)

    setProfile(updated)

    return updated
  }

  // --------------------------------------------------
  // UPDATE PASSWORD
  // --------------------------------------------------

  const updatePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      throw error
    }
  }

  // --------------------------------------------------
  // FORGOT PASSWORD
  // --------------------------------------------------

  const resetPassword = async (email) => {
    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          `${window.location.origin}/auth/update-password`,
      })

    if (error) {
      throw error
    }
  }

  // --------------------------------------------------
  // ADMIN
  // --------------------------------------------------

  const isAdmin = profile?.role === 'admin'

  // --------------------------------------------------
  // CONTEXT VALUE
  // --------------------------------------------------

  const value = {
    user,
    profile,
    session,
    loading,

    // IMPORTANT
    isPasswordRecovery,

    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
    resetPassword,
    isAdmin,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    )
  }

  return context
}