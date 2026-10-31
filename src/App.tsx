import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Students', icon: Users },
  { label: 'Courses', icon: BookOpen },
  { label: 'Lecturers', icon: GraduationCap },
  { label: 'Calendar', icon: CalendarDays },
]

const stats = [
  { label: 'Total students', value: '1,248', change: '+12.8%', direction: 'up', icon: Users, tone: 'blue', note: 'vs. last month' },
  { label: 'Active courses', value: '36', change: '+4.2%', direction: 'up', icon: BookOpen, tone: 'violet', note: 'vs. last month' },
  { label: 'Completion rate', value: '78.4%', change: '+2.6%', direction: 'up', icon: ChartNoAxesCombined, tone: 'green', note: 'vs. last month' },
  { label: 'Pending reviews', value: '24', change: '3 overdue', direction: 'down', icon: Clock3, tone: 'amber', note: 'Needs attention' },
]

const courses = [
  { title: 'Business Management', code: 'BUS 204', students: 284, progress: 82, lecturer: 'Dr. Sandaruwan', color: 'indigo' },
  { title: 'Information Technology', code: 'ICT 110', students: 216, progress: 64, lecturer: 'Ms. N. Perera', color: 'blue' },
  { title: 'English Language', code: 'ENG 102', students: 192, progress: 91, lecturer: 'Mr. K. Fernando', color: 'emerald' },
]

const activities = [
  { title: 'New student enrolled', detail: 'Amaya Fernando joined Business Management', time: '12 min ago', initials: 'AF', tone: 'blue' },
  { title: 'Assignment submitted', detail: 'ICT 110 · Database Fundamentals', time: '38 min ago', initials: 'DS', tone: 'violet' },
  { title: 'Payment received', detail: 'Kasun Jayawardena · LKR 8,500', time: '1 hr ago', initials: 'KJ', tone: 'green' },
]

function App() {
  const [activePage, setActivePage] = useState('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800">
      {sidebarOpen && <button aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><GraduationCap size={22} /></div>
          <div><div className="text-lg font-bold tracking-tight text-slate-900">Sterling<span className="text-indigo-600">.</span></div><div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Learning platform</div></div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto rounded-lg p-2 text-slate-400 lg:hidden"><X size={18} /></button>
        </div>
        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
          <nav className="space-y-1">
            {navigation.map(({ label, icon: Icon }) => (
              <button key={label} onClick={() => { setActivePage(label); setSidebarOpen(false) }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${activePage === label ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Students' && <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">1.2k</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-8 px-4">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Management</p>
          <nav className="space-y-1">
            <button onClick={() => setActivePage('Reports')} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${activePage === 'Reports' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}><ChartNoAxesCombined size={18} strokeWidth={1.8} />Reports</button>
            <button onClick={() => setActivePage('Messages')} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${activePage === 'Messages' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}><MessageSquare size={18} strokeWidth={1.8} />Messages<span className="ml-auto h-2 w-2 rounded-full bg-indigo-500" /></button>
          </nav>
        </div>
        <div className="mt-auto border-t border-slate-100 p-4">
          <button onClick={() => setActivePage('Settings')} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50"><Settings size={18} />Settings</button>
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">AD</div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">Admin User</p><p className="text-xs text-slate-400">Super administrator</p></div>
            <button aria-label="Log out" className="text-slate-400 hover:text-slate-700"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"><Menu size={20} /></button>
            <div><p className="text-xs font-medium text-slate-400">Pages / <span className="text-slate-600">{activePage}</span></p><h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">{activePage}</h1></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search anything..." className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50" /></div>
            <button aria-label="Help" className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"><CircleHelp size={18} /></button>
            <button className="flex items-center gap-2 rounded-xl p-1.5 pr-2 hover:bg-slate-50"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">AD</div><ChevronDown size={15} className="text-slate-400" /></button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-5 sm:p-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm text-slate-500">Saturday, October 31, 2026</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Good morning, Admin <span>👋</span></h2><p className="mt-2 text-sm text-slate-500">Here’s what’s happening with your learning community today.</p></div>
            <button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700">+ Add new course</button>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, change, direction, icon: Icon, tone, note }) => (
              <div key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/70">
                <div className="flex items-center justify-between"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone === 'blue' ? 'bg-blue-50 text-blue-600' : tone === 'violet' ? 'bg-violet-50 text-violet-600' : tone === 'green' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}><Icon size={19} /></div><button className="text-slate-300 hover:text-slate-500"><MoreHorizontal size={20} /></button></div>
                <p className="mt-5 text-sm font-medium text-slate-500">{label}</p><div className="mt-1 flex flex-wrap items-baseline gap-2"><span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span><span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${direction === 'up' ? 'text-emerald-600' : 'text-amber-600'}`}>{direction === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{change}</span></div><p className="mt-1 text-xs text-slate-400">{note}</p>
              </div>
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/70 sm:p-6">
              <div className="flex items-center justify-between"><div><h3 className="font-bold text-slate-900">Course performance</h3><p className="mt-1 text-xs text-slate-400">Engagement across your top courses</p></div><button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">This month <ChevronDown size={13} className="ml-1 inline" /></button></div>
              <div className="mt-6 space-y-6">
                {courses.map(course => <div key={course.code}><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold text-slate-800">{course.title}</p><p className="mt-0.5 text-xs text-slate-400">{course.code} · {course.students} students · {course.lecturer}</p></div><span className="text-sm font-bold text-slate-700">{course.progress}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${course.color === 'indigo' ? 'bg-indigo-500' : course.color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'}`} style={{ width: `${course.progress}%` }} /></div></div>)}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/70 sm:p-6">
              <div className="flex items-center justify-between"><div><h3 className="font-bold text-slate-900">Recent activity</h3><p className="mt-1 text-xs text-slate-400">Latest updates from your campus</p></div><button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View all</button></div>
              <div className="mt-5 space-y-5">{activities.map(item => <div key={item.title} className="flex gap-3"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.tone === 'blue' ? 'bg-blue-50 text-blue-600' : item.tone === 'violet' ? 'bg-violet-50 text-violet-600' : 'bg-emerald-50 text-emerald-600'}`}>{item.initials}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{item.title}</p><p className="mt-0.5 truncate text-xs text-slate-500">{item.detail}</p><p className="mt-1 text-[11px] text-slate-400">{item.time}</p></div></div>)}</div>
            </div>
          </section>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600"><Activity size={20} /></div><div><p className="text-sm font-bold text-slate-800">Your campus is looking good!</p><p className="mt-0.5 text-xs text-slate-500">All systems are operational. Keep up the great work.</p></div></div><span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">All systems operational</span></div>
          <footer className="py-7 text-center text-xs text-slate-400">© 2026 Sterling LMS. Built for better learning.</footer>
        </div>
      </main>
    </div>
  )
}

export default App