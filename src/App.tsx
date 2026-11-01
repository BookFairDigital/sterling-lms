import { useEffect, useState } from 'react'
import AdminPanel from './AdminPanel'
import {
  Activity, Bell, BookOpen, CalendarDays, CheckCircle2, ClipboardList,
  CreditCard, FileText, GraduationCap, LayoutDashboard, LogOut, Menu,
  MessageSquare, PlayCircle, Search, Settings, Users, Video, Wallet, X,
  ChevronRight, Download, BookMarked,
} from 'lucide-react'

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'My Courses', icon: BookOpen },
  { id: 'materials', label: 'Learning Materials', icon: BookMarked },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'attendance', label: 'Attendance', icon: CalendarDays },
  { id: 'assessments', label: 'Assessments', icon: FileText },
  { id: 'payments', label: 'Payments', icon: Wallet },
  { id: 'classes', label: 'Zoom Classes', icon: Video },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'announcements', label: 'Announcements', icon: Bell },
  { id: 'lecturers', label: 'Lecturers', icon: Users },
  { id: 'reports', label: 'Reports', icon: Activity },
  { id: 'settings', label: 'Profile Settings', icon: Settings },
] as const

type Page = typeof nav[number]['id']

const assignments = [
  { title: 'Introduction to Automotive Systems', due: '12 Jan 2026', status: 'Pending' },
  { title: 'Engine Components', due: '19 Jan 2026', status: 'Submitted' },
  { title: 'Electrical Systems', due: '26 Jan 2026', status: 'Pending' },
  { title: 'Diagnostic & Repair', due: '05 Feb 2026', status: 'Not Started' },
]

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState<Page>('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [completed, setCompleted] = useState(false)
  const [studentAnnouncements, setStudentAnnouncements] = useState<any[]>([])
  const [studentPayments, setStudentPayments] = useState<any[]>([])
  const [studentCourses, setStudentCourses] = useState<any[]>([])
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [studentMaterials, setStudentMaterials] = useState<any[]>([])
  const [studentClasses, setStudentClasses] = useState<any[]>([])
  const [studentAssignments, setStudentAssignments] = useState<any[]>([])
  const [assignmentFiles, setAssignmentFiles] = useState<Record<string,File|null>>({})
  const [assignmentBusy, setAssignmentBusy] = useState<string|null>(null)

  const [paymentForm, setPaymentForm] = useState({course_id:'',amount:'',method:'bank_transfer',reference:''})
  const [receiptFile, setReceiptFile] = useState<File|null>(null)
  const [paymentBusy, setPaymentBusy] = useState(false)
  const [liveError, setLiveError] = useState('')
  const [liveNotice, setLiveNotice] = useState('')

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId.trim() || !password.trim()) { setError('Please enter your email and password.'); return }
    setAuthLoading(true); setError('')
    try {
      const response = await fetch('https://sterling-lms-api.texascampus1.workers.dev/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ email: studentId.trim(), password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Sign in failed')
      setUserRole(data.user.role); setLoggedIn(true); setPassword('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.') }
    finally { setAuthLoading(false) }
  }

  useEffect(() => { if (!loggedIn || userRole !== 'student') return; const api='https://sterling-lms-api.texascampus1.workers.dev'; if(page==='assignments') fetch(api+'/api/student/assignments',{credentials:'include'}).then(r=>r.json()).then(d=>{if(!Array.isArray(d))throw new Error('Could not load assignments');setStudentAssignments(d)}).catch(()=>setLiveError('Could not load assignments')); if(page==='materials') fetch(api+'/api/student/materials',{credentials:'include'}).then(r=>r.json()).then(d=>{if(!Array.isArray(d))throw new Error('Could not load learning materials');setStudentMaterials(d)}).catch(()=>setLiveError('Could not load learning materials')); if(page==='classes') fetch(api+'/api/student/zoom-classes',{credentials:'include'}).then(r=>r.json()).then(d=>{if(!Array.isArray(d))throw new Error('Could not load classes');setStudentClasses(d)}).catch(()=>setLiveError('Could not load Zoom classes')); if(page==='announcements') fetch(api+'/api/student/announcements',{credentials:'include'}).then(r=>r.json()).then(d=>setStudentAnnouncements(Array.isArray(d)?d:[])).catch(()=>setLiveError('Could not load announcements')); if(page==='payments'||page==='courses'){Promise.all([fetch(api+'/api/student/payments',{credentials:'include'}).then(r=>r.json()),fetch(api+'/api/courses',{credentials:'include'}).then(r=>r.json())]).then(([p,c])=>{setStudentPayments(Array.isArray(p)?p:[]);setStudentCourses(Array.isArray(c)?c.filter((x:any)=>x.status==='published'):[])}).catch(()=>setLiveError('Could not load course information'));} if(page==='dashboard')fetch(api+'/api/student/dashboard',{credentials:'include'}).then(r=>r.json()).then(d=>{if(d&&typeof d==='object'&&!d.error)setDashboardData(d);else throw new Error('Could not load dashboard')}).catch(()=>setLiveError('Could not load dashboard information'));},[loggedIn,userRole,page]);
  const submitPayment = async (e:React.FormEvent) => { e.preventDefault(); if(!receiptFile)return; setPaymentBusy(true);setLiveError('');setLiveNotice('');try{const fd=new FormData();fd.append('course_id',paymentForm.course_id);fd.append('amount',paymentForm.amount);fd.append('method',paymentForm.method);fd.append('reference',paymentForm.reference);fd.append('receipt',receiptFile);const r=await fetch('https://sterling-lms-api.texascampus1.workers.dev/api/student/payments',{method:'POST',credentials:'include',body:fd});const d=await r.json();if(!r.ok)throw new Error(d.error||'Payment submission failed');setLiveNotice('Payment receipt submitted. It is pending admin review.');setPaymentForm({course_id:'',amount:'',method:'bank_transfer',reference:''});setReceiptFile(null);const p=await fetch('https://sterling-lms-api.texascampus1.workers.dev/api/student/payments',{credentials:'include'}).then(x=>x.json());setStudentPayments(Array.isArray(p)?p:[]);}catch(e){setLiveError(e instanceof Error?e.message:'Payment submission failed')}finally{setPaymentBusy(false)}};
  const openMaterial = async (id:string) => { setLiveError(''); try { const r=await fetch('https://sterling-lms-api.texascampus1.workers.dev/api/student/materials/'+encodeURIComponent(id)+'/download',{credentials:'include'}); if(!r.ok){const d=await r.json();throw new Error(d.error||'Could not open material')} const blob=await r.blob(),url=URL.createObjectURL(blob);window.open(url,'_blank','noopener,noreferrer');setTimeout(()=>URL.revokeObjectURL(url),60000); } catch(e) { setLiveError(e instanceof Error?e.message:'Could not open material') } };
  const title = nav.find(item => item.id === page)?.label ?? 'Dashboard'
  const go = (id: Page) => { setPage(id); setMobileOpen(false) }

  const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) =>
    <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>{children}</section>

  const SectionTitle = ({ children, action }: { children: React.ReactNode; action?: () => void }) =>
    <div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-slate-900">{children}</h2>{action && <button onClick={action} className="text-xs font-bold text-blue-600">View all</button>}</div>

  const Status = ({ value }: { value: string }) => <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${value === 'Submitted' || value === 'Present' ? 'bg-emerald-50 text-emerald-700' : value === 'Pending' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>{value}</span>

  const Dashboard = () => <div className="space-y-4">
    <div className="grid gap-4 xl:grid-cols-[minmax(280px,.9fr)_minmax(0,1.6fr)]">
      <div className="relative flex min-h-[330px] flex-col justify-end overflow-hidden rounded-xl bg-slate-900 p-6 text-white">
        <img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1100&q=85" alt="Automotive workshop" className="absolute inset-0 h-full w-full object-cover opacity-55"/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#061b33] via-[#061b33]/65 to-transparent"/>
        <div className="relative"><p className="text-[11px] font-bold uppercase tracking-[.18em] text-blue-200">TVEC approved training centre</p><h2 className="mt-3 text-3xl font-extrabold leading-tight">Build Your Future in the Automotive Industry</h2><p className="mt-3 text-sm text-blue-50">NVQ Level 4 courses · Practical training · Experienced instructors</p><ul className="mt-4 space-y-2 text-sm">{['Automobile Electrical Technician','Automobile Technician','Industry training','Modern facilities'].map(x=><li key={x} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400"/>{x}</li>)}</ul><button onClick={()=>go('courses')} className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold hover:bg-blue-700">Explore Courses</button></div>
      </div>
      <Card>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Welcome Back, {studentId.includes('@') ? studentId.split('@')[0] : studentId}! 👋</h1><p className="mt-1 text-xs text-slate-500">Keep learning, keep growing.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[{label:'My Courses',value:dashboardData?String(dashboardData.courses??0):'—',sub:'Active courses',tone:'bg-blue-50 text-blue-700',icon:BookOpen},{label:'Attendance',value:dashboardData&&dashboardData.attendance_total?`${Math.round((dashboardData.attendance_present/dashboardData.attendance_total)*100)}%`:'—',sub:'Recorded attendance',tone:'bg-emerald-50 text-emerald-700',icon:CalendarDays},{label:'Assignments',value:'—',sub:'Not connected yet',tone:'bg-orange-50 text-orange-700',icon:FileText},{label:'Fee Status',value:dashboardData?`LKR ${Number(dashboardData.pending||0).toLocaleString()}`:'—',sub:'Pending payments',tone:'bg-violet-50 text-violet-700',icon:CreditCard}].map(s=>{const Icon=s.icon;return <div key={s.label} className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,.045)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,.09)]"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[.1em] text-slate-500">{s.label}</span><span className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}><Icon size={19}/></span></div><p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">{s.value}</p><p className="mt-1 text-[11px] text-slate-500">{s.sub}</p></div>})}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-3"><SectionTitle action={()=>go('courses')}>My Current Course</SectionTitle><div className="flex gap-3"><img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=300&q=80" className="h-20 w-24 rounded-lg object-cover" alt="Automotive course"/><div className="min-w-0"><b className="text-xs">Certificate Course for Automobile Technician</b><p className="mt-1 text-xs text-slate-500">NVQ Level 4</p><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-2 w-[45%] rounded-full bg-blue-600"/></div><p className="mt-1 text-right text-[10px] text-slate-500">45% Complete</p></div></div></div>
          <div className="rounded-lg border border-slate-200 p-3"><SectionTitle action={()=>go('classes')}>Upcoming Classes</SectionTitle>{[['15 JAN','Engine Management Systems','09:00 AM – 11:00 AM'],['17 JAN','Automotive Electrical Basics','01:00 PM – 03:00 PM'],['19 JAN','Practical Workshop','09:00 AM – 12:00 PM']].map(c=><div key={c[0]} className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-0"><div className="rounded bg-slate-100 px-2 py-1 text-center text-xs font-bold">{c[0]}</div><div><b className="block text-xs">{c[1]}</b><small className="text-[10px] text-slate-500">{c[2]}</small></div></div>)}</div>
        </div>
      </Card>
    </div>
    <div className="grid gap-4 xl:grid-cols-3">
      <Card><SectionTitle action={()=>go('materials')}>Continue Learning</SectionTitle><div className="relative overflow-hidden rounded-lg"><img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" className="h-36 w-full object-cover" alt="Automotive lesson"/><PlayCircle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={46}/></div><h3 className="mt-3 text-sm font-bold">1.1 Overview of Automotive Systems</h3><p className="mt-1 text-xs text-slate-500">Learn the fundamentals of modern automotive systems.</p><button onClick={()=>setCompleted(!completed)} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white">{completed?'✓ Completed':'Mark as Complete'}</button></Card>
      <Card><SectionTitle action={()=>go('assignments')}>Recent Assignments</SectionTitle>{assignments.slice(0,3).map(a=><div key={a.title} className="flex items-center justify-between gap-2 border-b border-slate-100 py-3 last:border-0"><div><b className="block text-xs">{a.title}</b><small className="text-[10px] text-slate-500">Due: {a.due}</small></div><Status value={a.status}/></div>)}</Card>
      <Card><SectionTitle action={()=>go('payments')}>Course Fee Payments</SectionTitle><div className="space-y-3 text-xs"><div className="flex justify-between"><span className="text-slate-500">Total Course Fee</span><b>LKR 300,000</b></div><div className="flex justify-between"><span className="text-slate-500">Amount Paid</span><b className="text-emerald-600">LKR 250,000</b></div><div className="flex justify-between border-t pt-3"><b>Outstanding</b><b className="text-red-600">LKR 50,000</b></div></div><button onClick={()=>go('payments')} className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">Manage Payments</button></Card>
    </div>
    <div className="grid gap-4 lg:grid-cols-2"><Card><SectionTitle action={()=>go('announcements')}>Recent Announcements</SectionTitle><b className="text-sm">Welcome to Sterling Learning Portal</b><p className="mt-1 text-xs text-slate-500">Your courses, learning materials, assignments and payments are available here.</p></Card><Card><SectionTitle>Quick Links</SectionTitle><div className="grid grid-cols-2 gap-2">{[['My Courses','courses'],['Class Schedule','classes'],['Learning Materials','materials'],['Payment History','payments']].map(([name,id])=><button key={id} onClick={()=>go(id as Page)} className="rounded-lg bg-blue-50 p-3 text-left text-xs font-bold text-blue-700">{name} →</button>)}</div></Card></div>
  </div>

  const GenericPage = () => {
    if (page === 'courses') return <div className="space-y-3">{liveError&&<p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{liveError}</p>}{studentCourses.length===0?<Card><p className="text-sm text-slate-500">No published courses are currently available for your account.</p></Card>:studentCourses.map(course=><Card key={course.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="text-xs font-bold text-blue-700">{course.course_code}</span><h3 className="mt-1 font-bold">{course.title}</h3><p className="mt-1 text-xs text-slate-500">{course.description||'Published course'}</p></div><Status value="Published"/></div><p className="mt-3 text-sm font-bold">Course fee: LKR {Number(course.fee||0).toLocaleString()}</p></Card>)}</div>
    if (page === 'assignments') return <div className="space-y-4">{liveError&&<p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{liveError}</p>}{liveNotice&&<p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">{liveNotice}</p>}{studentAssignments.length===0?<Card><div className="py-8 text-center"><ClipboardList size={30} className="mx-auto text-slate-300"/><h3 className="mt-3 font-bold">No assignments available</h3><p className="mt-1 text-xs text-slate-500">Assignments for your active courses will appear here.</p></div></Card>:studentAssignments.map(a=><Card key={a.id}><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">{a.course_code||a.course_title}</p><h3 className="mt-1 font-bold text-slate-900">{a.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{a.description||'No additional instructions.'}</p><p className="mt-3 text-xs text-slate-500">Due: {a.due_at?new Date(a.due_at).toLocaleString():'No deadline set'}</p>{a.grade!==null&&a.grade!==undefined&&<p className="mt-2 text-sm font-bold text-emerald-700">Grade: {a.grade}/100</p>}{a.feedback&&<p className="mt-1 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">Lecturer feedback: {a.feedback}</p>}</div><Status value={a.status==='submitted'?'Submitted':a.status==='overdue'?'Overdue':'Pending'}/></div>{a.status!=='submitted'&&a.status!=='overdue'&&<form className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4" onSubmit={async e=>{e.preventDefault();const file=assignmentFiles[a.id];if(!file)return;setAssignmentBusy(a.id);setLiveError('');setLiveNotice('');try{const fd=new FormData();fd.append('file',file);const r=await fetch('https://sterling-lms-api.texascampus1.workers.dev/api/student/assignments/'+a.id+'/submit',{method:'POST',credentials:'include',body:fd});const d=await r.json();if(!r.ok)throw new Error(d.error||'Submission failed');setLiveNotice('Assignment submitted successfully.');setAssignmentFiles(v=>({...v,[a.id]:null}));const rr=await fetch('https://sterling-lms-api.texascampus1.workers.dev/api/student/assignments',{credentials:'include'});const dd=await rr.json();setStudentAssignments(Array.isArray(dd)?dd:[])}catch(e){setLiveError(e instanceof Error?e.message:'Submission failed')}finally{setAssignmentBusy(null)}}}><label className="min-w-[220px] flex-1 text-xs font-semibold text-slate-600">Upload your work (PDF, DOCX, JPG or PNG · max 10 MB)<input required type="file" accept=".pdf,.docx,.jpg,.jpeg,.png" onChange={e=>setAssignmentFiles(v=>({...v,[a.id]:e.target.files?.[0]||null}))} className="mt-2 block w-full rounded-lg border bg-white p-2 text-xs"/></label><button disabled={assignmentBusy===a.id||!assignmentFiles[a.id]} className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{assignmentBusy===a.id?'Submitting…':'Submit Assignment'}</button></form>}{a.status==='submitted'&&<p className="mt-4 border-t border-slate-100 pt-3 text-xs text-emerald-700">Your work has been submitted. You can see your grade and lecturer feedback here when reviewed.</p>}</Card>)}</div>
    if (page === 'payments') return <div className="space-y-4"><Card className="max-w-3xl"><h3 className="font-bold">Submit a Course Payment</h3><p className="mt-1 text-xs text-slate-500">Upload a bank slip or payment receipt for an active course enrolment. PDF, JPG or PNG · maximum 10 MB.</p>{liveError&&<p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{liveError}</p>}{liveNotice&&<p className="mt-3 rounded-lg bg-green-50 p-3 text-xs text-green-700">{liveNotice}</p>}<form onSubmit={submitPayment} className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">Course<select required value={paymentForm.course_id} onChange={e=>setPaymentForm(v=>({...v,course_id:e.target.value}))} className="mt-1 block w-full rounded-lg border p-2.5"><option value="">Select course</option>{studentCourses.map(c=><option key={c.id} value={c.id}>{c.course_code} · {c.title}</option>)}</select></label><label className="text-xs font-semibold">Amount (LKR)<input required type="number" min="1" step="0.01" value={paymentForm.amount} onChange={e=>setPaymentForm(v=>({...v,amount:e.target.value}))} className="mt-1 block w-full rounded-lg border p-2.5"/></label><label className="text-xs font-semibold">Payment method<select value={paymentForm.method} onChange={e=>setPaymentForm(v=>({...v,method:e.target.value}))} className="mt-1 block w-full rounded-lg border p-2.5"><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option><option value="other">Other</option></select></label><label className="text-xs font-semibold">Transaction / receipt reference<input required value={paymentForm.reference} onChange={e=>setPaymentForm(v=>({...v,reference:e.target.value}))} className="mt-1 block w-full rounded-lg border p-2.5"/></label><label className="text-xs font-semibold sm:col-span-2">Receipt file<input required type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>setReceiptFile(e.target.files?.[0]||null)} className="mt-1 block w-full rounded-lg border p-2.5"/></label><div><button disabled={paymentBusy||!studentCourses.length||!receiptFile} className="rounded-lg bg-blue-600 px-5 py-3 text-xs font-bold text-white disabled:opacity-50">{paymentBusy?'Submitting…':'Submit Receipt'}</button></div></form></Card><Card><h3 className="mb-3 font-bold">My Payment History</h3>{studentPayments.length===0?<p className="text-xs text-slate-500">No payment submissions yet.</p>:<div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-xs"><thead><tr className="border-b text-slate-500"><th className="p-3">Course</th><th>Amount</th><th>Method</th><th>Reference</th><th>Status</th></tr></thead><tbody>{studentPayments.map(p=><tr key={p.id} className="border-b"><td className="p-3">{p.course_title||'—'}</td><td>{p.currency} {p.amount}</td><td>{p.method}</td><td>{p.reference}</td><td><Status value={p.status==='approved'?'Approved':p.status==='rejected'?'Rejected':'Pending'}/></td></tr>)}</tbody></table></div>}</Card></div>
    if (page === 'announcements') return <div className="space-y-3">{liveError&&<p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{liveError}</p>}{studentAnnouncements.length===0?<Card><p className="text-sm text-slate-500">No announcements have been published yet.</p></Card>:studentAnnouncements.map(a=><Card key={a.id}><div className="flex items-start justify-between gap-3"><h3 className="font-bold">{a.title}</h3><span className="text-[10px] text-slate-400">{a.published_at?new Date(a.published_at).toLocaleString():''}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{a.body}</p></Card>)}</div>
    if (page === 'attendance') return <><div className="grid gap-4 sm:grid-cols-3"><Card><p className="text-xs text-slate-500">Attendance this month</p><h2 className="mt-2 text-3xl font-extrabold">92%</h2></Card><Card><p className="text-xs text-slate-500">Classes attended</p><h2 className="mt-2 text-3xl font-extrabold">23</h2></Card><Card><p className="text-xs text-slate-500">Classes missed</p><h2 className="mt-2 text-3xl font-extrabold">2</h2></Card></div><Card className="mt-4"><h3 className="mb-3 font-bold">Recent Attendance</h3>{[['15 Jan','Engine Management Systems','Present'],['13 Jan','Workshop Practice','Present'],['10 Jan','Electrical Basics','Absent']].map(x=><div key={x[0]} className="flex justify-between border-b py-3 text-xs"><span>{x[0]} · {x[1]}</span><Status value={x[2]}/></div>)}</Card></>
    if (page === 'materials') return <div className="space-y-3">{liveError&&<p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{liveError}</p>}{studentMaterials.length===0?<Card><p className="text-sm text-slate-500">No learning materials are available for your active courses yet.</p></Card>:studentMaterials.map(m=><Card key={m.id}><div className="flex flex-wrap items-center justify-between gap-3"><div><b className="block text-sm">{m.title}</b><p className="mt-1 text-xs text-slate-500">{m.course_title} · {String(m.file_type||'').split('/').pop()?.toUpperCase()} · {Math.ceil(Number(m.file_size||0)/1024)} KB</p></div><button onClick={()=>void openMaterial(String(m.id))} className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white"><Download size={14} className="mr-1 inline"/>Open / Download</button></div></Card>)}</div>
    if (page === 'classes') return <div className="space-y-3">{liveError&&<p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{liveError}</p>}{studentClasses.length===0?<Card><p className="text-sm text-slate-500">No upcoming online classes are scheduled for your active courses.</p></Card>:studentClasses.map(c=><Card key={c.id}><div className="flex flex-wrap items-center justify-between gap-3"><div><b className="block text-sm">{c.title}</b><p className="mt-1 text-xs text-slate-500">{c.course_title} · {new Date(c.starts_at).toLocaleString()} · {c.duration_minutes} minutes</p></div><a href={c.meeting_url} target="_blank" rel="noreferrer" className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">Join Class <Video size={14} className="ml-1 inline"/></a></div></Card>)}</div>
    const rows: Record<string,[string,string][]> = {
      materials:[['Overview of Automotive Systems','Video · 12:45'],['Engine Components','PDF notes'],['Electrical Safety','Video · 18:20']],
      assessments:[['Automotive Systems — Module 1 Quiz','20 questions · 30 minutes'],['Workshop Safety Assessment','15 questions · 20 minutes']],
      classes:[['Engine Management Systems','15 Jan · 09:00 AM · Online Zoom'],['Automotive Electrical Basics','17 Jan · 01:00 PM · Main Campus'],['Practical Workshop','19 Jan · 09:00 AM · Workshop']],
      messages:[['Student Support','Your new semester materials are now available.'],['Mr. Anura — Lecturer','Please submit the engine components assignment.']],
      announcements:[['Welcome to Sterling LMS','Your courses and learning materials are now available.'],['Workshop schedule update','Please check your upcoming class schedule.']],
      lecturers:[['Mr. Anura Perera','Automotive Technology Lecturer'],['Ms. Sanduni Fernando','Electrical Systems Lecturer']],
      reports:[['Course Progress','45% completed'],['Attendance','92% this month'],['Assignments','8 of 11 submitted']],
      settings:[['Student Name','Edit your profile details'],['Email Address','Update your contact email'],['Password','Change your account password']],
    }
    return <Card>{(rows[page] ?? []).map(([name,detail])=><div key={name} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-4 last:border-0"><div><b className="block text-sm">{name}</b><span className="text-xs text-slate-500">{detail}</span></div>{page==='assessments'?<button className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white">Start</button>:null}</div>)}</Card>
  }

  if (loggedIn && userRole === 'admin') return <AdminPanel onExit={async () => { await fetch('https://sterling-lms-api.texascampus1.workers.dev/auth/logout', { method: 'POST', credentials: 'include' }); setLoggedIn(false); setUserRole('') }} />

  if (!loggedIn) return <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#061b33] via-[#0b3a66] to-blue-600 p-4">
    <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2">
      <div className="relative hidden min-h-[560px] flex-col justify-between overflow-hidden bg-[#082544] p-10 text-white md:flex"><img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1000&q=85" alt="Automotive workshop" className="absolute inset-0 h-full w-full object-cover opacity-25"/><div className="absolute inset-0 bg-gradient-to-br from-[#061b33]/90 to-blue-900/60"/><div className="relative"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full border-2 border-white"><GraduationCap size={25}/></div><div><b className="text-lg tracking-wider">STERLING</b><p className="text-[10px] tracking-[.2em] text-blue-200">TRAINING CENTRE</p></div></div><h1 className="mt-20 text-4xl font-extrabold leading-tight">Your Learning Journey Starts Here.</h1><p className="mt-5 max-w-sm text-sm leading-7 text-blue-100">Access your courses, lessons, assignments, attendance and payments from one student portal.</p></div><p className="relative text-xs text-blue-200">TVEC Approved Training Centre · Student Learning Portal</p></div>
      <form onSubmit={signIn} className="flex flex-col justify-center p-7 sm:p-12"><p className="text-xs font-bold tracking-[.2em] text-blue-600">STUDENT PORTAL</p><h2 className="mt-3 text-3xl font-extrabold">Welcome Back!</h2><p className="mt-2 text-sm text-slate-500">Sign in to continue your learning journey.</p>
        {error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        <label className="mb-2 mt-7 text-xs font-bold">Student Email / ID</label><input value={studentId} onChange={e=>setStudentId(e.target.value)} placeholder="Enter your student email or ID" className="rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
        <label className="mb-2 mt-5 text-xs font-bold">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" className="rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"/>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500"><label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/>Remember me</label><button type="button" onClick={()=>alert('Please contact the training centre to reset your password.')} className="font-bold text-blue-600">Forgot password?</button></div>
        <button type="submit" disabled={authLoading} className="mt-7 rounded-lg bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60">{authLoading ? "Signing in..." : "Sign In"} <ChevronRight size={16} className="ml-1 inline"/></button>
        <div className="mt-5 rounded-lg bg-blue-50 p-3 text-[11px] leading-5 text-blue-900">Use your registered Sterling LMS account credentials. Student accounts will be enabled after registration records are added.</div>

        <p className="mt-7 text-center text-[10px] text-slate-400">© 2026 Sterling Training Centre. All rights reserved.</p>
      </form>
    </div>
  </div>

  return <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
    {mobileOpen && <button aria-label="Close navigation" onClick={()=>setMobileOpen(false)} className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"/>}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[230px] flex-col bg-[#082544] text-white transition-transform lg:translate-x-0 ${mobileOpen?'translate-x-0':'-translate-x-full'}`}>
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5"><div className="grid h-10 w-10 place-items-center rounded-full border-2 border-white"><GraduationCap size={22}/></div><div><b className="tracking-wide">STERLING</b><p className="text-[9px] tracking-[.2em] text-blue-200">TRAINING CENTRE</p></div><button onClick={()=>setMobileOpen(false)} className="ml-auto lg:hidden"><X size={18}/></button></div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">{nav.map(item=><button key={item.id} onClick={()=>go(item.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium ${page===item.id?'bg-blue-600 text-white':'text-blue-50 hover:bg-white/10'}`}><item.icon size={17}/>{item.label}</button>)}</nav>
      <button onClick={()=>setLoggedIn(false)} className="flex items-center gap-3 border-t border-white/10 p-5 text-sm text-blue-100"><LogOut size={16}/>Sign out</button>
    </aside>
    <main className="min-h-screen lg:ml-[230px]">
      <header className="sticky top-0 z-20 flex h-[66px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6"><div className="flex min-w-0 flex-1 items-center gap-3"><button onClick={()=>setMobileOpen(true)} className="rounded-lg p-2 lg:hidden"><Menu size={20}/></button><div className="relative w-full max-w-xl"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search courses, materials, or announcements..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-400"/></div></div><div className="ml-3 flex items-center gap-3"><Bell size={19} className="text-slate-500"/><div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{studentId.slice(0,2).toUpperCase()}</div><div className="hidden sm:block"><b className="block text-xs">Student Portal</b><span className="text-[10px] text-slate-500">Student account</span></div></div></header>
      <div className="mx-auto w-full max-w-none p-3 sm:p-5 xl:p-6"><div className="mb-5"><h1 className="text-2xl font-extrabold">{title}</h1><p className="mt-1 text-xs text-slate-500">Sterling Training Centre · Student Learning Portal</p></div>{page==='dashboard'?<Dashboard/>:<GenericPage/>}<footer className="py-7 text-center text-[10px] text-slate-400">© 2026 Sterling Training Centre · Learning Management System</footer></div>
    </main>
  </div>
}

export default App
