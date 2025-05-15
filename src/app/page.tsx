'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      router.push('/auth/callback')
    }
  })

  return () => {
    subscription.unsubscribe()
  }
}, [router])


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl p-6 rounded-xl w-full max-w-md">
        <h1 className="text-xl font-bold text-center mb-4">Добро пожаловать</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">Войдите в систему, чтобы продолжить</p>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          theme="light"
          redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`}
        />
      </div>
    </div>
  )
}
