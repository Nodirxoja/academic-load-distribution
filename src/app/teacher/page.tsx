'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Edit,
  Trash2,
  Users,
  BookOpenCheck,
  Eye,
  Plus,
  User2,
} from 'lucide-react'

export default function TeacherPage() {
  const [tab, setTab] = useState<'courses' | 'groups'>('courses')
  const [courses, setCourses] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null)
  const [lessons, setLessons] = useState<{ [key: string]: any[] }>({})
  const [newLesson, setNewLesson] = useState<{ title: string; content: string }>({ title: '', content: '' })
  const [editLessonId, setEditLessonId] = useState<string | null>(null)
  const [editLesson, setEditLesson] = useState<{ title: string; content: string }>({ title: '', content: '' })

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData?.session?.user
      if (!user) return

      const { data: courseData } = await supabase
        .from('courses')
        .select('id, teacher_id, subjects(name, default_hours), groups(name)')
        .eq('teacher_id', user.id)

      const { data: groupData } = await supabase.from('groups').select()
      const { data: studentData } = await supabase.from('students').select()

      setCourses(courseData || [])
      setGroups(groupData || [])
      setStudents(studentData || [])
    }

    load()
  }, [])

  const openCourseDialog = async (course: any) => {
    setSelectedCourse(course)
    const { data } = await supabase.from('lessons').select('*').eq('course_id', course.id)
    setLessons({ [course.id]: data || [] })
  }

  const handleAddLesson = async () => {
    if (!newLesson.title || !newLesson.content || !selectedCourse) return
    const { error } = await supabase.from('lessons').insert({
      course_id: selectedCourse.id,
      title: newLesson.title,
      content: newLesson.content,
    })
    if (!error) {
      const { data } = await supabase.from('lessons').select('*').eq('course_id', selectedCourse.id)
      setLessons({ [selectedCourse.id]: data || [] })
      setNewLesson({ title: '', content: '' })
    }
  }

  const handleDeleteLesson = async (id: string) => {
    if (!selectedCourse) return
    const { error } = await supabase.from('lessons').delete().eq('id', id)
    if (!error) {
      const filtered = lessons[selectedCourse.id].filter(l => l.id !== id)
      setLessons({ [selectedCourse.id]: filtered })
    }
  }

  const handleUpdateLesson = async () => {
    if (!editLessonId || !selectedCourse) return
    await supabase.from('lessons').update(editLesson).eq('id', editLessonId)
    const { data } = await supabase.from('lessons').select('*').eq('course_id', selectedCourse.id)
    setLessons({ [selectedCourse.id]: data || [] })
    setEditLessonId(null)
    setEditLesson({ title: '', content: '' })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4">
        <Button
          variant={tab === 'courses' ? 'default' : 'outline'}
          onClick={() => setTab('courses')}
        >
          <BookOpenCheck className="w-4 h-4 mr-1" /> Курсы
        </Button>
        <Button
          variant={tab === 'groups' ? 'default' : 'outline'}
          onClick={() => setTab('groups')}
        >
          <Users className="w-4 h-4 mr-1" /> Группы
        </Button>
      </div>

      {tab === 'courses' && (
        <>
          <h1 className="text-2xl font-semibold text-blue-700">Мои предметы</h1>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Предмет</TableHead>
                <TableHead>Группа</TableHead>
                <TableHead>Часы</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.subjects?.name || '-'}</TableCell>
                  <TableCell>{course.groups?.name || '-'}</TableCell>
                  <TableCell>{course.subjects?.default_hours || '-'}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => openCourseDialog(course)}>
                          <Eye className="w-4 h-4 mr-1" /> Открыть
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>{course.subjects?.name} – {course.groups?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                          <Input
                            placeholder="Название урока"
                            value={newLesson.title}
                            onChange={(e) => setNewLesson(f => ({ ...f, title: e.target.value }))}
                          />
                          <Textarea
                            placeholder="Содержимое урока"
                            value={newLesson.content}
                            onChange={(e) => setNewLesson(f => ({ ...f, content: e.target.value }))}
                          />
                        </div>
                        <Button onClick={handleAddLesson}>
                          <Plus className="w-4 h-4 mr-1" /> Добавить урок
                        </Button>
                        <div className="mt-6 space-y-2">
  {lessons[course.id]?.map((lesson) => (
    <div key={lesson.id} className="border p-3 rounded flex justify-between items-start">
      {editLessonId === lesson.id ? (
        <div className="w-full space-y-2">
          <Input
            value={editLesson.title}
            onChange={(e) => setEditLesson(f => ({ ...f, title: e.target.value }))}
          />
          <Textarea
            value={editLesson.content}
            onChange={(e) => setEditLesson(f => ({ ...f, content: e.target.value }))}
          />
          <Button size="sm" onClick={handleUpdateLesson}>Сохранить</Button>
        </div>
      ) : (
        <>
          <div>
            <p className="font-semibold">
              {lessons[course.id].indexOf(lesson) + 1}. {lesson.title}
            </p>
            <p className="text-sm text-gray-600">{lesson.content}</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setEditLessonId(lesson.id)
                setEditLesson({ title: lesson.title, content: lesson.content })
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={() => handleDeleteLesson(lesson.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  ))}
</div>

                        <DialogFooter />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {tab === 'groups' && (

<>
  <h1 className="text-2xl font-semibold text-blue-700">Мои группы</h1>
  <div className="grid md:grid-cols-2 gap-4 mt-4">
    {groups.map((g) => {
      const groupStudents = students
        .filter((s) => s.group_name === g.name)
        .sort((a, b) => a.full_name.localeCompare(b.full_name)) // Sort A–Z

      return (
        <Dialog key={g.id}>
          <DialogTrigger asChild>
            <Button variant="outline" className="justify-between w-full">
              {g.name}
              <Eye className="w-4 h-4 ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Студенты группы {g.name}</DialogTitle>
            </DialogHeader>

            <div className="divide-y border rounded mt-4 max-h-96 overflow-auto">
              {groupStudents.length > 0 ? (
                groupStudents.map((s, index) => (
                  <div key={s.id} className="flex items-center gap-3 p-3">
                    <div className="text-sm text-gray-500 w-5">{index + 1}.</div>
                    <User2 className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">{s.full_name}</span>
                      <span className="text-xs text-gray-500">
                        Студ. номер: {s.student_number}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-gray-500 italic">
                  Нет студентов в этой группе
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">Закрыть</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    })}
  </div>
</>
      )}
    </div>
  )
}
