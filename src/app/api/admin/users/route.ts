import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Load from environment variables
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // 1. Fetch users from Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // 2. Fetch roles from the 'users' table
  const { data: roleData, error: roleError } = await supabaseAdmin
    .from('users')
    .select('id, role')

  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 500 })
  }

  // 3. Merge roles into auth users
  const mergedUsers = authData.users.map((user) => {
    const roleEntry = roleData.find((r) => r.id === user.id)
    return {
      id: user.id,
      email: user.email,
      role: roleEntry?.role || null,
    }
  })

  // 4. Return merged data
  return NextResponse.json({ users: mergedUsers }, { status: 200 })
}
