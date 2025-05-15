import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import Navbar from '../components/Navbar'
import { Toaster } from 'sonner'



const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Учебная Нагрузка',
  description: 'Система для распределения учебной нагрузки преподавателей',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-10">{children}</main>
                <Toaster richColors /> {/* ← Enables better colors */}

      </body>
    </html>
  )
}
