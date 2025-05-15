'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import TeacherBarChart from '@/components/TeacherBarChart'


export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [teacherCount, setTeacherCount] = useState(0)
  const [courseCount, setCourseCount] = useState(0)
  const [totalHours, setTotalHours] = useState(0)
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([])

useEffect(() => {
  const fetchData = async () => {
    const session = await supabase.auth.getSession()
    const user = session?.data?.session?.user
    const userId = user?.id ?? null
    setUserId(userId)

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    const currentRole = userData?.role ?? 'teacher'
    setRole(currentRole)

    const { data: courses } = await supabase
      .from('courses')
      .select('id, teacher_id, subject_id, subjects(name, default_hours)')
      .match(currentRole === 'teacher' ? { teacher_id: userId } : {})

    const { data: teachers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'teacher')

    if (currentRole === 'admin') setTeacherCount(teachers?.length || 0)

    if (courses) {
      setCourseCount(courses.length)

      let total = 0
      const pieData: Record<string, number> = {}

      for (const course of courses) {
        const subject = course.subjects as unknown as { name: string; default_hours: number } | null
        const subjectName = subject?.name || 'Неизвестный предмет'
        const hours = subject?.default_hours || 0

        total += hours
        pieData[subjectName] = (pieData[subjectName] || 0) + hours
      }

      setTotalHours(total)

      const formatted = Object.entries(pieData).map(([name, value]) => ({ name, value }))
      setChartData(formatted)
    }
  }

  fetchData()
}, [])


  const COLORS = ['#6366f1', '#60a5fa', '#34d399', '#facc15', '#fb7185', '#f472b6']

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-700">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {role === 'admin' && (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-sm text-gray-500">Преподавателей</p>
              <p className="text-2xl font-bold text-blue-600">{teacherCount}</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-gray-500">Курсов</p>
            <p className="text-2xl font-bold text-blue-600">{courseCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-gray-500">Всего часов</p>
            <p className="text-2xl font-bold text-blue-600">{totalHours}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Распределение часов по курсам</h2>
        <ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={chartData}
      cx="50%"
      cy="50%"
      outerRadius={100}
      fill="#8884d8"
      dataKey="value"
      label={({ name, value }) => `${name}: ${value} ч.`}  // 👈 Custom label here
    >
      {chartData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
  </PieChart>
</ResponsiveContainer>

      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Загрузка преподавателя</h2>
        <TeacherBarChart userId={role === 'teacher' ? userId : null} />
      </div>
    </div>
  )
}
