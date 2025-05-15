'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const checkUserAndRedirect = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error('Session error:', sessionError.message)
    return
  }

  const user = session?.user
  if (!user) {
    console.warn('No session user')
    return
  }

  console.log('User ID:', user.id)

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user role:', error.message)
    return
  }

  if (!data) {
    console.warn('User not found in users table — inserting default')
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ id: user.id, email: user.email, role: 'student' }])

    if (insertError) {
      console.error('Insert error:', insertError.message)
      return
    }

    router.push('/student')
    return
  }

  const role = data.role

  if (role === 'admin') router.push('/admin')
  else if (role === 'teacher') router.push('/teacher')
  else router.push('/student')
}


    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) checkUserAndRedirect()
    })

    checkUserAndRedirect()

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-xl font-semibold text-blue-600 animate-pulse">Logging you in...</h1>
    </div>
  )
}
