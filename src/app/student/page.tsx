'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BookOpen, User2, GraduationCap } from 'lucide-react'

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [lessons, setLessons] = useState<{ [key: string]: any[] }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData?.session?.user
      if (!user) return

      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .single()

if (!studentData ) return

      setStudent(studentData)

      const { data: courseData } = await supabase
        .from('courses')
        .select('id, teacher_id, subject_id, subjects(name, default_hours), users(email)')


      setCourses(courseData || [])

      const allLessons: { [key: string]: any[] } = {}
      for (const course of courseData || []) {
        const { data } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', course.id)
        allLessons[course.id] = data || []
      }

      setLessons(allLessons)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-6 text-sm text-gray-600">Загрузка данных...</div>
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold text-blue-700">Студенческий кабинет</h1>

      {student && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User2 className="w-5 h-5" /> {student.full_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-gray-700">
            <p><GraduationCap className="inline w-4 h-4 mr-1" /> Группа: {student.group_name}</p>
            <p>Специализация: {student.specialization || '—'}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> {course.subjects?.name ?? 'Предмет'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>Преподаватель: {course.users?.email ?? '—'}</p>
              <p>Часы: {course.subjects?.default_hours ?? '—'}</p>
              <p>Уроков загружено: {lessons[course.id]?.length ?? 0}</p>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="mt-2">Просмотреть уроки</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{course.subjects?.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-96 overflow-auto text-sm">
                    {lessons[course.id]?.length > 0 ? (
                      lessons[course.id].map((l, idx) => (
                        <div key={l.id} className="border rounded p-2">
                          <b>{idx + 1}. {l.title}</b>
                          <p className="text-gray-600">{l.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">Нет уроков</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
