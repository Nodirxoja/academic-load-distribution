'use client'
import { toast } from 'sonner'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select'

import { Search, Trash2, Check, Edit, BookOpen, Users, User, Clock } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
interface Student {
  gender: string
  address_perm: string
  address_temp: string
  specialization: string
  language: string
  degree: string
  study_type: string
  year: string
  password: string
  id: string
  full_name: string
  student_number: string
  group_name: string
  email?: string
  tutor?: string
  birth_date?: string
  stipend?: string
}



export default function AdminPage() {
  const [teachers, setTeachers] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [form, setForm] = useState({
  subject_id: '', group_id: '', teacher_id: '',
  subject_name: '', default_hours: '',
  group_name: ''
})
const [currentTab, setCurrentTab] = useState<'courses' | 'subjects' | 'groups' | 'students' | 'users'>('courses')
const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null)
const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
const [subjectSearch, setSubjectSearch] = useState('')
const [groupSearch, setGroupSearch] = useState('');
const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
const [users, setUsers] = useState<any[]>([])
const [newUser, setNewUser] = useState({ email: '', password: '', role: '' })
const filteredSubjects = subjects.filter((s) =>
  s.name?.toLowerCase().includes(subjectSearch.toLowerCase())
)
const [studentForm, setStudentForm] = useState({
  full_name: '',
  email: '',
  password: '',
  student_number: '',
  birth_date: '',
  gender: '',
  specialization: '',
  language: '',
  degree: '',
  study_type: '',
  year: '',
  group_name: '',
  tutor: '',
  stipend: '',
  address_perm: '',
  address_temp: ''
})
const [showPass, setShowPass] = useState(false)
const [students, setStudents] = useState<any[]>([])
const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: teacherData } = await supabase
        .from('users')
        .select('id, email')
        .eq('role', 'teacher')

      const { data: subjectData } = await supabase
        .from('subjects')
        .select('id, name, default_hours')

      const { data: groupData } = await supabase
        .from('groups')
        .select('id, name')

      const { data: courseData } = await supabase
        .from('courses')
        .select(`
            id,
            subject_id,
            group_id,
            teacher_id,
            subjects ( name, default_hours),
            groups ( name ),
            users ( email )
        `)

      setTeachers(teacherData || [])
      setSubjects(subjectData || [])
      setGroups(groupData || [])
      setCourses(courseData || [])
    }

    fetchData()
  }, [])
useEffect(() => {
  if (currentTab === 'users') {
    const fetchUsers = async () => {
      const res = await fetch('/api/admin/users') 
      const json = await res.json()
      if (json?.users) setUsers(json.users)
    }
    fetchUsers()
  }
}, [currentTab])


const handleRoleChange = async (userId: string, newRole: string) => {
  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId)

  if (!error) {
    const updated = users.map(u =>
      u.id === userId ? { ...u, role: newRole } : u
    )
    setUsers(updated)
  }
}
useEffect(() => {
  const fetchStudents = async () => {
const { data, error } = await supabase.from('student_with_email').select('*')
    if (data) setStudents(data)
  }
  fetchStudents()
}, [])
const handleStudentDelete = async (id: string) => {
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (!error) setStudents(students.filter(s => s.id !== id))
}
const filteredStudents = students.filter(
  s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.group_name?.toLowerCase().includes(search.toLowerCase())
)

const filteredGroups = groups.filter((g) =>
  g.name.toLowerCase().includes(groupSearch.toLowerCase())
);


const handleStudentRegister = async () => {
  if (!studentForm.email || !studentForm.password || !studentForm.full_name) {
    alert("Заполните обязательные поля: имя, email, пароль")
    return
  }

  const { data: userData, error: authError } = await supabase.auth.admin.createUser({
    email: studentForm.email,
    password: studentForm.password,
    email_confirm: true,
    user_metadata: { role: 'student' }
  })

  if (authError) {
    alert("Ошибка при создании пользователя: " + authError.message)
    return
  }

  const userId = userData.user.id

  const { error: insertError } = await supabase.from('students').insert({
    id: userId,
    full_name: studentForm.full_name,
    birth_date: studentForm.birth_date,
    gender: studentForm.gender,
    student_number: studentForm.student_number,
    specialization: studentForm.specialization,
    language: studentForm.language,
    degree: studentForm.degree,
    study_type: studentForm.study_type,
    year: parseInt(studentForm.year),
    group_name: studentForm.group_name,
    tutor: studentForm.tutor,
    stipend: studentForm.stipend,
    address_perm: studentForm.address_perm,
    address_temp: studentForm.address_temp
  })

  if (insertError) {
    alert("Ошибка при сохранении в базу данных")
    return
  }

  alert("✅ Студент успешно создан!")

  setStudentForm({
    full_name: '',
    email: '',
    password: '',
    student_number: '',
    birth_date: '',
    gender: '',
    specialization: '',
    language: '',
    degree: '',
    study_type: '',
    year: '',
    group_name: '',
    tutor: '',
    stipend: '',
    address_perm: '',
    address_temp: ''
  })
}

