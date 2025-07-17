import './globals.css'
import { Comic_Neue } from 'next/font/google'
import type { Metadata } from 'next'

const comic = Comic_Neue({ weight: ['400', '700'], subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Spelling App',
  description: 'A spelling game for kids',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={comic.className}>{children}</body>
    </html>
  )
}
