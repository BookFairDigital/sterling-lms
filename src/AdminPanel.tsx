import { useMemo, useState } from 'react'
import {
  Activity, Bell, BookOpen, CheckCircle2, ChevronRight, CircleDollarSign,
  ClipboardList, GraduationCap, LayoutDashboard, LogOut, Menu, Search,
  Settings, Users, Wallet, X, Plus, Filter,
} from 'lucide-react'

type Section = 'overview' | 'students' | 'courses' | 'payments' | 'materials' | 'announcements'

const menu: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'payments', label: 'Payments', icon: Wallet },
  { id: 'materials', label: 'Learning Materials', icon: ClipboardList },
  { id: 'announcements', label: 'Announcements', icon: Bell },
]

const students = [
  { id: 'ST-001', name: 'Kasun Perera', email: 'kasun@example.com', course: 'Automobile Technician', status: 'Active' },
  { id: 'ST-002', name: 'Nethmi Silva', email: 'nethmi@example.com', course: 'Automobile Electrical', status: 'Active' },
  { id: 'ST-003', name: 'Ravindu Fernando', email: 'ravindu@example.com', course: 'Automobile Technician', status: 'Pending' },
  { id: 'ST-004', name: 'Tharushi Jayasuriya', email: 'tharushi@example.com', course: 'Automobile Electrical', status: 'Active' },
]

const payments = [
  { ref: 'PAY-1042', student: 'Kasun Perera', amount: 'LKR 25,000', date: '28 Oct 2026', status: 'Pending' },
  { ref: 'PAY-1041', student: 'Nethmi Silva', amount: 'LKR 15,000', date: '27 Oct 2026', status: 'Approved' },
  { ref: 'PAY-1039', student: 'Ravindu Fernando', amount: 'LKR 25,000', date: '25 Oct 2026', status: 'Pending' },
]