const handleAddCourse = async () => {
  const { subject_id, group_id, teacher_id } = form
  if (!subject_id || !group_id || !teacher_id) return

  // 👇 Get the selected subject and its default_hours
  const selectedSubject = subjects.find((s) => s.id === subject_id)
  const hours = selectedSubject?.default_hours ?? 0

  const { error } = await supabase.from('courses').insert({
    subject_id,
    group_id,
    teacher_id,
  })

  if (!error) {
    setForm({
      subject_id: '',
      group_id: '',
      teacher_id: '',
      subject_name: '',
      default_hours: '',
      group_name: ''
    })

    // ✅ Re-fetch courses with relational data
    const { data: courseData } = await supabase
      .from('courses')
      .select(`
        id,  subject_id, group_id, teacher_id,
        subjects(name, default_hours), groups(name), users(email)
      `)
    setCourses(courseData || [])
  }
}


 const handleCreateUser = async () => {
  const { email, password, role } = newUser
  if (!email || !password || !role) return

  const res = await fetch('/api/admin/create-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  })

  const result = await res.json()

  if (!res.ok) {
    toast.error('Ошибка', { description: result.error })
    return
  }

  toast.success('Пользователь создан', { description: `Роль: ${role}` })

  // Optionally refetch your user list
  setNewUser({ email: '', password: '', role: 'student' })
  setUsers(prev => [...prev, { email, role, id: result.user.id }])
}




  return (

    
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold text-blue-700">Админ-панель</h1>

      {/* Navigation for admin */}
<div className="flex gap-4 border-b mb-6">
  {['courses', 'subjects', 'groups', 'students', 'users'].map((tab) => (
    <button
      key={tab}
      onClick={() => setCurrentTab(tab as any)}
      className={`group relative px-4 py-2 font-medium transition-colors duration-300
        ${currentTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
    >
      {tab === 'courses'
        ? 'Курсы'
        : tab === 'subjects'
        ? 'Предметы'
        : tab === 'groups'
        ? 'Группы'
        : tab === 'students'
        ? 'Студенты'
        :'Пользователи'
        }

      {/* Animated underline */}
      <span
        className={`absolute bottom-0 left-0 h-0.5 w-full bg-blue-600 transition-all duration-300 transform
          ${currentTab === tab ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}
          origin-left`}
      ></span>
    </button>
  ))}
</div>


{currentTab === 'courses' && (
  <div
    className="animate-fade-up opacity-0"
    style={{ animation: 'fade-up 0.5s ease-out forwards' }}
  >
<>
      <div className="space-y-4 bg-white p-4 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-2">Создать курс</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <select
            className="border rounded px-3 py-2"
            value={form.subject_id}
            onChange={(e) => setForm(f => ({ ...f, subject_id: e.target.value }))}
          >
            <option value="">Выберите предмет</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2"
            value={form.group_id}
            onChange={(e) => setForm(f => ({ ...f, group_id: e.target.value }))}
          >
            <option value="">Выберите группу</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2"
            value={form.teacher_id}
            onChange={(e) => setForm(f => ({ ...f, teacher_id: e.target.value }))}
          >
            <option value="">Выберите преподавателя</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.email}</option>
            ))}
          </select>
        </div>

        <Button className="mt-3" onClick={handleAddCourse}>Создать курс</Button>
      </div>
{/* View All Courses (IDs only for now) */}
<div className="grid md:grid-cols-2 gap-4 mt-6">
  {courses.map((c, idx) => (
    <Card key={c.id}>
      <CardContent className="p-4 space-y-3">
        {editingCourseId === c.id ? (
          <>
  <div className="space-y-1 w-full">
    <label className="text-sm font-medium text-gray-700">Предмет</label>
    <select
      className="w-full border rounded px-3 py-2"
      value={c.subject_id}
      onChange={(e) => {
        const updated = [...courses]
        updated[idx].subject_id = e.target.value
        setCourses(updated)
      }}
    >
      {subjects.map((s) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  </div>

  <div className="space-y-1 w-full">
    <label className="text-sm font-medium text-gray-700">Группа</label>
    <select
      className="w-full border rounded px-3 py-2"
      value={c.group_id}
      onChange={(e) => {
        const updated = [...courses]
        updated[idx].group_id = e.target.value
        setCourses(updated)
      }}
    >
      {groups.map((g) => (
        <option key={g.id} value={g.id}>{g.name}</option>
      ))}
    </select>
  </div>

  <div className="space-y-1 w-full">
    <label className="text-sm font-medium text-gray-700">Преподаватель</label>
    <select
      className="w-full border rounded px-3 py-2"
      value={c.teacher_id}
      onChange={(e) => {
        const updated = [...courses]
        updated[idx].teacher_id = e.target.value
        setCourses(updated)
      }}
    >
      {teachers.map((t) => (
        <option key={t.id} value={t.id}>{t.email}</option>
      ))}
    </select>
  </div>

  <div className="space-y-1 w-full">
    <label className="text-sm font-medium text-gray-700">Часы (по умолчанию)</label>
    <Input
      type="number"
      value={(c.subjects?.default_hours ?? '').toString()}
      readOnly
      className="bg-gray-100 cursor-not-allowed"
      title="Часы задаются автоматически из предмета"
    />
  </div>

  <div className="flex gap-2 pt-2">
    <Button
      variant="outline"
      size="icon"
      onClick={async () => {
        const { error } = await supabase
          .from('courses')
          .update({
            subject_id: c.subject_id,
            group_id: c.group_id,
            teacher_id: c.teacher_id,
          })
          .eq('id', c.id)

        if (!error) {
          const { data: updated } = await supabase.from('courses').select(`
            id, subject_id, group_id, teacher_id,
            subjects(name, default_hours), groups(name), users(email)
          `)
          setCourses(updated || [])
          setEditingCourseId(null)
        }
      }}
    >
      <Check className="w-4 h-4" />
    </Button>

    <Button
      variant="destructive"
      size="icon"
      onClick={async () => {
        const { error } = await supabase.from('courses').delete().eq('id', c.id)
        if (!error) {
          const updated = courses.filter(course => course.id !== c.id)
          setCourses(updated)
          setEditingCourseId(null)
        }
      }}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  </div>
</>

        ) : (
          <>
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2">

                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <p><b>Предмет:</b> {c.subjects?.name || '–'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <p><b>Группа:</b> {c.groups?.name || '–'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <p><b>Преподаватель:</b> {c.users?.email || '–'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <p><b>Часы:</b> {c.subjects?.default_hours ?? c.hours}</p>
                </div>

              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingCourseId(c.id)}
                title="Редактировать"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>

                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>


      </>
        </div>

      )}

      {/* Add Course Form */}
{currentTab === 'subjects' && (
   <div
  className="transition-all duration-500 ease-out opacity-0 translate-y-4 animate-[fade-up_0.5s_ease-out_forwards]"
  style={{ animation: 'fade-up 0.4s ease-out forwards' }}
>
  {/* --- Subject Registration --- */}
  <div className="space-y-4 bg-white p-4 rounded shadow-md mt-10">
    <h2 className="text-xl font-semibold mb-2">Добавить предмет</h2>

    <div className="flex gap-4">
      <Input
        placeholder="Название предмета"
        value={form.subject_name || ''}
        onChange={(e) => setForm(f => ({ ...f, subject_name: e.target.value }))}
      />
      <Input
        type="number"
        placeholder="Часы по умолчанию"
        value={form.default_hours || ''}
        onChange={(e) => setForm(f => ({ ...f, default_hours: e.target.value }))}
      />
      <Button
        onClick={async () => {
          const { error } = await supabase.from('subjects').insert({
            name: form.subject_name,
            default_hours: parseInt(form.default_hours),
          })

          if (!error) {
            const { data: updated } = await supabase.from('subjects').select()
            setSubjects(updated || [])
            setForm(f => ({ ...f, subject_name: '', default_hours: '' }))
          }
        }}
      >
        Добавить
      </Button>
    </div>
  </div>

  {/* --- Subject List --- */}
  <div className="bg-white p-4 rounded shadow-md mt-8 border-t pt-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Список предметов</h3>
       <div className="relative w-full md:w-1/3">
  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
  <Input
    className="pl-10"
    placeholder="Поиск по названию"
    value={subjectSearch}
    onChange={(e) => setSubjectSearch(e.target.value)}
  />
</div>
    </div>

    <div className="text-sm text-gray-600 space-y-4">
      {filteredSubjects.map((s, idx) => (
        <div
          key={s.id}
          className="flex items-center justify-between gap-2 border-b pb-2 transition-transform duration-200 ease-in-out hover:scale-[1.02]"
        >
          {editingSubjectId === s.id ? (
            <>
              <div className="flex gap-2 w-full">
                <Input
                  className="w-full"
                  value={s.name ?? ''}
                  onChange={(e) => {
                    const newList = [...subjects]
                    newList[idx].name = e.target.value
                    setSubjects(newList)
                  }}
                />
                <Input
                  className="w-32"
                  type="number"
                  value={s.default_hours}
                  onChange={(e) => {
                    const newList = [...subjects]
                    newList[idx].default_hours = parseInt(e.target.value)
                    setSubjects(newList)
                  }}
                />
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={async () => {
                    const { error } = await supabase
                      .from('subjects')
                      .update({
                        name: s.name,
                        default_hours: s.default_hours,
                      })
                      .eq('id', s.id)

                    if (!error) {
                      const { data: updated } = await supabase.from('subjects').select()
                      setSubjects(updated || [])
                      setEditingSubjectId(null)
                    }
                  }}
                  title="Сохранить"
                >
                  <Check className="w-4 h-4" />
                </Button>

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={async () => {
                    const { error } = await supabase.from('subjects').delete().eq('id', s.id)
                    if (!error) {
                      const newList = subjects.filter(item => item.id !== s.id)
                      setSubjects(newList)
                      setEditingSubjectId(null)
                    }
                  }}
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <span className="flex-1">{s.name} — {s.default_hours} ч.</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingSubjectId(s.id)}
                title="Редактировать"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ))}
    </div>
  </div>
</div>
)}


{currentTab === 'groups' && (
   <div
    className="transition-all duration-500 ease-out opacity-0 translate-y-4 animate-[fade-up_0.5s_ease-out_forwards]"
    style={{ animation: 'fade-up 0.4s ease-out forwards' }}
  >
    {/* --- Group Management --- */}
    <div className="space-y-4 bg-white p-4 rounded shadow-md mt-10">
      <h2 className="text-xl font-semibold mb-2">Группы</h2>

      {/* Add Group Form */}
      <div className="flex gap-4">
        <Input
          placeholder="Название группы (например, 10-A)"
          value={form.group_name || ''}
          onChange={(e) => setForm(f => ({ ...f, group_name: e.target.value }))}
        />
        <Button
          onClick={async () => {
            const { error } = await supabase.from('groups').insert({
              name: form.group_name
            })

            if (!error) {
              const { data: updated } = await supabase.from('groups').select()
              setGroups(updated || [])
              setForm(f => ({ ...f, group_name: '' }))
            }
          }}
        >
          Добавить
        </Button>
      </div>

      {/* Editable Group List */}
      <div className="text-sm text-gray-600 space-y-4">
  {/* 🔍 Search Bar */}
<div className="relative w-full md:w-1/2 mb-4">
  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
    <Search className="w-4 h-4" />
  </span>
  <Input
    className="pl-10"
    placeholder="Поиск группы"
    value={groupSearch}
    onChange={(e) => setGroupSearch(e.target.value)}
  />
</div>


{/* 📋 Filtered Group List */}
{filteredGroups.map((g, idx) => (
  <Dialog
    key={g.id}
    open={isGroupDialogOpen && selectedGroup?.id === g.id}
    onOpenChange={setIsGroupDialogOpen}
  >
    <DialogTrigger asChild>
      <div
        onClick={() => {
          setSelectedGroup(g)
          setIsGroupDialogOpen(true)
        }}
        className="flex items-center justify-between gap-2 border-b pb-2 cursor-pointer hover:bg-gray-50 transition"
      >
        {editingGroupId === g.id ? (
          <>
            <Input
              className="w-full"
              value={g.name}
              onChange={(e) => {
                const updatedGroups = [...groups]
                updatedGroups[idx].name = e.target.value
                setGroups(updatedGroups)
              }}
            />
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  const { error } = await supabase
                    .from('groups')
                    .update({ name: g.name })
                    .eq('id', g.id)

                  if (!error) {
                    const { data: updated } = await supabase.from('groups').select()
                    setGroups(updated || [])
                    setEditingGroupId(null)
                  }
                }}
                title="Сохранить"
              >
                <Check className="w-4 h-4" />
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={async () => {
                  const { error } = await supabase.from('groups').delete().eq('id', g.id)

                  if (!error) {
                    const updated = groups.filter((item) => item.id !== g.id)
                    setGroups(updated)
                    setEditingGroupId(null)
                  }
                }}
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <span className="flex-1">{g.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                setEditingGroupId(g.id)
              }}
              title="Редактировать"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </DialogTrigger>

    <DialogContent>
      <DialogHeader>
        <DialogTitle>Студенты группы {g.name}</DialogTitle>
      </DialogHeader>

<div className="space-y-1 text-sm text-gray-700">
  {students
    .filter((s) => s.group_name === g.name)
    .map((s) => (
      <div key={s.id} className="flex items-center gap-2">
        <User className="w-4 h-4 text-gray-500" />
        <p>{s.full_name} ({s.student_number})</p>
      </div>
    ))}
</div>

    </DialogContent>
  </Dialog>
))}

</div>

    </div>
  </div>
)}

{currentTab === 'students' && ( 
<div
    className="animate-fade-up opacity-0"
    style={{ animation: 'fade-up 0.5s ease-out forwards' }}
  >
  <>
  <div className="space-y-4 bg-white p-4 rounded shadow-md mt-10">
  <h2 className="text-xl font-semibold mb-2">Регистрация студента</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Input placeholder="Полное имя" value={studentForm.full_name || ''} onChange={(e) => setStudentForm(f => ({ ...f, full_name: e.target.value }))} />
  <Input placeholder="Email" value={studentForm.email || ''} onChange={(e) => setStudentForm(f => ({ ...f, email: e.target.value }))} />
  <Input type={showPass ? 'text' : 'password'} placeholder="Пароль" value={studentForm.password || ''} onChange={(e) => setStudentForm(f => ({ ...f, password: e.target.value }))} />
  <Input placeholder="Номер студента" value={studentForm.student_number || ''} onChange={(e) => setStudentForm(f => ({ ...f, student_number: e.target.value }))} />
  <Input type="date" placeholder="Дата рождения" value={studentForm.birth_date || ''} onChange={(e) => setStudentForm(f => ({ ...f, birth_date: e.target.value }))} />
  
  <select className="border rounded px-3 py-2" value={studentForm.gender} onChange={(e) => setStudentForm(f => ({ ...f, gender: e.target.value }))}>
    <option value="">Пол</option>
    <option value="Man">Мужской</option>
    <option value="Woman">Женский</option>
  </select>
  
  <Input placeholder="Постоянный адрес" value={studentForm.address_perm || ''} onChange={(e) => setStudentForm(f => ({ ...f, address_perm: e.target.value }))} />
  <Input placeholder="Временный адрес" value={studentForm.address_temp || ''} onChange={(e) => setStudentForm(f => ({ ...f, address_temp: e.target.value }))} />
  <Input placeholder="Специализация" value={studentForm.specialization || ''} onChange={(e) => setStudentForm(f => ({ ...f, specialization: e.target.value }))} />
  <Input placeholder="Куратор" value={studentForm.tutor || ''} onChange={(e) => setStudentForm(f => ({ ...f, tutor: e.target.value }))} />
  
  <select className="border rounded px-3 py-2" value={studentForm.language} onChange={(e) => setStudentForm(f => ({ ...f, language: e.target.value }))}>
    <option value="">Язык обучения</option>
    <option value="UZ">UZ</option>
    <option value="RU">RU</option>
    <option value="EN">EN</option>
  </select>
  
  <select className="border rounded px-3 py-2" value={studentForm.degree} onChange={(e) => setStudentForm(f => ({ ...f, degree: e.target.value }))}>
    <option value="">Степень</option>
    <option value="Bachelor">Bachelor</option>
    <option value="Master">Master</option>
  </select>
  
  <select className="border rounded px-3 py-2" value={studentForm.study_type} onChange={(e) => setStudentForm(f => ({ ...f, study_type: e.target.value }))}>
    <option value="">Форма обучения</option>
    <option value="Full-time">Очное</option>
    <option value="Part-time">Заочное</option>
  </select>
  
  <Input type="number" placeholder="Курс" value={studentForm.year || ''} onChange={(e) => setStudentForm(f => ({ ...f, year: e.target.value }))} />
  <Input placeholder="Стипендия" value={studentForm.stipend || ''} onChange={(e) => setStudentForm(f => ({ ...f, stipend: e.target.value }))} />
  
  <select className="border rounded px-3 py-2" value={studentForm.group_name} onChange={(e) => setStudentForm(f => ({ ...f, group_name: e.target.value }))}>
    <option value="">Группа</option>
    {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
  </select>
</div>


  <Button className="mt-4" onClick={handleStudentRegister}>Создать студента</Button>
</div>
<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
<DialogContent className="w-full max-w-4xl sm:max-w-5xl p-6">

    <DialogHeader>
      <DialogTitle>Редактировать студента</DialogTitle>
    </DialogHeader>

    {selectedStudent && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Полное имя"
          value={selectedStudent.full_name || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, full_name: e.target.value } : null)}
        />
        <Input
          placeholder="Email"
          value={selectedStudent.email || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, email: e.target.value } : null)}
        />
        <Input
          type="password"
          placeholder="Пароль (оставьте пустым для без изменений)"
          value={selectedStudent.password || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, password: e.target.value } : null)}
        />
        <Input
          placeholder="Номер студента"
          value={selectedStudent.student_number || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, student_number: e.target.value } : null)}
        />
        <Input
          type="date"
          placeholder="Дата рождения"
          value={selectedStudent.birth_date || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, birth_date: e.target.value } : null)}
        />
        <select
          className="border rounded px-3 py-2"
          value={selectedStudent.gender || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, gender: e.target.value } : null)}
        >
          <option value="">Пол</option>
          <option value="Man">Мужской</option>
          <option value="Woman">Женский</option>
        </select>
        <Input
          placeholder="Постоянный адрес"
          value={selectedStudent.address_perm || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, address_perm: e.target.value } : null)}
        />
        <Input
          placeholder="Временный адрес"
          value={selectedStudent.address_temp || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, address_temp: e.target.value } : null)}
        />
        <Input
          placeholder="Специализация"
          value={selectedStudent.specialization || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, specialization: e.target.value } : null)}
        />
        <Input
          placeholder="Куратор"
          value={selectedStudent.tutor || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, tutor: e.target.value } : null)}
        />
        <select
          className="border rounded px-3 py-2"
          value={selectedStudent.language || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, language: e.target.value } : null)}
        >
          <option value="">Язык обучения</option>
          <option value="UZ">UZ</option>
          <option value="RU">RU</option>
          <option value="EN">EN</option>
        </select>
        <select
          className="border rounded px-3 py-2"
          value={selectedStudent.degree || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, degree: e.target.value } : null)}
        >
          <option value="">Степень</option>
          <option value="Bachelor">Bachelor</option>
          <option value="Master">Master</option>
        </select>
        <select
          className="border rounded px-3 py-2"
          value={selectedStudent.study_type || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, study_type: e.target.value } : null)}
        >
          <option value="">Форма обучения</option>
          <option value="Full-time">Очное</option>
          <option value="Part-time">Заочное</option>
        </select>
        <Input
          type="number"
          placeholder="Курс"
          value={selectedStudent.year || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, year: e.target.value } : null)}
        />
        <Input
          placeholder="Стипендия"
          value={selectedStudent.stipend || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, stipend: e.target.value } : null)}
        />
        <select
          className="border rounded px-3 py-2"
          value={selectedStudent.group_name || ''}
          onChange={(e) => setSelectedStudent(s => s ? { ...s, group_name: e.target.value } : null)}
        >
          <option value="">Группа</option>
          {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
        </select>
      </div>
    )}

    <DialogFooter className="mt-4">
      <DialogClose asChild>
        <Button
          onClick={async () => {
            if (!selectedStudent) return

            const { error } = await supabase
              .from('students')
              .update({
                full_name: selectedStudent.full_name,
                email: selectedStudent.email,
                student_number: selectedStudent.student_number,
                birth_date: selectedStudent.birth_date,
                gender: selectedStudent.gender,
                address_perm: selectedStudent.address_perm,
                address_temp: selectedStudent.address_temp,
                specialization: selectedStudent.specialization,
                tutor: selectedStudent.tutor,
                language: selectedStudent.language,
                degree: selectedStudent.degree,
                study_type: selectedStudent.study_type,
                year: selectedStudent.year,
                group_name: selectedStudent.group_name,
                stipend: selectedStudent.stipend,
              })
              .eq('id', selectedStudent.id)

            if (!error) {
              const { data } = await supabase.from('students').select('*')
              setStudents(data || [])
              setIsEditDialogOpen(false)
            }
          }}
        >
          Сохранить
        </Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>


{students.length > 0 && (
  <div className="bg-white p-4 rounded shadow-md mt-10">
  <h3 className="text-lg font-semibold mb-3">Список студентов</h3>

 <div className="relative w-full md:w-1/3">
  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
  <Input
    className="pl-10"
    placeholder="Поиск по названию"
    value={subjectSearch}
    onChange={(e) => setSubjectSearch(e.target.value)}
  />
</div>

  <div className="space-y-2">
    {filteredStudents.map((s) => (
      <div key={s.id} className="flex flex-col md:flex-row md:items-center justify-between border-b py-2">
        <div className="text-sm">
          <p><b>{s.full_name}</b> — {s.group_name}</p>
          <p className="text-gray-500 text-xs">
            Email: {s.email || '—'} | Номер: {s.student_number}
          </p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
         <Dialog>
  <DialogTrigger asChild>
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        setSelectedStudent(s)
        setIsEditDialogOpen(true)
      }}
    >
      Редактировать
    </Button>
  </DialogTrigger>
</Dialog>


          <Dialog>
  <DialogTrigger asChild>
    <Button size="sm" variant="destructive">
      Удалить
    </Button>
  </DialogTrigger>

  <DialogContent>
    <DialogHeader>
      <DialogTitle>Подтверждение удаления</DialogTitle>
    </DialogHeader>
    <p>Вы уверены, что хотите удалить студента <b>{s.full_name}</b>?</p>

    <DialogFooter className="mt-4">
      <DialogClose asChild>
        <Button variant="outline">Отмена</Button>
      </DialogClose>
      <DialogClose asChild>
        <Button
          variant="destructive"
          onClick={() => handleStudentDelete(s.id)}
        >
          Удалить
        </Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>

        </div>
      </div>
    ))}
  </div>
</div>

)}
</>
  </div>

 )}
{currentTab === 'users' && (
  <div className="p-6 space-y-6">
    <h2 className="text-2xl font-bold text-blue-700">Управление пользователями</h2>

    {/* Add User Form */}
     <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Создать нового пользователя</h2>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Input
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser((f) => ({ ...f, email: e.target.value }))}
          className="w-full md:w-1/3"
        />
        <Input
          placeholder="Пароль"
          type="password"
          value={newUser.password}
          onChange={(e) => setNewUser((f) => ({ ...f, password: e.target.value }))}
          className="w-full md:w-1/3"
        />
        <Select
          value={newUser.role}
          onValueChange={(value: any) => setNewUser((f) => ({ ...f, role: value }))}
        >
          <SelectTrigger className="w-full md:w-1/4">
            <SelectValue placeholder="Выбрать роль" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Студент</SelectItem>
            <SelectItem value="teacher">Преподаватель</SelectItem>
            <SelectItem value="admin">Администратор</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleCreateUser}>Создать</Button>
      </div>

    </div>

    {/* Search bar */}
    <Input
      placeholder="🔍 Поиск по email"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="max-w-xs"
    />

    {/* User List Table */}
    <div className="overflow-auto rounded shadow border bg-white">
      <table className="min-w-full text-sm text-left text-gray-600">
        <thead className="bg-gray-100 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Текущая роль</th>
            <th className="px-6 py-3">Назначить роль</th>
          </tr>
        </thead>
        <tbody>
          {users
            .filter((u) => u.email.toLowerCase().includes(search.toLowerCase()))
            .map((user: any) => (
              <tr key={user.id} className="border-t">
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4 capitalize">{user.role || '—'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRoleChange(user.id, 'student')}
                    >
                      Student
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRoleChange(user.id, 'teacher')}
                    >
                      Преподаватель
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRoleChange(user.id, 'admin')}
                    >
                      Администратор
                    </Button>
                  </div>
                </td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}



      
      
    </div>
    
  )
}
