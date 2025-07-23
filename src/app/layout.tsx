import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '../context/AuthContext'
import Link from 'next/link'

// keep Comic Neue
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
      <body
        className={comic.className}
        style={{
          position: 'relative',
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: `'Comic Neue', sans-serif`,
        }}
      >
        {/* Smiledust logo */}
        <Link
          href="https://smiledust.com"
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            textDecoration: 'none',
            color: '#ec4899',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            fontFamily: `'Pacifico', cursive`,
            zIndex: 1000,
          }}
          className="smiledust-font"
        >
          smiledust
        </Link>

        {/* Main content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AuthProvider>{children}</AuthProvider>
        </main>

        {/* Footer */}
        <footer
          style={{
            backgroundColor: '#eaeaea',
            textAlign: 'center',
            padding: '0.5rem',
            fontSize: '0.9rem',
            color: '#555',
          }}
        >
          © {new Date().getFullYear()} smiledust. All rights reserved.
        </footer>
      </body>
    </html>
  )
}
