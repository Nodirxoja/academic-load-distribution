// /app/api/admin/create-user/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Only used on server
)

export async function POST(req: Request) {
  const { email, password, role } = await req.json()

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const userId = data.user?.id

  // Insert into your `users` table
  await supabaseAdmin.from('users').insert({
    id: userId,
    email,
    role,
  })

  return NextResponse.json({ success: true, user: data.user }, { status: 200 })
}
