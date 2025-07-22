'use client'

import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import Image from 'next/image'

type User = {
  name: string
  avatar: string | null
  wordsSolved: number
  uid: string
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchLeaderboard = async () => {
      const q = query(collection(db, 'users'), orderBy('wordsSolved', 'desc'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[]
      setUsers(data)
      setLoading(false)
    }

    fetchLeaderboard()
  }, [user, router])

  if (loading) {
    return <p className="text-center mt-10 text-blue-700">Loading leaderboard…</p>
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 p-6">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-blue-700">🏆 Leaderboard</h1>
          <button
            onClick={() => router.push('/')}
            className="px-3 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 text-sm"
          >
            🏠 Home
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {users.map((u, idx) => (
            <div
              key={u.uid}
              className={`flex items-center justify-between rounded-xl p-3 shadow ${
                idx === 0
                  ? 'bg-pink-100'
                  : idx === 1
                  ? 'bg-blue-100'
                  : idx === 2
                  ? 'bg-yellow-100'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">{idx + 1}</span>
                <Image
                  src={u.avatar || '/avatars/default.png'}
                  alt={u.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                  unoptimized
                />
                <button
                  onClick={() => router.push(`/scrapbook/${u.uid}`)}
                  className="font-semibold text-blue-800 hover:underline"
                >
                  {u.name}
                </button>
              </div>
              <span className="text-blue-700">{u.wordsSolved} words</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
