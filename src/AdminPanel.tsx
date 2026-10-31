import { useCallback, useEffect, useState } from 'react'
import { Activity, BookOpen, CircleDollarSign, GraduationCap, LayoutDashboard, LogOut, RefreshCw, Users, Video, Bell } from 'lucide-react'

type Section = 'overview' | 'students' | 'courses' | 'payments' | 'zoom' | 'announcements'
type DataRow = Record<string, string | number | null>
const API = 'https://sterling-lms-api.texascampus1.workers.dev'
const sections: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'payments', label: 'Payments', icon: CircleDollarSign },
  { id: 'zoom', label: 'Zoom Classes', icon: Video },
  { id: 'announcements', label: 'Announcements', icon: Bell },
]
function AdminPanel({ onExit }: { onExit: () => void }) {
  const [section, setSection] = useState<Section>('overview')
  const [dashboard, setDashboard] = useState<Record<string, number> | null>(null)
  const [rows, setRows] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showStudentForm, setShowStudentForm] = useState(false)
  const [studentForm, setStudentForm] = useState({ student_number: '', full_name: '', email: '', phone: '', password: '' })
  const [savingStudent, setSavingStudent] = useState(false)
  const [notice, setNotice] = useState('')
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [courseForm, setCourseForm] = useState({ course_code: '', title: '', description: '', fee_amount: '0', status: 'draft' })
  const [savingCourse, setSavingCourse] = useState(false)
  const title = sections.find(x => x.id === section)?.label || 'Overview'
  const load = useCallback(async (target: Section = section) => {
    setLoading(true); setError('')
    try {
      const path = target === 'overview' ? '/api/dashboard' : target === 'zoom' ? '/api/zoom-classes' : '/api/' + target
      const response = await fetch(API + path, { credentials: 'include' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not load live data')
      if (target === 'overview') setDashboard(data as Record<string, number>)
      else setRows(Array.isArray(data) ? data as DataRow[] : [])
    } catch (e) { setError(e instanceof Error ? e.message : 'Connection error'); setDashboard(null); setRows([]) }
    finally { setLoading(false) }
  }, [section])
  useEffect(() => { void load(section) }, [section, load])
  const pretty = (value: unknown) => value === null || value === undefined || value === '' ? '—' : String(value)
  const columns: Record<Exclude<Section, 'overview'>, string[]> = {
    students: ['student_number', 'full_name', 'email', 'phone', 'status'],
    courses: ['course_code', 'title', 'fee_amount', 'currency', 'status'],
    payments: ['id', 'student_name', 'course_title', 'amount', 'currency', 'status'],
    zoom: ['title', 'course_title', 'starts_at', 'duration_minutes', 'meeting_url'],
    announcements: ['title', 'audience', 'published_at', 'created_at'],
  }
  const labels: Record<string, string> = { student_number: 'Student ID', full_name: 'Name', email: 'Email', phone: 'Phone', status: 'Status', course_code: 'Code', title: 'Title', fee_amount: 'Fee', currency: 'Currency', id: 'Payment ID', student_name: 'Student', course_title: 'Course', amount: 'Amount', starts_at: 'Starts', duration_minutes: 'Duration (min)', meeting_url: 'Meeting link', audience: 'Audience', published_at: 'Published', created_at: 'Created' }
  return <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
    <aside className="fixed inset-y-0 left-0 hidden w-[245px] flex-col bg-[#102b46] text-white lg:flex"><div className="flex h-20 items-center gap-3 border-b border-white/10 px-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600"><GraduationCap size={23}/></div><div><b>STERLING</b><p className="text-[9px] tracking-[.2em] text-blue-200">ADMINISTRATION</p></div></div><nav className="flex-1 space-y-1 p-3">{sections.map(item => <button key={item.id} onClick={() => setSection(item.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[13px] ${section === item.id ? 'bg-blue-600' : 'text-blue-100 hover:bg-white/10'}`}><item.icon size={17}/>{item.label}</button>)}</nav><button onClick={onExit} className="flex items-center gap-3 border-t border-white/10 p-5 text-sm text-blue-100"><LogOut size={16}/>Sign out</button></aside>
    <main className="min-h-screen lg:ml-[245px]"><header className="flex h-[68px] items-center justify-between border-b bg-white px-4 sm:px-6"><b className="text-sm">Sterling LMS · Admin</b><button onClick={() => void load(section)} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50"><RefreshCw size={14} className={loading ? 'animate-spin' : ''}/>Refresh</button></header>
      <div className="mx-auto max-w-[1500px] p-4 sm:p-6"><div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-600">Live database</p><h1 className="mt-1 text-2xl font-extrabold">{title}</h1><p className="mt-1 text-xs text-slate-500">Records are loaded from Sterling LMS D1 database.</p></div>
      <div className="mb-4 flex flex-wrap gap-2 lg:hidden">{sections.map(item => <button key={item.id} onClick={() => setSection(item.id)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${section === item.id ? 'bg-blue-600 text-white' : 'bg-white'}`}>{item.label}</button>)}<button onClick={onExit} className="rounded-lg bg-white px-3 py-2 text-xs">Sign out</button></div>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {section === 'overview' ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{label:'Total Students',key:'students',icon:Users},{label:'Published Courses',key:'courses',icon:BookOpen},{label:'Pending Payments',key:'pending_payments',icon:CircleDollarSign},{label:'Upcoming Classes',key:'upcoming_classes',icon:Video}].map(k => {const Icon=k.icon;return <section key={k.key} className="rounded-xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-xs font-semibold text-slate-500">{k.label}<Icon size={19}/></div><p className="mt-4 text-3xl font-extrabold">{dashboard ? pretty(dashboard[k.key]) : '—'}</p></section>})}<section className="rounded-xl border bg-white p-5 text-sm text-slate-600 sm:col-span-2 xl:col-span-4"><Activity className="mb-2 text-blue-600"/>Live summary. Counts reflect actual records currently stored in the database; no sample records are inserted.</section></div> :
      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {section === 'courses' && <div className="flex items-center justify-between border-b p-4"><span className="text-xs text-slate-500">Manage course catalogue</span><button onClick={() => setShowCourseForm(v => !v)} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white">{showCourseForm ? 'Close' : '+ Add Course'}</button></div>}
        {section === 'courses' && showCourseForm && <form className="grid gap-3 border-b bg-slate-50 p-4 sm:grid-cols-2" onSubmit={async e => { e.preventDefault(); setSavingCourse(true); setError(''); setNotice(''); try { const r=await fetch(API+'/api/courses',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({...courseForm,fee_amount:Number(courseForm.fee_amount),currency:'LKR'})}); const d=await r.json(); if(!r.ok) throw new Error(d.error || 'Could not create course'); setNotice('Course created: '+d.course.course_code+' · '+d.course.title); setCourseForm({course_code:'',title:'',description:'',fee_amount:'0',status:'draft'}); setShowCourseForm(false); await load('courses') } catch(e) { setError(e instanceof Error ? e.message : 'Could not create course') } finally { setSavingCourse(false) } }}>
          <label className="text-xs font-semibold text-slate-600">Course code<input required value={courseForm.course_code} onChange={e=>setCourseForm(v=>({...v,course_code:e.target.value}))} className="mt-1 block w-full rounded-lg border bg-white px-3 py-2.5 text-sm font-normal"/></label>
          <label className="text-xs font-semibold text-slate-600">Course title<input required value={courseForm.title} onChange={e=>setCourseForm(v=>({...v,title:e.target.value}))} className="mt-1 block w-full rounded-lg border bg-white px-3 py-2.5 text-sm font-normal"/></label>
          <label className="text-xs font-semibold text-slate-600">Course fee (LKR)<input required type="number" min="0" step="0.01" value={courseForm.fee_amount} onChange={e=>setCourseForm(v=>({...v,fee_amount:e.target.value}))} className="mt-1 block w-full rounded-lg border bg-white px-3 py-2.5 text-sm font-normal"/></label>
          <label className="text-xs font-semibold text-slate-600">Status<select value={courseForm.status} onChange={e=>setCourseForm(v=>({...v,status:e.target.value}))} className="mt-1 block w-full rounded-lg border bg-white px-3 py-2.5 text-sm"><option value="draft">Draft</option><option value="published">Published</option></select></label>
          <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Description<textarea value={courseForm.description} onChange={e=>setCourseForm(v=>({...v,description:e.target.value}))} className="mt-1 block w-full rounded-lg border bg-white px-3 py-2.5 text-sm font-normal"/></label>
          <div><button disabled={savingCourse} className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white">{savingCourse ? 'Saving…' : 'Create Course'}</button></div>
        </form>}
        {section === 'students' && <div className="flex items-center justify-between border-b p-4"><span className="text-xs text-slate-500">Manage student accounts</span><button onClick={() => { setShowStudentForm(v => !v); setNotice('') }} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white">{showStudentForm ? 'Close' : '+ Add Student'}</button></div>}
        {notice && <div className="m-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</div>}
        {section === 'students' && showStudentForm && <form className="grid gap-3 border-b bg-slate-50 p-4 sm:grid-cols-2" onSubmit={async e => { e.preventDefault(); setSavingStudent(true); setError(''); setNotice(''); try { const r=await fetch(API+'/api/students',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(studentForm)}); const d=await r.json(); if(!r.ok) throw new Error(d.error || 'Could not create student'); setNotice('Student account created: '+d.student.student_number+' · '+d.student.email); setStudentForm({student_number:'',full_name:'',email:'',phone:'',password:''}); setShowStudentForm(false); await load('students') } catch(e) { setError(e instanceof Error ? e.message : 'Could not create student') } finally { setSavingStudent(false) } }}>
          {([['student_number','Student ID','text'],['full_name','Full name','text'],['email','Email','email'],['phone','Phone (optional)','tel']] as const).map(([key,label,type])=><label key={key} className="text-xs font-semibold text-slate-600">{label}<input required={key!=='phone'} type={type} value={studentForm[key]} onChange={e=>setStudentForm(v=>({...v,[key]:e.target.value}))} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500"/></label>)}
          <div className="sm:col-span-2"><label className="text-xs font-semibold text-slate-600">Temporary password (12+ characters)</label><div className="mt-1 flex flex-wrap gap-2"><input required type="text" minLength={12} autoComplete="off" placeholder="Type a password or generate one" value={studentForm.password} onChange={e=>setStudentForm(v=>({...v,password:e.target.value}))} className="min-w-[220px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500"/><button type="button" onClick={()=>{const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';const bytes=crypto.getRandomValues(new Uint8Array(18));const generated=Array.from(bytes,b=>chars[b%chars.length]).join('');setStudentForm(v=>({...v,password:generated}))}} className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700">Generate password</button></div><p className="mt-1 text-[11px] font-normal text-slate-500">Generate automatically or type your own password. Minimum 12 characters.</p></div>
          <div className="flex items-end"><button disabled={savingStudent} className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{savingStudent?'Saving…':'Create Student Account'}</button></div>
        </form>}
        <div className="border-b p-4 text-xs text-slate-500">{loading ? 'Loading…' : rows.length + ' records'}</div>
        {rows.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">{loading ? 'Loading live records…' : 'No records found in the database yet.'}</div> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr>{columns[section].map(c=><th key={c} className="px-4 py-3 font-semibold">{labels[c] || c}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={String(row.id ?? row.student_number ?? i)} className="border-t">{columns[section].map(c=><td key={c} className="max-w-[260px] truncate px-4 py-3">{c === 'meeting_url' && row[c] ? <a className="text-blue-600 underline" href={String(row[c])} target="_blank" rel="noreferrer">Open meeting</a> : pretty(row[c])}</td>)}</tr>)}</tbody></table></div>}
      </section>}
      <footer className="py-7 text-center text-[10px] text-slate-400">Sterling Training Centre · Administration</footer></div></main></div>
}
export default AdminPanel
