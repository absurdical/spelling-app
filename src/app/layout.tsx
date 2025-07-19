import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '../context/AuthContext'

// optional: keep Comic Neue or use default sans
import { Comic_Neue } from 'next/font/google'

const comic = Comic_Neue({ weight: ['400', '700'], subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Spelling App',
  description: 'Fun spelling game with scrapbook & leaderboard for kids',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={comic.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

