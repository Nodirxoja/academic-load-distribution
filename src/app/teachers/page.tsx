'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type Teacher = {
  id: string
  name: string
  subject: string
  hours: number
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [hours, setHours] = useState('')

  // Fetch data
  useEffect(() => {
    const fetchTeachers = async () => {
      const { data, error } = await supabase.from('teachers').select('*')
      if (!error && data) {
        setTeachers(data)
      }
    }
    fetchTeachers()
  }, [])

  // Add new teacher
  const handleAdd = async () => {
    if (!name || !subject || !hours) return
    const { data, error } = await supabase.from('teachers').insert({
      name,
      subject,
      hours: parseInt(hours),
    }).select()
    if (!error && data) {
      setTeachers((prev) => [...prev, ...data])
      setName('')
      setSubject('')
      setHours('')
    }
  }

  // Delete teacher
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('teachers').delete().eq('id', id)
    if (!error) {
      setTeachers(teachers.filter((t) => t.id !== id))
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-700">Преподаватели</h1>

      {/* Form */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Предмет" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Input type="number" placeholder="Часы" value={hours} onChange={(e) => setHours(e.target.value)} />
        <Button onClick={handleAdd}>Добавить</Button>
      </div>

      {/* Teachers */}
      <div className="grid gap-4 md:grid-cols-2">
        {teachers.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-gray-500">{t.subject} — {t.hours} ч.</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(t.id)}>
                Удалить
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
