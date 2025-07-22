'use client'

import { use, useEffect, useState } from 'react'
import { db } from '../../../lib/firebase'
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type ScrapbookItem = {
  word: string
  image: string
  completedAt: Timestamp
}

export default function FriendScrapbookPage(props: { params: Promise<{ uid: string }> }) {
  const { uid } = use(props.params) // if props.params is a Promise

  const router = useRouter()
  const [items, setItems] = useState<ScrapbookItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const colRef = collection(db, `users/${uid}/scrapbook`)
        const q = query(colRef, orderBy('completedAt', 'desc'), limit(9))
        const snapshot = await getDocs(q)
        const data: ScrapbookItem[] = snapshot.docs.map(
          doc => doc.data() as ScrapbookItem
        )
        setItems(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [uid])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-blue-700">📒 Scrapbook</h1>
          <button
            onClick={() => router.push('/leaderboard')}
            className="px-3 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 text-sm"
          >
            🔙 Back to Leaderboard
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
          <p className="text-center text-blue-700">No words completed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map(item => (
              <div
                key={item.word}
                className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center border-2 border-blue-200"
              >
                <Image
                  src={item.image}
                  alt={item.word}
                  width={96}
                  height={96}
                  className="object-contain mb-2"
                />
                <p className="text-lg font-bold text-blue-700">{item.word}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
