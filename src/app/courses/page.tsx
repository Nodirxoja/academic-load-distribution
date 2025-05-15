'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type Course = {
  id: string
  subject: string
  hours: number
  group: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [subject, setSubject] = useState('')
  const [hours, setHours] = useState('')
  const [group, setGroup] = useState('')

  // Fetch courses on load
  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from('courses').select('*')
      if (!error && data) {
        setCourses(data)
      }
    }
    fetchCourses()
  }, [])

  // Add course
  const handleAdd = async () => {
    if (!subject || !hours || !group) return
    const { data, error } = await supabase.from('courses').insert({
      subject,
      hours: parseInt(hours),
      group,
    }).select()
    if (!error && data) {
      setCourses(prev => [...prev, ...data])
      setSubject('')
      setHours('')
      setGroup('')
    }
  }

  // Delete course
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (!error) {
      setCourses(courses.filter(c => c.id !== id))
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-700">Курсы</h1>

      {/* Form */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input placeholder="Название курса" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Input type="number" placeholder="Часы" value={hours} onChange={(e) => setHours(e.target.value)} />
        <Input placeholder="Группа" value={group} onChange={(e) => setGroup(e.target.value)} />
        <Button onClick={handleAdd}>Добавить</Button>
      </div>

      {/* List */}
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{c.subject}</p>
                <p className="text-sm text-gray-500">{c.group} — {c.hours} ч.</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>
                Удалить
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
