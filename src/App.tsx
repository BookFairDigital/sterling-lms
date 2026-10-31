import {
  Activity, ArrowRight, Bell, BookOpen, CalendarDays, CheckCircle2,
  ChevronDown, ClipboardList, Clock3, CreditCard, FileText, GraduationCap,
  LayoutDashboard, LogOut, Menu, MessageSquare, Play, Search, Settings,
  Users, Video, Wallet, X, MapPin, Landmark, Download, Upload, Check,
} from 'lucide-react'
import { useState } from 'react'

const nav = [
  ['Dashboard', LayoutDashboard], ['My Courses', BookOpen], ['Learning Materials', BookOpen],
  ['Assignments', ClipboardList], ['Attendance', CalendarDays], ['Assessments', FileText],
  ['Payments', Wallet], ['Zoom Classes', Video], ['Messages', MessageSquare],
  ['Announcements', Bell], ['Lecturers', Users], ['Reports', Activity], ['Settings', Settings],
] as const

const classes = [
  { day: '15', month: 'JAN', title: 'Engine Management Systems', time: '09:00 AM – 11:00 AM', place: 'Online - Zoom', icon: Video },
  { day: '17', month: 'JAN', title: 'Automotive Electrical Basics', time: '01:00 PM – 03:00 PM', place: 'Main Campus - Classroom 2', icon: MapPin },
  { day: '19', month: 'JAN', title: 'Practical Workshop', time: '09:00 AM – 12:00 PM', place: 'Workshop - Kadawatha', icon: Users },
]
const assignments = [
  { title: 'Assignment 01', detail: 'Introduction to Automotive Systems', due: '12 Jan 2025', status: 'Pending' },
  { title: 'Assignment 02', detail: 'Engine Components', due: '19 Jan 2025', status: 'Submitted' },
  { title: 'Assignment 03', detail: 'Electrical Systems', due: '26 Jan 2025', status: 'Pending' },
  { title: 'Assignment 04', detail: 'Diagnostic & Repair', due: '05 Feb 2025', status: 'Not Started' },
]

