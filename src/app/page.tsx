'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '../context/AuthContext'
import { signOut } from 'firebase/auth'
import { auth, db } from '../lib/firebase'
import confetti from 'canvas-confetti'
import { Timestamp, doc, setDoc, updateDoc, increment } from 'firebase/firestore'
import words from '../data/words.json'

// Types
type WordItem = {
  word: string
  image: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="mt-4 px-4 py-2 bg-blue-200 text-blue-800 rounded hover:bg-blue-300"
  >
    🔙 Back
  </button>
)

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const [gameWords, setGameWords] = useState<WordItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const [selectedLetters, setSelectedLetters] = useState<(string | null)[]>([])
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([])
  const [usedIndices, setUsedIndices] = useState<number[]>([])
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')

  const categories = Array.from(new Set(words.map(w => w.category)))

  const handleLogout = () => {
    signOut(auth)
  }

  useEffect(() => {
    if (difficulty && category) {
      const filtered = words.filter(
        w => w.difficulty === difficulty && w.category === category
      )
      const shuffled = shuffle(filtered)
      setGameWords(shuffled)
      setCurrentIndex(0)
    }
  }, [difficulty, category])

  const currentWord = gameWords[currentIndex]

  useEffect(() => {
    if (!currentWord) return
    const shuffledLetters = shuffle([...currentWord.word.split('')])
    setScrambledLetters(shuffledLetters)
    setSelectedLetters(Array(currentWord.word.length).fill(null))
    setUsedIndices([])
    setStatus('idle')
  }, [currentWord])

  const handleLetterClick = (letter: string, idx: number) => {
    const nextSlot = selectedLetters.findIndex(slot => slot === null)
    if (nextSlot === -1) return
    const updatedSlots = [...selectedLetters]
    updatedSlots[nextSlot] = letter
    setSelectedLetters(updatedSlots)
    setUsedIndices([...usedIndices, idx])
  }

  const handleSlotClick = (slotIdx: number) => {
    const updatedSlots = [...selectedLetters]
    const removedLetter = updatedSlots[slotIdx]
    if (!removedLetter) return
    updatedSlots[slotIdx] = null

    const idxToRemove = usedIndices.find(
      idx => scrambledLetters[idx] === removedLetter && !updatedSlots.includes(removedLetter)
    )
    if (idxToRemove !== undefined) {
      setUsedIndices(usedIndices.filter(idx => idx !== idxToRemove))
    }
    setSelectedLetters(updatedSlots)
  }

  const handleCheck = async () => {
    if (!currentWord) return

    const attempt = selectedLetters.join('')
    if (attempt.toLowerCase() === currentWord.word) {
      setStatus('correct')
      confetti()

      if (user) {
        const scrapbookRef = doc(db, `users/${user.uid}/scrapbook/${currentWord.word}`)
        const userRef = doc(db, 'users', user.uid)

        await setDoc(scrapbookRef, {
          word: currentWord.word,
          image: currentWord.image,
          completedAt: Timestamp.now(),
        })

        await updateDoc(userRef, {
          wordsSolved: increment(1),
        })
      }

      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % gameWords.length)
      }, 1500)
    } else {
      setStatus('wrong')
      setTimeout(() => setStatus('idle'), 1000)
    }
  }

  const allSlotsFilled = selectedLetters.every(s => s !== null)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-100 via-white to-blue-200 relative">
      {/* Login/Logout/Scrapbook */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {user ? (
          <>
            <button
              onClick={() => router.push('/leaderboard')}
              className="px-3 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 text-sm"
            >
              🏆 Leaderboard
            </button>
            <button
              onClick={() => router.push('/scrapbook')}
              className="px-3 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 text-sm"
            >
              📒 Scrapbook
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="px-3 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 text-sm"
          >
            Login
          </button>
        )}
      </div>

      {/* Game area */}
      {!difficulty ? (
        <div className="bg-white p-6 rounded-3xl shadow-xl flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-blue-700 text-center">Choose Difficulty</h1>
          <div className="flex gap-4 justify-center">
            {(['easy', 'medium', 'hard'] as const).map(level => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className="px-4 py-2 rounded bg-blue-300 text-white font-bold hover:bg-blue-400"
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      ) : !category ? (
        <div className="bg-white p-6 rounded-3xl shadow-xl flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-blue-700 text-center">Choose Category</h1>
          <div className="flex gap-4 justify-center flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-4 py-2 rounded bg-blue-300 text-white font-bold hover:bg-blue-400"
              >
                {cat}
              </button>
            ))}
          </div>
          <BackButton onClick={() => setDifficulty(null)} />
        </div>
      ) : !currentWord ? (
        <div className="bg-white p-6 rounded-3xl shadow-xl flex flex-col gap-4 items-center">
          <h1 className="text-3xl text-blue-700 text-center">No words available for this selection</h1>
          <BackButton
            onClick={() => {
              setDifficulty(null)
              setCategory(null)
            }}
          />
        </div>
      ) : (
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center gap-6 border-4 border-blue-300">
          <h1 className="text-3xl font-bold text-blue-700">
            {difficulty?.toUpperCase()} - {category?.toUpperCase()}
          </h1>

          <Image
            src={currentWord.image}
            alt={currentWord.word}
            width={192}
            height={192}
            className="object-contain"
          />

          {/* Letter slots */}
          <div className="flex gap-2 flex-wrap justify-center">
            {selectedLetters.map((slot, idx) => (
              <div
                key={idx}
                onClick={() => handleSlotClick(idx)}
                className={`w-12 h-12 border-2 rounded-lg bg-white text-2xl text-center leading-[3rem] cursor-pointer ${
                  slot ? 'border-blue-500 text-gray-800' : 'border-gray-300 text-gray-300'
                }`}
              >
                {slot || ''}
              </div>
            ))}
          </div>

          {/* Scrambled letters */}
          <div className="flex gap-2 mt-4 flex-wrap justify-center">
            {scrambledLetters.map((letter, idx) => (
              <button
                key={idx}
                onClick={() => handleLetterClick(letter, idx)}
                disabled={usedIndices.includes(idx)}
                className={`w-12 h-12 rounded text-xl font-bold shadow ${
                  usedIndices.includes(idx)
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-300 hover:bg-blue-400 text-white'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>

          <button
            onClick={handleCheck}
            disabled={!allSlotsFilled}
            className={`px-6 py-3 mt-4 rounded-full text-xl font-bold shadow-lg ${
              allSlotsFilled
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Check
          </button>

          {status === 'correct' && (
            <p className="text-green-600 text-lg font-semibold">🎉 Correct!</p>
          )}
          {status === 'wrong' && (
            <p className="text-red-600 text-lg font-semibold">❌ Try again!</p>
          )}

          <BackButton
            onClick={() => {
              setDifficulty(null)
              setCategory(null)
            }}
          />
        </div>
      )}
    </main>
  )
}
