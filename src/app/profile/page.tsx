'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import {
  Mail,
  BadgeCheck,
  User2,
  GraduationCap,
  Calendar,
  FileText,
  MapPin,
  School,
  Home,
} from 'lucide-react'
type ProfileFieldProps = {
  icon: React.ReactNode
  label: string
  value: string | number
}

function ProfileField({ icon, label, value }: ProfileFieldProps) {
  return (
    <div className="flex items-start gap-4">
      <div>{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-base font-medium text-gray-900">{value || '—'}</div>
      </div>
    </div>
  )
}


export default function ProfilePage() {
  const [student, setStudent] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData?.session?.user
      if (!user) return

      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .single()

      if (studentData) {
        setStudent(studentData)
        setLoading(false)
      } else {
        const { data: userData } = await supabase
          .from('users')
          .select('email, role')
          .eq('id', user.id)
          .single()
        setProfile(userData)
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) return <div className="p-6 text-gray-600 text-sm">Загрузка...</div>

  if (student) {
    return (
      <div className="p-6">
  <h1 className="text-3xl font-bold text-blue-700 mb-8">Профиль студента</h1>

  <Card className="max-w-3xl shadow-lg border border-gray-200">
    <CardContent className="py-8 px-8 space-y-8 text-base text-gray-800">

      {/* Personal Info */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Личная информация</h2>
        <div className="grid gap-3">
          <ProfileField icon={<User2 className="w-6 h-6 text-blue-500" />} label="ФИО" value={student.full_name} />
          <ProfileField icon={<Calendar className="w-6 h-6 text-blue-500" />} label="Дата рождения" value={student.birth_date} />
          <ProfileField icon={<FileText className="w-6 h-6 text-blue-500" />} label="Номер студента" value={student.student_number} />
          <ProfileField icon={<MapPin className="w-6 h-6 text-blue-500" />} label="Язык" value={student.language} />
        </div>
      </div>

      <div className="border-t" />

      {/* Academic Info */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Учебная информация</h2>
        <div className="grid gap-3">
          <ProfileField icon={<GraduationCap className="w-6 h-6 text-indigo-500" />} label="Специализация" value={student.specialization} />
          <ProfileField icon={<School className="w-6 h-6 text-purple-500" />} label="Группа" value={student.group_name} />
          <ProfileField icon={<BadgeCheck className="w-6 h-6 text-green-500" />} label="Степень" value={student.degree} />
          <ProfileField icon={<BadgeCheck className="w-6 h-6 text-blue-500" />} label="Курс" value={`${student.year} курс`} />
          <ProfileField icon={<User2 className="w-6 h-6 text-teal-500" />} label="Тьютор" value={student.tutor} />
          <ProfileField icon={<BadgeCheck className="w-6 h-6 text-yellow-500" />} label="Стипендия" value={student.stipend} />
        </div>
      </div>

      <div className="border-t" />

      {/* Address Info */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Адрес</h2>
        <div className="grid gap-3">
          <ProfileField icon={<Home className="w-6 h-6 text-blue-500" />} label="Постоянный адрес" value={student.address_perm} />
          <ProfileField icon={<Home className="w-6 h-6 text-gray-400" />} label="Временный адрес" value={student.address_temp} />
        </div>
      </div>

    </CardContent>
  </Card>
</div>


    )
  }

  // fallback for teacher/admin
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Профиль</h1>
      <Card className="max-w-md shadow border">
        <CardContent className="py-6 px-4 space-y-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" />
            <span className="font-medium">Email:</span>
            <span>{profile?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-green-500" />
            <span className="font-medium">Роль:</span>
            <span>
              {profile?.role === 'admin' ? 'Администратор' : 'Преподаватель'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
