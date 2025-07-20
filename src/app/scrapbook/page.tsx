'use client'

import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'

type ScrapbookItem = {
  word: string
  image: string
  completedAt: any
}

export default function ScrapbookPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<ScrapbookItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        const colRef = collection(db, `users/${user.uid}/scrapbook`)
        const q = query(colRef, orderBy('completedAt', 'desc'), limit(9))
        const snapshot = await getDocs(q)
        const data: ScrapbookItem[] = snapshot.docs.map(doc => doc.data() as ScrapbookItem)
        setItems(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  const handleDeleteAccount = async () => {
    if (!user) return

    const confirmed = confirm(
      'Are you sure you want to delete your account and all your data? This cannot be undone.'
    )
    if (!confirmed) return

    setDeleting(true)
    setError('')
    try {
      // 🔷 Delete scrapbook data
      const scrapbookRef = collection(db, `users/${user.uid}/scrapbook`)
      const scrapbookDocs = await getDocs(scrapbookRef)
      for (const docSnap of scrapbookDocs.docs) {
        await deleteDoc(docSnap.ref)
      }

      // 🔷 Delete profile
      const profileRef = doc(db, `users/${user.uid}`)
      await deleteDoc(profileRef)

      // 🔷 Try deleting user
      await deleteUser(user)

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/requires-recent-login') {
        const password = prompt(
          'Please re-enter your password to confirm account deletion:'
        )
        if (!password) {
          setError('Account deletion canceled: password required.')
          setDeleting(false)
          return
        }

        try {
          const credential = EmailAuthProvider.credential(user.email!, password)
          await reauthenticateWithCredential(user, credential)
          await deleteUser(user)

          setSuccess(true)
          setTimeout(() => {
            router.push('/login')
          }, 2000)

        } catch (reauthErr: any) {
          console.error(reauthErr)
          setError(reauthErr.message || 'Reauthentication failed.')
        }
      } else {
        setError(err.message || 'Failed to delete account.')
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-blue-700">📒 Your Scrapbook</h1>
          <button
            onClick={() => router.push('/')}
            className="px-3 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 text-sm"
          >
            🏠 Home
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white animate-pulse rounded-2xl shadow-md p-4 h-40"
              ></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-blue-700">No words completed yet. Start playing!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map(item => (
              <div
                key={item.word}
                className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center border-2 border-blue-200"
              >
                <img
                  src={item.image}
                  alt={item.word}
                  loading="lazy"
                  className="w-24 h-24 object-contain mb-2"
                />
                <p className="text-lg font-bold text-blue-700">{item.word}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-2">
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className={`px-4 py-2 rounded text-white font-bold ${
              deleting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {deleting ? 'Deleting…' : '🗑 Delete Account & Data'}
          </button>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {success && (
            <p className="text-green-600 font-bold text-center mt-4">
              ✅ Your account and data have been deleted. Redirecting…
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
