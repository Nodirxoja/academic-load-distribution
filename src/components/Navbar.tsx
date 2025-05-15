'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEffect, useState, useRef } from 'react'
import { UserCircle, LogOut , Settings } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [homeLink, setHomeLink] = useState('/')
  const [dropdownOpen, setDropdownOpen] = useState(false)
const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return

      const userId = user.id

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      const role = userData?.role

      if (role === 'admin') setHomeLink('/admin')
      else if (role === 'teacher') setHomeLink('/teacher')
      else if (role === 'student') setHomeLink('/student')
      else setHomeLink('/')
    }

    checkRole()
  }, [])
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)
  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [])
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (pathname === '/') return null

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <Link href={homeLink}>
        <h1 className="text-xl font-bold tracking-tight text-blue-600 cursor-pointer">
          Учебная Нагрузка
        </h1>
      </Link>

      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="focus:outline-none">
          <Settings  className="w-7 h-7 text-gray-700 hover:text-blue-600 transition" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50">
            <Link
  href="/profile"
  className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 flex items-center gap-2"
>
  <UserCircle className="w-4 h-4" /> Профиль
</Link>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Выйти
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
