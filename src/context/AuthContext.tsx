'use client'

import React, { useEffect, useState, useContext, createContext } from 'react'
import { auth } from '../lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'

const AuthContext = createContext<{ user: User | null }>({ user: null })

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}
