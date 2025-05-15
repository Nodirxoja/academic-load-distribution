'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

type TeacherBarChartProps = {
  userId?: string | null
}

export default function TeacherBarChart({ userId }: TeacherBarChartProps) {
  const [series, setSeries] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
  const { data: users } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('role', 'teacher')

  const { data: courses } = await supabase
    .from('courses')
  .select('id, teacher_id, subjects ( default_hours )')

  if (!users || !courses) return

  // Map teachers
  const teacherMap: Record<string, { name: string; used: number }> = {}

  for (const t of users) {
    teacherMap[t.id] = {
      name: t.email || 'Без имени',
      used: 0,
    }
  }

  for (const course of courses) {
    const subject = course.subjects as { default_hours?: number }
const hours = subject.default_hours ?? 0

    if (teacherMap[course.teacher_id]) {
      teacherMap[course.teacher_id].used += hours
    }
  }

  const names = Object.values(teacherMap).map(t => t.name)
  const used = Object.values(teacherMap).map(t => t.used)

  setCategories(names)
  setSeries([
    { name: 'Назначено часов', data: used },
  ])
}


    fetchData()
  }, [userId])

  return (
    <Chart
      type="bar"
      height={350}
      series={series}
      options={{
        chart: {
          stacked: true,
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 6,
            columnWidth: '40%',
          }
        },
        xaxis: {
          categories: categories
        },
        legend: {
          position: 'bottom'
        },
        colors: ['#3b82f6', '#22c55e']
      }}
    />
  )
}
