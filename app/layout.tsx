import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PharmAssist HR Agent',
  description: 'Gestion RH intelligente pour pharmacies françaises',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`dark ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

