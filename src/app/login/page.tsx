'use client'

import { useEffect, useState } from 'react'
import { auth } from '../../lib/firebase'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { user } = useAuth()
  const router = useRouter()

  // 🔷 Redirect after login
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isNewUser) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      // no need for router.push() here — handled by useEffect
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 p-4">
      <div className="bg-white p-6 rounded-3xl shadow-xl flex flex-col gap-4 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-blue-700 text-center">
          {isNewUser ? 'Sign Up' : 'Log In'}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="px-4 py-2 border rounded text-lg text-gray-800"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="px-4 py-2 border rounded text-lg text-gray-800"
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 font-bold rounded ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {loading
              ? 'Loading…'
              : isNewUser
              ? 'Sign Up'
              : 'Log In'}
          </button>
        </form>

        <button
          onClick={() => setIsNewUser(!isNewUser)}
          className="text-sm text-blue-600 hover:underline"
        >
          {isNewUser
            ? 'Already have an account? Log in'
            : 'Need an account? Sign up'}
        </button>

        {error && (
          <p className="text-red-500 text-center text-sm">{error}</p>
        )}
      </div>
    </main>
  )
}
