'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import avatars from '../../data/avatars.json'

export default function ChooseAvatarPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    router.push('/login')
    return null
  }

  const handleAvatarSelect = async (avatar: string) => {
    setLoading(true)
    setError('')
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        avatar
      })
      router.push('/')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to save avatar')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 p-6">
      <div className="bg-white p-6 rounded-3xl shadow-xl flex flex-col gap-4 w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-700 text-center">Choose Your Avatar</h1>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {avatars.map((avatar) => (
            <button
              key={avatar}
              onClick={() => handleAvatarSelect(avatar)}
              disabled={loading}
              className="p-2 rounded hover:ring-4 hover:ring-blue-300"
            >
              <img
                src={avatar}
                alt="Avatar"
                className="w-24 h-24 object-contain mx-auto"
              />
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        {loading && <p className="text-center text-blue-600">Saving avatar…</p>}
      </div>
    </main>
  )
}