function AdminPanel({ onExit }: { onExit: () => void }) {
  const [section, setSection] = useState<Section>('overview')
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [paymentStatuses, setPaymentStatuses] = useState<Record<string, string>>({})
  const [studentStatuses, setStudentStatuses] = useState<Record<string, string>>({})
  const [announcement, setAnnouncement] = useState('')
  const title = menu.find(x => x.id === section)?.label ?? 'Overview'
  const filteredStudents = useMemo(() => students.filter(s => [s.id, s.name, s.email, s.course].join(' ').toLowerCase().includes(query.toLowerCase())), [query])
  const filteredPayments = useMemo(() => payments.filter(p => [p.ref, p.student, p.status].join(' ').toLowerCase().includes(query.toLowerCase())), [query])
  const Card = ({ children }: { children: React.ReactNode }) => <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">{children}</section>
  const Pill = ({ value }: { value: string }) => <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${value === 'Approved' || value === 'Active' ? 'bg-emerald-50 text-emerald-700' : value === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{value}</span>

  return <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
    {mobileOpen && <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[245px] flex-col bg-[#102b46] text-white transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600"><GraduationCap size={23}/></div><div><b className="tracking-wide">STERLING</b><p className="text-[9px] tracking-[.2em] text-blue-200">ADMINISTRATION</p></div><button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden"><X size={18}/></button></div>
      <div className="px-5 py-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-200">Workspace</p><p className="mt-1 text-sm font-semibold">Training Centre</p></div>
      <nav className="flex-1 space-y-1 px-3">{menu.map(item => <button key={item.id} onClick={() => { setSection(item.id); setMobileOpen(false); setQuery('') }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[13px] font-medium ${section === item.id ? 'bg-blue-600 text-white' : 'text-blue-100 hover:bg-white/10'}`}><item.icon size={17}/>{item.label}</button>)}</nav>
      <div className="border-t border-white/10 p-4"><button onClick={onExit} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-blue-100 hover:bg-white/10"><LogOut size={16}/>Exit admin preview</button></div>
    </aside>
    <main className="min-h-screen lg:ml-[245px]">
      <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 lg:hidden"><Menu size={20}/></button><div className="relative w-full max-w-xl"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder={section === 'students' ? 'Search students...' : section === 'payments' ? 'Search payments...' : 'Search Sterling LMS...'} className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-400"/></div></div>
        <div className="ml-3 flex items-center gap-3"><span className="hidden text-xs font-semibold text-slate-500 sm:block">Administrator preview</span><div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">AD</div></div>
      </header>
      <div className="mx-auto max-w-[1500px] p-4 sm:p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-600">Sterling LMS · Admin</p><h1 className="mt-1 text-2xl font-extrabold">{title}</h1><p className="mt-1 text-xs text-slate-500">Manage your training centre from one place.</p></div>{section !== 'overview' && <button onClick={() => setNotice('This action will be enabled when the secure backend is connected.')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white"><Plus size={15}/>Add {section === 'students' ? 'Student' : section === 'courses' ? 'Course' : section === 'materials' ? 'Material' : section === 'announcements' ? 'Announcement' : 'Record'}</button>}</div>
        {notice && <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800"><span>{notice}</span><button onClick={() => setNotice('')}><X size={15}/></button></div>}
        {section === 'overview' && <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[{ label: 'Total Students', value: '128', note: 'Registered learners', icon: Users, color: 'bg-blue-50 text-blue-700' }, { label: 'Active Courses', value: '06', note: 'Published programmes', icon: BookOpen, color: 'bg-violet-50 text-violet-700' }, { label: 'Pending Payments', value: '08', note: 'Awaiting review', icon: CircleDollarSign, color: 'bg-amber-50 text-amber-700' }, { label: 'Course Completion', value: '76%', note: 'Average progress', icon: Activity, color: 'bg-emerald-50 text-emerald-700' }].map(k => { const Icon = k.icon; return <Card key={k.label}><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">{k.label}</span><span className={`grid h-10 w-10 place-items-center rounded-xl ${k.color}`}><Icon size={19}/></span></div><p className="mt-4 text-3xl font-extrabold">{k.value}</p><p className="mt-1 text-[11px] text-slate-400">{k.note}</p></Card> })}
          </div>
          <div className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Card><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Recent Student Registrations</h2><button onClick={() => setSection('students')} className="text-xs font-bold text-blue-600">View students <ChevronRight size={13} className="inline"/></button></div><div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-xs"><thead className="text-slate-400"><tr className="border-b"><th className="pb-3">Student</th><th className="pb-3">Course</th><th className="pb-3">Status</th></tr></thead><tbody>{students.slice(0,3).map(s => <tr key={s.id} className="border-b border-slate-100 last:border-0"><td className="py-3"><b>{s.name}</b><span className="block pt-1 text-[10px] text-slate-400">{s.id}</span></td><td>{s.course}</td><td><Pill value={s.status}/></td></tr>)}</tbody></table></div></Card>
            <Card><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Payment Reviews</h2><button onClick={() => setSection('payments')} className="text-xs font-bold text-blue-600">View all <ChevronRight size={13} className="inline"/></button></div>{payments.filter(p => p.status === 'Pending').map(p => <div key={p.ref} className="flex items-center justify-between gap-2 border-b border-slate-100 py-3 last:border-0"><div><b className="block text-xs">{p.student}</b><span className="text-[10px] text-slate-400">{p.ref} · {p.amount}</span></div><Pill value="Pending"/></div>)}</Card>
          </div>
        </>}
        {section === 'students' && <Card><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Student Directory</h2><span className="text-[11px] text-slate-400">{filteredStudents.length} records</span></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="border-b text-slate-400"><tr><th className="p-3">Student ID</th><th>Name</th><th>Email</th><th>Course</th><th>Status</th><th>Action</th></tr></thead><tbody>{filteredStudents.map(s => <tr key={s.id} className="border-b border-slate-100"><td className="p-3 font-bold">{s.id}</td><td>{s.name}</td><td>{s.email}</td><td>{s.course}</td><td><Pill value={studentStatuses[s.id] ?? s.status}/></td><td><button onClick={() => setNotice(`Student profile for ${s.name} will open after backend integration.`)} className="font-bold text-blue-600">View</button></td></tr>)}</tbody></table></div></Card>}
        {section === 'courses' && <div className="grid gap-4 lg:grid-cols-2">{[{ name: 'Automobile Technician', level: 'NVQ Level 4', students: 74, state: 'Published' }, { name: 'Automobile Electrical Technician', level: 'NVQ Level 4', students: 54, state: 'Published' }, { name: 'Automotive Workshop Practice', level: 'Short Course', students: 0, state: 'Draft' }].map(c => <Card key={c.name}><div className="flex items-start justify-between"><div><h2 className="font-bold">{c.name}</h2><p className="mt-1 text-xs text-slate-500">{c.level}</p></div><Pill value={c.state === 'Published' ? 'Active' : 'Pending'}/></div><div className="mt-5 flex items-center justify-between border-t pt-4 text-xs"><span className="text-slate-500">{c.students} enrolled students</span><button onClick={() => setNotice('Course editing will be enabled after backend integration.')} className="font-bold text-blue-600">Manage course</button></div></Card>)}</div>}
        {section === 'payments' && <Card><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Payment Review Queue</h2><button onClick={() => setNotice('Filters will be available with live payment records.')} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><Filter size={14}/>Filter</button></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="border-b text-slate-400"><tr><th className="p-3">Reference</th><th>Student</th><th>Amount</th><th>Date</th><th>Status</th><th>Review</th></tr></thead><tbody>{filteredPayments.map(p => <tr key={p.ref} className="border-b border-slate-100"><td className="p-3 font-bold">{p.ref}</td><td>{p.student}</td><td>{p.amount}</td><td>{p.date}</td><td><Pill value={paymentStatuses[p.ref] ?? p.status}/></td><td><div className="flex gap-2"><button onClick={() => setPaymentStatuses(v => ({ ...v, [p.ref]: 'Approved' }))} className="rounded bg-emerald-50 px-2 py-1 font-bold text-emerald-700">Approve</button><button onClick={() => setPaymentStatuses(v => ({ ...v, [p.ref]: 'Rejected' }))} className="rounded bg-red-50 px-2 py-1 font-bold text-red-700">Reject</button></div></td></tr>)}</tbody></table></div></Card>}
        {section === 'materials' && <Card><h2 className="mb-3 font-bold">Learning Material Library</h2>{[['Introduction to Automotive Systems','Video lesson · Module 01'],['Engine Components','PDF study material · Module 02'],['Electrical Safety Guidelines','PDF study material · Module 03']].map(([name,detail]) => <div key={name} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-4 last:border-0"><div><b className="block text-xs">{name}</b><span className="text-[11px] text-slate-400">{detail}</span></div><button onClick={() => setNotice('Upload and storage will be connected to the secure course library.')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">Manage file</button></div>)}</Card>}
        {section === 'announcements' && <Card><h2 className="mb-3 font-bold">Create Announcement</h2><label className="mb-2 block text-xs font-semibold">Announcement message</label><textarea value={announcement} onChange={e => setAnnouncement(e.target.value)} rows={4} placeholder="Write an update for students..." className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"/><button onClick={() => setNotice(announcement.trim() ? 'Draft saved in this preview only. Connect the backend to publish to students.' : 'Please enter an announcement first.')} className="mt-3 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">Save announcement</button></Card>}
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[11px] leading-5 text-amber-900"><b>Preview build — not connected to live student data.</b> The records and dashboard figures above are sample content. Secure administrator sign-in, database permissions, and saving changes must be connected before using this panel with real student information.</div>
        <footer className="py-7 text-center text-[10px] text-slate-400">Sterling Training Centre · Administration</footer>
      </div>
    </main>
  </div>
}

export default AdminPanel
