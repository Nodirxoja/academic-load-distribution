'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'

type Teacher = {
  id: string
  name: string
  subject: string
  hours: number
}

type Course = {
  id: string
  subject: string
  hours: number
  group: string
}

type Assignment = {
  subject: string
  group: string
  hours: number
  teacher: string
}

export default function DistributionPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])

  useEffect(() => {
    const loadData = async () => {
      const { data: teachersData } = await supabase.from('teachers').select('*')
      const { data: coursesData } = await supabase.from('courses').select('*')

      if (teachersData && coursesData) {
        const remainingTeachers = teachersData.map(t => ({
          ...t,
          remaining: t.hours,
        }))

        const result: Assignment[] = []

        for (const course of coursesData) {
          const available = remainingTeachers.find(t => t.remaining >= course.hours)
          if (available) {
            result.push({
              subject: course.subject,
              group: course.group,
              hours: course.hours,
              teacher: available.name,
            })
            available.remaining -= course.hours
          } else {
            result.push({
              subject: course.subject,
              group: course.group,
              hours: course.hours,
              teacher: '❌ Не назначен',
            })
          }
        }

        setAssignments(result)
      }
    }

    loadData()
  }, [])

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-700">Распределение нагрузки</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {assignments.map((a, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{a.subject} ({a.group})</p>
                <p className={`text-sm ${a.teacher.includes('Не назначен') ? 'text-red-500' : 'text-gray-500'}`}>
                  {a.teacher} — {a.hours} ч.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
