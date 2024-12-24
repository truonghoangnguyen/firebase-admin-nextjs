import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pink Keto - AI-Powered Document Scanner',
  description: 'Transform your documents into searchable text instantly with our AI-powered document scanning solution. Fast, accurate, and secure document processing.',
  keywords: 'document scanner, OCR, text extraction, AI document processing, document management',
  openGraph: {
    title: 'Pink Keto - AI-Powered Document Scanner',
    description: 'Transform your documents into searchable text instantly with our AI-powered document scanning solution.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Pink Keto',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pink Keto - AI-Powered Document Scanner',
    description: 'Transform your documents into searchable text instantly with our AI-powered document scanning solution.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  themeColor: '#EC4899', // Pink-600 from Tailwind
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#EC4899" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