function App() {
  const [active, setActive] = useState('Dashboard')
  const [mobileNav, setMobileNav] = useState(false)
  const [search, setSearch] = useState('')
  const [completed, setCompleted] = useState(false)

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
      {mobileNav && <button aria-label="Close menu" onClick={() => setMobileNav(false)} className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[210px] flex-col bg-[#082544] text-white shadow-xl transition-transform lg:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white"><GraduationCap size={23}/></div>
          <div className="leading-tight"><div className="text-lg font-black tracking-wide">STERLING</div><div className="text-[9px] font-semibold tracking-[.18em] text-blue-200">TRAINING CENTRE</div></div>
          <button onClick={() => setMobileNav(false)} className="ml-auto lg:hidden"><X size={18}/></button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {nav.map(([label, Icon]) => <button key={label} onClick={() => {setActive(label);setMobileNav(false)}} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition ${active===label?'bg-blue-500 text-white shadow-lg shadow-blue-950/30':'text-blue-50/90 hover:bg-white/10'}`}><Icon size={17}/>{label}</button>)}
        </nav>
        <div className="border-t border-white/10 p-4"><div className="flex items-center gap-2 text-xs text-blue-100"><Settings size={15}/> Account settings</div><div className="mt-3 flex items-center gap-2 text-xs text-blue-200"><LogOut size={15}/> Sign out</div></div>
      </aside>

      <main className="min-h-screen lg:ml-[210px]">
        <header className="sticky top-0 z-20 flex h-[64px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button onClick={() => setMobileNav(true)} className="rounded-lg p-2 text-slate-600 lg:hidden"><Menu size={20}/></button>
            <div className="relative w-full max-w-[465px]"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search courses, materials, or announcements..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-400"/></div>
          </div>
          <div className="ml-4 flex items-center gap-4"><button className="relative text-slate-500"><Bell size={19}/><span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500"/></button><div className="hidden items-center gap-2 sm:flex"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">NP</div><div className="text-right"><p className="text-xs font-bold">Student Portal</p><p className="text-[10px] text-slate-500">Student account</p></div><ChevronDown size={14}/></div></div>
        </header>

        <div className="w-full max-w-none p-3 sm:p-5 xl:p-6">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(300px,.9fr)_minmax(0,1.6fr)]">
            <section className="relative flex min-h-[350px] flex-col justify-end overflow-hidden rounded-xl bg-slate-900 p-6 text-white shadow-sm sm:min-h-[390px]">
              <img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1100&q=85" alt="Automotive technician working on a vehicle" className="absolute inset-0 h-full w-full object-cover opacity-60"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#061b33] via-[#061b33]/65 to-[#061b33]/10"/>
              <div className="relative max-w-xl"><p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-blue-200">TVEC approved training centre</p><h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">Build Your Future in the Automotive Industry</h2><p className="mt-3 text-sm text-blue-50">NVQ Level 4 courses · Practical training · Experienced instructors</p><ul className="mt-5 space-y-2 text-sm">{['Automobile Electrical Technician','Automobile Technician','Industry training','Modern facilities'].map(x=><li key={x} className="flex items-center gap-2"><CheckCircle2 size={17} className="text-emerald-400"/>{x}</li>)}</ul><button onClick={()=>setActive('My Courses')} className="mt-5 rounded-lg bg-blue-500 px-5 py-3 text-sm font-bold shadow-lg hover:bg-blue-600">View our courses</button></div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4"><h1 className="text-xl font-extrabold sm:text-2xl">Welcome back! <span>👋</span></h1><p className="text-xs text-slate-500">Keep learning, keep growing.</p></div>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[{label:'My Courses',value:'02',sub:'Active courses',icon:BookOpen,tone:'blue'},{label:'Attendance',value:'92%',sub:'This month',icon:CalendarDays,tone:'green'},{label:'Pending Assignments',value:'03',sub:'Due this week',icon:FileText,tone:'orange'},{label:'Fee Status',value:'LKR 50,000',sub:'Outstanding',icon:CreditCard,tone:'purple'}].map(s=><div key={s.label} className={`rounded-xl p-4 ${s.tone==='blue'?'bg-blue-50 text-blue-700':s.tone==='green'?'bg-emerald-50 text-emerald-700':s.tone==='orange'?'bg-orange-50 text-orange-700':'bg-violet-50 text-violet-700'}`}><div className="flex items-center justify-between gap-1"><p className="text-xs font-semibold">{s.label}</p><s.icon size={19}/></div><p className="mt-2 text-2xl font-extrabold">{s.value}</p><p className="mt-1 text-[11px] opacity-80">{s.sub}</p></div>)}
              </div>
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">My current course</h3><button onClick={()=>setActive('My Courses')} className="text-xs font-bold text-blue-600">View all</button></div><div className="mt-4 flex gap-3"><img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=300&q=80" alt="Automotive course" className="h-24 w-28 rounded-lg object-cover"/><div className="min-w-0 flex-1"><p className="text-sm font-bold">Certificate Course for Automobile Technician</p><p className="mt-1 text-xs text-slate-500">NVQ Level 4</p><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-2 w-[45%] rounded-full bg-blue-500"/></div><p className="mt-1 text-right text-[10px] text-slate-500">45% complete</p></div></div><div className="mt-3 space-y-1 text-[11px] text-slate-500"><p className="flex gap-2"><CalendarDays size={13}/> Intake: January · Year 1</p><p className="flex gap-2"><BookOpen size={13}/> On-the-job training: Year 2</p></div></div>
                <div className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">Upcoming classes</h3><button onClick={()=>setActive('Attendance')} className="text-xs font-bold text-blue-600">View all</button></div><div className="mt-3 space-y-2">{classes.map(c=><div key={c.day} className="flex items-center gap-3 border-b border-slate-100 pb-2 last:border-0"><div className="w-11 shrink-0 rounded-lg bg-slate-100 py-1 text-center"><p className="text-sm font-bold">{c.day}</p><p className="text-[9px] font-bold text-slate-500">{c.month}</p></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{c.title}</p><p className="mt-1 text-[10px] text-slate-500">{c.time}</p></div><c.icon size={15} className="shrink-0 text-blue-600"/></div>)}</div></div>
              </div>
            </section>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-bold">Continue learning</h3><button onClick={()=>setActive('Learning Materials')} className="text-xs font-bold text-blue-600">View all</button></div><div className="relative mt-3 overflow-hidden rounded-lg"><img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" alt="Automotive learning video" className="h-36 w-full object-cover"/><button aria-label="Play lesson" className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-blue-600 shadow"><Play size={21} fill="currentColor"/></button><span className="absolute bottom-2 right-3 text-xs font-semibold text-white">12:45</span></div><h4 className="mt-3 text-sm font-bold">1.1 Overview of Automotive Systems</h4><p className="mt-1 text-xs leading-5 text-slate-500">This lesson covers the basic overview of modern automotive systems and their functions.</p><div className="mt-3 flex gap-2"><button onClick={()=>setCompleted(!completed)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-bold text-white">{completed?<Check size={14}/>:<CheckCircle2 size={14}/>} {completed?'Completed':'Mark as complete'}</button><button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold"><Download size={14}/> PDF</button></div></section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-bold">Recent assignments</h3><button onClick={()=>setActive('Assignments')} className="text-xs font-bold text-blue-600">View all</button></div><div className="mt-3 space-y-2">{assignments.map(a=><div key={a.title} className="flex items-center gap-2 rounded-lg border border-slate-100 p-2.5"><div className="rounded-lg bg-blue-50 p-2 text-blue-600"><FileText size={17}/></div><div className="min-w-0 flex-1"><p className="text-xs font-bold">{a.title}</p><p className="truncate text-[10px] text-slate-500">{a.detail}</p><p className="text-[10px] text-slate-400">Due: {a.due}</p></div><span className={`rounded-md px-2 py-1 text-[9px] font-bold ${a.status==='Submitted'?'bg-emerald-50 text-emerald-700':a.status==='Pending'?'bg-orange-50 text-orange-700':'bg-slate-100 text-slate-600'}`}>{a.status}</span></div>)}</div></section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-bold">Course fee payments</h3><span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">LKR 50,000 due</span></div><p className="mt-2 text-xs text-slate-500">Check your fee status and manage payments.</p><div className="mt-4 space-y-2 border-y border-slate-100 py-3 text-xs"><div className="flex justify-between"><span className="text-slate-500">Total course fee</span><b>LKR 300,000</b></div><div className="flex justify-between"><span className="text-slate-500">Amount paid</span><b className="text-emerald-600">LKR 250,000</b></div><div className="flex justify-between"><b>Outstanding amount</b><b className="text-red-600">LKR 50,000</b></div></div><p className="mt-3 text-sm font-bold">Payment options</p><div className="mt-2 grid grid-cols-3 gap-2">{[{label:'Online',icon:CreditCard},{label:'Bank slip',icon:Landmark},{label:'History',icon:FileText}].map(p=><button key={p.label} onClick={()=>setActive('Payments')} className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-3 text-center text-[10px] font-semibold hover:border-blue-300"><p.icon size={20} className="text-blue-600"/>{p.label}</button>)}</div></section>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-bold">Recent announcements</h3><button onClick={()=>setActive('Announcements')} className="text-xs font-bold text-blue-600">View all</button></div><div className="mt-3 flex items-start gap-3 rounded-lg bg-blue-50 p-3"><div className="rounded-lg bg-white p-2 text-blue-600"><Bell size={18}/></div><div><p className="text-xs font-bold">Welcome to your Sterling learning portal</p><p className="mt-1 text-[11px] text-slate-600">Your courses, learning materials, assignments and payments will be available here.</p></div></div></section>
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h3 className="font-bold">Quick links</h3><div className="mt-3 grid grid-cols-2 gap-2">{[{label:'My courses',icon:BookOpen},{label:'Class schedule',icon:CalendarDays},{label:'Materials',icon:FileText},{label:'Zoom classes',icon:Video}].map(q=><button key={q.label} onClick={()=>setActive(q.label)} className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-left text-xs font-semibold hover:bg-blue-50"><q.icon size={18} className="text-blue-600"/>{q.label}<ArrowRight size={13} className="ml-auto"/></button>)}</div></section>
          </div>
          <footer className="py-6 text-center text-[11px] text-slate-400">© 2026 Sterling Training Centre · Learning Management System</footer>
        </div>
      </main>
    </div>
  )
}

export default App
