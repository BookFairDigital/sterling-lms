import { useEffect, useState, type FormEvent, type Dispatch, type SetStateAction } from 'react'
import BrandLogo from './BrandLogo'
import {
  ArrowRight, Award, BookOpen, BriefcaseBusiness, CheckCircle2,
  GraduationCap, MapPin, Menu, Monitor, Phone, Play, Settings, House, FilePenLine, UserRound, LockKeyhole,
  ShieldCheck, Users, Wrench, X, Mail, Clock3, BadgeCheck, MessageCircle, Facebook, Instagram, Linkedin, Music2,
} from 'lucide-react'

type Course = {
  id: string
  title: string
  description?: string
  short_description?: string
  qualification?: string
  course_type?: string
  duration_months?: number
  institutional_months?: number
  on_job_months?: number
  image_url?: string
  thumbnail_url?: string
  [key: string]: any
}
type Props = {
  courses: Course[]
  gallery: any[]
  settings: Record<string, string>
  onLogin: () => void
  applicationForm: any
  setApplicationForm: Dispatch<SetStateAction<any>>
  applicationNotice: string
  applicationError: string
  applicationBusy: boolean
  onApplySubmit: (event: FormEvent<HTMLFormElement>) => void
  chatForm: any
  setChatForm: Dispatch<SetStateAction<any>>
  chatNotice: string
  onChatSubmit: (event: FormEvent<HTMLFormElement>) => void
}
const branches = [
  { name: 'Minuwangoda', address: 'Kamel Waththa, Aluthepola, Dunagaha', imageKey: 'location_minuwangoda_image_url', url: 'https://www.sterling.lk/sterling_branches/dunagaha/' },
  { name: 'Galle', address: '22, Crips Road, Galle', imageKey: 'location_galle_image_url', url: 'https://www.sterling.lk/sterling_branches/galle/' },
  { name: 'Ratmalana', address: '33, Maligawa Road, Moratuwa', imageKey: 'location_rathmalana_image_url', url: 'https://www.sterling.lk/sterling_branches/rathmalana/' },
  { name: 'Kadawatha', address: '385/45, Major Wasantha Gunarathna Mawatha, Mahara, Kadawatha', imageKey: 'location_kadawatha_image_url', url: 'https://www.sterling.lk/sterling_branches/mahara/' },
  { name: 'Nugegoda', address: '193, Station Road, Udahamulla, Nugegoda', imageKey: 'location_nugegoda_image_url', url: 'https://www.sterling.lk/sterling_branches/udahamulla/' },
]
const photos = {
  hero: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=2000&q=90',
  automotive: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=85',
  electrical: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=85',
  computer: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=85',
  refrigeration: 'https://images.unsplash.com/photo-1631545806609-7b6f8f2f3e9c?auto=format&fit=crop&w=900&q=85',
  headlight: 'https://images.unsplash.com/photo-1632823471565-1ecdf5c7a3f1?auto=format&fit=crop&w=1200&q=85',
  drive: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=85',
}
const courseImage = (course: Course, settings: Record<string, string>) => {
  if (course.image_url || course.thumbnail_url) return course.image_url || course.thumbnail_url
  const title = String(course.title || '').toLowerCase()
  if (title.includes('elect')) return settings.course_electrical_image_url || photos.electrical
  if (title.includes('computer') || title.includes('application')) return settings.course_computer_image_url || photos.computer
  if (title.includes('refriger') || title.includes('air condition')) return settings.course_refrigeration_image_url || photos.refrigeration
  return settings.course_automobile_image_url || photos.automotive
}
export default function PremiumLanding(props: Props) {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [mobileTab, setMobileTab] = useState('Home')
  const [mobileNavScrolled, setMobileNavScrolled] = useState(false)
  useEffect(() => {
    const updateScroll = () => setMobileNavScrolled(window.scrollY > 48)
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])
  const [heroFailed, setHeroFailed] = useState(false)
  const [headlightFailed, setHeadlightFailed] = useState(false)
  const [driveFailed, setDriveFailed] = useState(false)
  const [galleryStart, setGalleryStart] = useState(0)
  const heroImage = props.settings.hero_image_url || photos.hero
  const heroVideo = `${import.meta.env.BASE_URL}videos/hero-background.mp4`
  const headlightVideo = `${import.meta.env.BASE_URL}videos/headlight-repair.mp4`
  const driveVideo = `${import.meta.env.BASE_URL}videos/automotive-career-drive.mp4`
  const nav = [
    ['Home', '#home'], ['Courses', '#courses'], ['About', '#about'],
    ['Facilities', '#facilities'], ['LMS Features', '#lms-features'],
    ['Locations', '#locations'], ['Contact', '#contact'],
  ]
  const highlights = [
    { icon: Award, title: 'TVEC Approved', sub: 'Registered Training Centre · P02/0426' },
    { icon: Users, title: 'Industry Trainers', sub: 'Experienced Professionals' },
    { icon: Wrench, title: 'Hands-on Training', sub: 'Real Workshop Experience' },
    { icon: BriefcaseBusiness, title: 'Career Pathways', sub: 'Skills for the workplace' },
  ]
  const benefits = [
    { icon: GraduationCap, title: 'Industry-Focused Curriculum', sub: 'Learn skills relevant to technical careers.' },
    { icon: Settings, title: 'Modern Workshop Facilities', sub: 'Train with practical tools and equipment.' },
    { icon: Users, title: 'Experienced Technical Trainers', sub: 'Learn from industry-experienced professionals.' },
    { icon: BadgeCheck, title: 'Recognized Qualifications', sub: 'Explore approved training pathways.' },
  ]

  return <main className="sterling-premium min-h-screen overflow-hidden bg-[#080a0c] pb-24 text-white sm:pb-0">
    <div className="border-b border-white/10 bg-black/90 text-xs text-neutral-300">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-7">
        <span className="font-semibold tracking-[.16em]">TVEC APPROVED TRAINING CENTRE · REF. P02/0426</span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-semibold"><a href="tel:+94117600800" className="hover:text-blue-400">+94 11 760 0800</a><a href="mailto:callcenter@sterling.lk" className="hover:text-blue-400">callcenter@sterling.lk</a><a href="tel:+94762259595" className="hover:text-blue-400">076 225 9595</a><a href="mailto:info@sats.lk" className="hover:text-blue-400">Info@sats.lk</a></div>
      </div>
    </div>
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080a0c]/95 shadow-lg shadow-black/20 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-7">
        <a href="#home" aria-label="Sterling LMS home" className="shrink-0 rounded bg-white px-2 py-1"><BrandLogo className="w-36 sm:w-44"/></a>
        <nav className="hidden items-center gap-4 2xl:gap-5 xl:flex">{nav.map(([label, href], i)=><a key={label} href={href} className={`whitespace-nowrap text-base font-bold transition hover:text-blue-500 ${i===0?'text-blue-500':''}`}>{label}</a>)}</nav>
        <div className="hidden items-center gap-2 sm:flex">
          <button onClick={props.onLogin} className="rounded-lg border border-white/40 px-4 py-2.5 text-[11px] font-bold transition hover:border-blue-500 hover:text-blue-400"><Users size={14} className="mr-1.5 inline"/>Student Login</button>
          <a href="#apply" className="rounded-lg bg-[#1749d1] px-4 py-2.5 text-[11px] font-black text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-700"><GraduationCap size={15} className="mr-1 inline"/>Apply Now</a>
        </div>
        <button className="rounded-lg border border-white/20 p-2 xl:hidden" aria-label="Toggle navigation" onClick={()=>setMobileMenu(v=>!v)}>{mobileMenu?<X size={21}/>:<Menu size={21}/>}</button>
      </div>
      {mobileMenu&&<nav className="grid gap-1 border-t border-white/10 bg-[#111519] p-4 xl:hidden">{nav.map(([label,href])=><a key={label} href={href} onClick={()=>setMobileMenu(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-white/5 hover:text-blue-400">{label}</a>)}<button onClick={()=>{setMobileMenu(false);props.onLogin()}} className="mt-2 rounded-lg border border-white/20 px-3 py-3 text-left text-sm font-bold">Student Login</button><a href="#apply" onClick={()=>setMobileMenu(false)} className="rounded-lg bg-blue-600 px-3 py-3 text-sm font-bold">Apply Now</a></nav>}
    </header>

    <section id="home" className="relative isolate flex min-h-[620px] items-center overflow-hidden sm:min-h-[650px]">
      {!heroFailed
        ? <video src={heroVideo} autoPlay muted loop playsInline preload="auto" disablePictureInPicture onError={()=>setHeroFailed(true)} aria-label="Sterling automotive workshop hero background" className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"/>
        : <img src={heroImage} alt="Automotive technician working in a vehicle workshop" fetchPriority="high" className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"/>}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-black via-black/70 to-black/15"/>
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#080a0c] via-transparent to-black/20"/>
      
      <div className="relative z-20 mx-auto grid w-full max-w-[1440px] items-center gap-8 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-[.95fr_1.05fr]">
        <div className="max-w-[690px]">
          <p className="mb-5 text-base font-black uppercase tracking-[.24em] text-blue-400 sm:text-xl">Sterling Automobiles Training School</p>
          <h1 className="max-w-[700px] text-[clamp(2.35rem,9vw,3.8rem)] font-black italic leading-[.98] tracking-tight sm:text-6xl lg:text-[72px]">BUILD YOUR FUTURE IN THE <span className="text-blue-500">AUTOMOTIVE INDUSTRY</span></h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-neutral-200 sm:mt-6 sm:text-xl">Develop practical technical skills, learn from industry professionals and build a successful career with SATS.</p>
          <div className="mt-7 flex flex-col items-stretch gap-3 min-[430px]:flex-row min-[430px]:flex-wrap min-[430px]:items-center">
            <a href="#apply" className="flex min-h-[54px] items-center justify-center rounded-xl bg-[#1749d1] px-6 py-3.5 text-sm font-black shadow-[0_8px_28px_rgba(227,27,35,.25)] transition hover:-translate-y-0.5 hover:bg-blue-700 min-[430px]:min-w-[165px]">Apply Now <ArrowRight size={16} className="ml-2 inline"/></a>
            <a href="#courses" className="flex min-h-[54px] items-center justify-center rounded-xl border border-white/60 bg-black/25 px-6 py-3.5 text-sm font-bold backdrop-blur transition hover:border-blue-500 hover:text-blue-400 min-[430px]:min-w-[185px]">Explore Courses</a>
            <a href="#about" className="flex min-h-[48px] items-center justify-center gap-2 px-2 py-2 text-xs font-bold text-white hover:text-blue-400 min-[430px]:justify-start"><span className="grid h-10 w-10 place-items-center rounded-full border-2 border-white"><Play size={15} fill="currentColor"/></span> Discover SATS</a>
          </div>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-4 py-2 text-[10px] font-bold tracking-wide text-neutral-200 backdrop-blur"><ShieldCheck size={16} className="text-blue-500"/> TVEC Approved Training Centre</div>
        </div>
        <div className="hidden lg:block"/>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent"/>
    </section>

    <section aria-label="Training highlights" className="relative border-y border-white/10 bg-[radial-gradient(ellipse_at_top,rgba(85,22,29,.22),transparent_60%),#090b0f] px-4 py-8 sm:px-7 sm:py-7">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-4 flex items-center justify-between sm:hidden"><div><p className="text-[9px] font-black uppercase tracking-[.28em] text-blue-400">The Sterling advantage</p><h2 className="mt-1 text-lg font-extrabold">Built for your future</h2></div><span className="rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-[9px] font-bold text-blue-300">01 / 04</span></div>
        <div className="grid grid-cols-2 gap-3 sm:hidden">{highlights.map(({icon:Icon,title,sub},i)=><article key={title} className="group relative min-h-[154px] overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-br from-[#202128]/95 via-[#14171d]/95 to-[#180e13] p-4 shadow-[0_12px_30px_rgba(0,0,0,.24)] transition duration-300 active:scale-[.98]"><div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-600/10 blur-2xl transition group-hover:bg-blue-500/20"/><div className="relative flex h-full flex-col"><div className="mb-3 flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-400"><Icon size={21}/></span><span className="text-[9px] font-black tracking-[.18em] text-white/25">0{i+1}</span></div><b className="text-[12px] font-extrabold leading-snug text-white">{title}</b><span className="mt-1.5 text-[10px] leading-4 text-neutral-400">{sub}</span></div><span className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"/></article>)}</div>
        <div className="hidden grid-cols-2 divide-x divide-white/10 sm:grid sm:grid-cols-4">{highlights.map(({icon:Icon,title,sub})=><div key={title} className="flex items-center gap-3 px-3 py-2 sm:justify-center"><Icon size={28} className="shrink-0 text-blue-500"/><div><b className="block text-sm sm:text-base">{title}</b><span className="mt-1 block text-xs text-neutral-400 sm:text-sm">{sub}</span></div></div>)}</div>
      </div>
    </section>

    <section id="courses" className="scroll-mt-24 bg-[radial-gradient(ellipse_at_top,#171b20_0%,#080a0c_65%)] px-4 py-16 sm:px-7 sm:py-20">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.3em] text-blue-500">Learn. Practice. Progress.</p><h2 className="mt-2 text-3xl font-black sm:text-4xl"><span className="text-blue-600">//</span> Our Training Programs</h2><p className="mt-2 text-sm text-neutral-400">Explore programmes currently published by Sterling Automobiles Training School.</p></div><span className="text-xs font-bold text-blue-400">{props.courses.length} published course{props.courses.length===1?'':'s'}</span></div>
        {props.courses.length===0?<div className="rounded-2xl border border-dashed border-white/20 p-10 text-center text-sm text-neutral-400">Course details will appear here when published by the training centre.</div>:<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{props.courses.map((course)=><article key={course.id} className="group overflow-hidden rounded-2xl border border-white/15 bg-[#111519] shadow-[0_12px_34px_rgba(0,0,0,.28)] transition duration-300 hover:-translate-y-1 hover:border-blue-600/80 hover:shadow-[0_16px_40px_rgba(227,27,35,.12)]">
          <div className="relative h-48 overflow-hidden"><img src={courseImage(course,props.settings)} alt={course.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110"/><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"/><span className="absolute bottom-3 left-3 rounded-md bg-blue-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white">{course.qualification || 'Training Programme'}</span></div>
          <div className="p-5"><h3 className="min-h-[48px] text-base font-extrabold leading-snug">{course.title}</h3><p className="mt-2 line-clamp-3 min-h-[60px] text-xs leading-5 text-neutral-400">{course.description || course.short_description || 'Explore course details and admission information from Sterling Automobiles Training School.'}</p>{(course.duration_months!=null||course.institutional_months!=null||course.on_job_months!=null)&&<div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-500">{course.duration_months!=null&&<span>Duration: {course.duration_months} months</span>}{course.institutional_months!=null&&<span>Institutional: {course.institutional_months} months</span>}{course.on_job_months!=null&&<span>On-the-job: {course.on_job_months} months</span>}</div>}<div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4"><span className="text-[10px] text-neutral-500">{course.course_type==='part_time'?'Part Time':course.course_type==='full_time'?'Full Time':'Course details'}</span><a href="#apply" onClick={()=>props.setApplicationForm((v: any)=>({...v,course_id:course.id}))} className="text-xs font-black text-blue-400 transition hover:text-blue-300">Apply <ArrowRight size={14} className="ml-1 inline"/></a></div></div>
        </article>)}</div>}
      </div>
    </section>

    <section id="about" className="scroll-mt-24 bg-[#0d1013] px-4 py-16 sm:px-7 sm:py-20">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-[.85fr_1.15fr]">
        <div><p className="text-[10px] font-black uppercase tracking-[.3em] text-blue-500">Why choose Sterling</p><h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Train with purpose.<br/><span className="text-blue-500">Build your future.</span></h2><p className="mt-5 max-w-lg text-sm leading-7 text-neutral-300">A practical learning environment focused on technical knowledge, hands-on experience and career development.</p><a href="#apply" className="mt-7 inline-flex items-center rounded-lg bg-blue-600 px-5 py-3 text-xs font-black hover:bg-blue-700">Start Your Application <ArrowRight size={15} className="ml-2"/></a></div>
        <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
          {!headlightFailed
            ? <video className="absolute inset-0 h-full w-full object-cover" src={headlightVideo} autoPlay muted loop playsInline preload="auto" onError={()=>setHeadlightFailed(true)} aria-label="Technician repairing a vehicle headlight"/>
            : <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,#343a40_0%,#111519_48%,#050607_100%)]"><div className="absolute inset-0 bg-gradient-to-r from-black/35 to-transparent"/></div>}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/25 to-transparent"/>
          <span className="absolute bottom-4 left-4 rounded-md border border-white/20 bg-black/65 px-3 py-2 text-[10px] font-bold tracking-wider">PRACTICAL AUTOMOTIVE EXPERIENCE</span>
          <span className="absolute left-0 top-0 h-full w-1.5 bg-blue-600"/>
        </div>
      </div>
      <div id="facilities" className="mx-auto mt-14 grid max-w-[1440px] gap-4 sm:grid-cols-2 xl:grid-cols-4">{benefits.map(({icon:Icon,title,sub})=><div key={title} className="flex gap-4 rounded-xl border border-white/10 bg-[#13171b] p-5 transition hover:border-blue-600/60"><Icon size={27} className="shrink-0 text-blue-500"/><div><h3 className="text-sm font-extrabold">{title}</h3><p className="mt-1 text-xs leading-5 text-neutral-400">{sub}</p></div></div>)}</div>
    </section>

    <section id="lms-features" className="scroll-mt-24 border-y border-white/10 bg-[#111519] px-4 py-14 sm:px-7">
      <div className="mx-auto max-w-[1440px]"><div className="mb-7 text-center"><p className="text-[10px] font-black uppercase tracking-[.3em] text-blue-500">Learn beyond the workshop</p><h2 className="mt-2 text-3xl font-black">Sterling LMS Features</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[{icon:BookOpen,title:'Learning Materials',sub:'Access course resources online.'},{icon:Monitor,title:'Online Assessments',sub:'Complete available learning assessments.'},{icon:Clock3,title:'Attendance & Classes',sub:'Review attendance and class information.'},{icon:CheckCircle2,title:'Progress & Payments',sub:'View your learning and payment records.'}].map(({icon:Icon,title,sub})=><button key={title} onClick={props.onLogin} className="rounded-xl border border-white/10 bg-[#0b0e11] p-5 text-left transition hover:-translate-y-1 hover:border-blue-600/70"><Icon size={26} className="text-blue-500"/><h3 className="mt-4 text-sm font-extrabold">{title}</h3><p className="mt-1 text-xs leading-5 text-neutral-400">{sub}</p><span className="mt-4 inline-block text-[10px] font-black uppercase tracking-wider text-blue-400">Student Login <ArrowRight size={13} className="ml-1 inline"/></span></button>)}</div></div>
    </section>

    <section id="locations" className="scroll-mt-24 bg-[#090b0d] px-4 py-16 sm:px-7">
      <div className="mx-auto max-w-[1440px]"><div className="text-center"><p className="text-[10px] font-black uppercase tracking-[.3em] text-blue-500">Find a training centre</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Our <span className="text-blue-500">Locations</span></h2><p className="mt-3 text-sm text-neutral-400">Explore Sterling's five listed training locations and their official branch information.</p></div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{branches.map((branch,i)=>{const fallbackImage=[photos.automotive,photos.electrical,photos.headlight,photos.refrigeration,photos.automotive][i];return <article key={branch.name} className="group overflow-hidden rounded-xl border border-white/10 bg-[#13171b] transition hover:-translate-y-1 hover:border-blue-600/70"><div className="relative h-32 overflow-hidden"><img src={props.settings[branch.imageKey] || fallbackImage} onError={e=>{if(e.currentTarget.dataset.fallbackApplied!=='true'){e.currentTarget.dataset.fallbackApplied='true';e.currentTarget.src=fallbackImage}}} alt={branch.name+' training centre'} loading="lazy" className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-110 group-hover:opacity-100"/><div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"/></div><div className="p-4"><h3 className="flex items-center gap-2 text-sm font-extrabold"><MapPin size={16} className="text-blue-500"/>{branch.name}</h3><p className="mt-2 min-h-[30px] text-[10px] leading-4 text-neutral-400">{branch.address}</p><a href={branch.url} target="_blank" rel="noreferrer" className="mt-3 block text-[10px] font-black text-blue-400 hover:text-blue-300">Official branch details <ArrowRight size={12} className="ml-1 inline"/></a><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address+', Sri Lanka')}`} target="_blank" rel="noreferrer" className="mt-2 block text-[10px] font-semibold text-neutral-400 hover:text-white">Get directions ↗</a></div></article>})}</div>
        <p className="mx-auto mt-5 max-w-3xl text-center text-[10px] leading-5 text-neutral-500">Branch addresses are taken from Sterling's official branch network. Directions open a Google Maps search for the published address; exact coordinates are not embedded until independently verified.</p>
      </div>
    </section>

    {props.gallery.length>0&&<section id="gallery" className="scroll-mt-24 border-y border-white/10 bg-[#111519] px-4 py-14 sm:px-7"><div className="mx-auto max-w-[1440px]"><div className="mb-7 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.3em] text-blue-500">Inside Sterling</p><h2 className="mt-2 text-3xl font-black">Workshop <span className="text-blue-500">Gallery</span></h2></div>{props.gallery.length>4&&<div className="flex gap-2"><button aria-label="Previous gallery images" onClick={()=>setGalleryStart(v=>Math.max(0,v-1))} className="rounded-full border border-white/20 px-3 py-2 hover:border-blue-500">←</button><button aria-label="Next gallery images" onClick={()=>setGalleryStart(v=>Math.min(props.gallery.length-4,v+1))} className="rounded-full border border-white/20 px-3 py-2 hover:border-blue-500">→</button></div>}</div><div className="grid gap-3 grid-cols-2 lg:grid-cols-4">{props.gallery.slice(galleryStart,galleryStart+4).map(item=><figure key={item.id} className="group relative h-44 overflow-hidden rounded-xl bg-black sm:h-56"><img src={`https://sterling-lms-api.texascampus1.workers.dev/public/gallery/${item.id}`} alt={item.title||'Sterling training activity'} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8 text-xs font-bold">{item.title}</figcaption></figure>)}</div></div></section>}

    <section className="relative isolate overflow-hidden border-y border-blue-900/60 px-4 py-12 sm:px-7 sm:py-16">
      {!driveFailed
        ? <video className="absolute inset-0 -z-20 h-full w-full object-cover" src={driveVideo} autoPlay muted loop playsInline preload="auto" onError={()=>setDriveFailed(true)} aria-label="Automotive career driving scene"/>
        : <div className="absolute inset-0 -z-20 h-full w-full bg-[radial-gradient(ellipse_at_70%_40%,#343a40_0%,#111519_48%,#050607_100%)]"/>}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 to-black/35"/>
      <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-6 md:flex-row md:items-center"><div><p className="text-[10px] font-black uppercase tracking-[.3em] text-blue-400">Your next chapter starts here</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Start Your Automotive Career Today!</h2><p className="mt-3 max-w-2xl text-sm text-neutral-200">Build practical skills and explore technical training opportunities with Sterling.</p></div><div className="flex shrink-0 flex-wrap gap-3"><a href="#apply" className="rounded-lg bg-blue-600 px-5 py-3 text-xs font-black hover:bg-blue-700">Apply Now <ArrowRight size={14} className="ml-1 inline"/></a><button onClick={props.onLogin} className="rounded-lg border border-white/60 bg-black/30 px-5 py-3 text-xs font-bold hover:border-blue-500">Student Login</button></div></div>
    </section>

    <section id="apply" className="scroll-mt-24 bg-[#0d1013] px-4 py-16 sm:px-7">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[.8fr_1.2fr]"><div className="flex flex-col justify-center"><p className="text-[10px] font-black uppercase tracking-[.3em] text-blue-500">Admissions</p><h2 className="mt-3 text-4xl font-black">Take the first step toward your <span className="text-blue-500">technical career.</span></h2><p className="mt-4 text-sm leading-7 text-neutral-400">Send an application using the existing Sterling admissions form. The training centre will review your details and contact you.</p><div className="mt-7 space-y-3 text-sm"><a href="tel:+94762249595" className="flex items-center gap-3 text-neutral-200 hover:text-blue-400"><Phone size={17} className="text-blue-500"/>0762249595</a><a href="mailto:satscoordinator@sterling.lk" className="flex items-center gap-3 text-neutral-200 hover:text-blue-400"><Mail size={17} className="text-blue-500"/>satscoordinator@sterling.lk</a></div></div>
        <form onSubmit={props.onApplySubmit} className="grid gap-4 rounded-2xl border border-white/10 bg-[#151a1f] p-5 shadow-2xl sm:grid-cols-2 sm:p-7"><div className="sm:col-span-2"><h3 className="text-xl font-black">Enrollment Application</h3><p className="mt-1 text-xs text-neutral-400">Complete the form to apply for a published programme.</p></div>
          {props.applicationNotice&&<p className="sm:col-span-2 rounded-lg border border-emerald-800 bg-emerald-950/50 p-3 text-xs text-emerald-300">{props.applicationNotice}</p>}{props.applicationError&&<p className="sm:col-span-2 rounded-lg border border-blue-800 bg-blue-950/50 p-3 text-xs text-blue-300">{props.applicationError}</p>}
          {([['full_name','Full name','text'],['email','Email address','email'],['phone','Phone number','tel'],['nic','NIC (optional)','text']] as const).map(([key,label,type])=><label key={key} className="text-[11px] font-bold text-neutral-300">{label}<input type={type} required={key!=='nic'} value={props.applicationForm[key]||''} onChange={e=>props.setApplicationForm((v: any)=>({...v,[key]:e.target.value}))} className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#090c0f] px-3 py-3 text-sm text-white outline-none focus:border-blue-500"/></label>)}
          <label className="sm:col-span-2 text-[11px] font-bold text-neutral-300">Select course<select required value={props.applicationForm.course_id||''} onChange={e=>props.setApplicationForm((v: any)=>({...v,course_id:e.target.value}))} className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#090c0f] px-3 py-3 text-sm text-white outline-none focus:border-blue-500"><option value="">Choose a published course</option>{props.courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
          <label className="sm:col-span-2 text-[11px] font-bold text-neutral-300">Address<input value={props.applicationForm.address||''} onChange={e=>props.setApplicationForm((v: any)=>({...v,address:e.target.value}))} className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#090c0f] px-3 py-3 text-sm text-white outline-none focus:border-blue-500"/></label>
          <label className="sm:col-span-2 text-[11px] font-bold text-neutral-300">Previous qualifications<textarea rows={2} value={props.applicationForm.qualifications||''} onChange={e=>props.setApplicationForm((v: any)=>({...v,qualifications:e.target.value}))} className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#090c0f] px-3 py-3 text-sm text-white outline-none focus:border-blue-500"/></label>
          <label className="sm:col-span-2 text-[11px] font-bold text-neutral-300">Additional message<textarea rows={2} value={props.applicationForm.message||''} onChange={e=>props.setApplicationForm((v: any)=>({...v,message:e.target.value}))} className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#090c0f] px-3 py-3 text-sm text-white outline-none focus:border-blue-500"/></label>
          <button disabled={props.applicationBusy||!props.courses.length} className="sm:col-span-2 rounded-lg bg-blue-600 px-5 py-3.5 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-50">{props.applicationBusy?'Submitting application…':'Submit Application'} <ArrowRight size={15} className="ml-2 inline"/></button>
        </form>
      </div>
    </section>

    <section id="contact" className="scroll-mt-24 border-t border-white/10 bg-[#111519] px-4 py-14 sm:px-7"><div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-2"><div><p className="text-[10px] font-black uppercase tracking-[.3em] text-blue-500">Contact SATS</p><h2 className="mt-2 text-3xl font-black">Talk to the SATS team.</h2><p className="mt-3 text-sm leading-6 text-neutral-400">For course details, training locations and admissions enquiries, contact the SATS team.</p><div className="mt-6 space-y-3 text-sm"><a className="flex items-center gap-3 hover:text-blue-400" href="tel:+94762249595"><Phone size={16} className="text-blue-500"/>0762249595</a><a className="flex items-center gap-3 hover:text-blue-400" href="mailto:satscoordinator@sterling.lk"><Mail size={16} className="text-blue-500"/>satscoordinator@sterling.lk</a><p className="flex items-start gap-3 text-neutral-300"><MapPin size={16} className="mt-0.5 shrink-0 text-blue-500"/>385/45, Major Wasantha Gunarathne Mw, Mahara, Kadawatha</p><a className="flex items-center gap-3 hover:text-blue-400" href="https://bookfairdigital.github.io/sterling-lms/" target="_blank" rel="noreferrer"><MapPin size={16} className="text-blue-500"/>Official SATS website</a></div></div>
      <form onSubmit={props.onChatSubmit} className="rounded-2xl border border-white/10 bg-[#0b0e11] p-5"><h3 className="text-lg font-extrabold">Send an enquiry</h3>{props.chatNotice&&<p className="mt-3 rounded-lg bg-emerald-950 p-3 text-xs text-emerald-300">{props.chatNotice}</p>}<div className="mt-4 grid gap-3 sm:grid-cols-2"><input required placeholder="Your name" value={props.chatForm.name} onChange={e=>props.setChatForm((v: any)=>({...v,name:e.target.value}))} className="rounded-lg border border-white/15 bg-[#151a1f] px-3 py-3 text-sm outline-none focus:border-blue-500"/><input required type="email" placeholder="Email address" value={props.chatForm.email} onChange={e=>props.setChatForm((v: any)=>({...v,email:e.target.value}))} className="rounded-lg border border-white/15 bg-[#151a1f] px-3 py-3 text-sm outline-none focus:border-blue-500"/><textarea required rows={3} placeholder="How can we help?" value={props.chatForm.message} onChange={e=>props.setChatForm((v: any)=>({...v,message:e.target.value}))} className="rounded-lg border border-white/15 bg-[#151a1f] px-3 py-3 text-sm outline-none focus:border-blue-500 sm:col-span-2"/><button className="rounded-lg bg-blue-600 px-5 py-3 text-xs font-black hover:bg-blue-700 sm:col-span-2">Send Enquiry <ArrowRight size={14} className="ml-1 inline"/></button></div></form>
    </div></section>

    <footer className="border-t border-blue-900/60 bg-black px-4 pb-7 pt-12 sm:px-7"><div className="mx-auto grid max-w-[1440px] gap-9 sm:grid-cols-2 lg:grid-cols-4"><div><div className="inline-block rounded bg-white p-2"><BrandLogo className="w-44"/></div><p className="mt-4 max-w-xs text-xs leading-6 text-neutral-400">Sterling Automobiles Training School — practical technical training and learning support.</p></div><div><h3 className="text-xs font-black uppercase tracking-wider">Quick Links</h3><div className="mt-4 grid gap-3 text-xs text-neutral-400">{nav.map(([label,href])=><a key={label} href={href} className="hover:text-blue-400">{label}</a>)}</div></div><div><h3 className="text-xs font-black uppercase tracking-wider">Student LMS</h3><div className="mt-4 grid gap-3 text-xs text-neutral-400"><button onClick={props.onLogin} className="text-left hover:text-blue-400">Student Login</button><a href="#courses" className="hover:text-blue-400">Training Programmes</a><a href="#apply" className="hover:text-blue-400">Apply Online</a><a href="#locations" className="hover:text-blue-400">Training Locations</a></div></div><div><h3 className="text-xs font-black uppercase tracking-wider">Contact Us</h3><div className="mt-4 grid gap-3 text-xs text-neutral-400"><a href="tel:+94762249595">0762249595</a><a href="mailto:satscoordinator@sterling.lk">satscoordinator@sterling.lk</a><p>385/45, Major Wasantha Gunarathne Mw, Mahara, Kadawatha</p><a href="https://bookfairdigital.github.io/sterling-lms/" target="_blank" rel="noreferrer">Official SATS website</a><div className="mt-2 flex flex-wrap items-center gap-3 pt-2">
        <a href="https://www.facebook.com/share/1HzqBpCM8U/?mibextid=wwXIfr" target="_blank" rel="noreferrer" aria-label="SATS on Facebook" title="Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-neutral-300 transition hover:-translate-y-1 hover:border-blue-500 hover:bg-blue-600 hover:text-white"><Facebook size={18}/></a>
        <a href="https://www.instagram.com/sterlingautomobilesschool?srtk=MWd5dmt5NHBkNjY4bg==" target="_blank" rel="noreferrer" aria-label="SATS on Instagram" title="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-neutral-300 transition hover:-translate-y-1 hover:border-pink-500 hover:bg-pink-600 hover:text-white"><Instagram size={18}/></a>
        <a href="https://www.tiktok.com/@satsmedia?_r=1&_t=ZS-9Ax9MqrX44u" target="_blank" rel="noreferrer" aria-label="SATS on TikTok" title="TikTok" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-neutral-300 transition hover:-translate-y-1 hover:border-white hover:bg-white hover:text-black"><Music2 size={18}/></a>
        <a href="https://www.linkedin.com/company/sterling-automobiles-training-school/" target="_blank" rel="noreferrer" aria-label="SATS on LinkedIn" title="LinkedIn" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-neutral-300 transition hover:-translate-y-1 hover:border-sky-500 hover:bg-sky-600 hover:text-white"><Linkedin size={18}/></a>
      </div></div></div></div><div className="mx-auto mt-10 max-w-[1440px] border-t border-white/10 pt-5 text-center text-[10px] text-neutral-500">© {new Date().getFullYear()} Sterling Automobiles Training School. All rights reserved. · TVEC Approved Training Centre</div></footer>

    <a href="https://wa.me/94762259595?text=Hello%20SATS" target="_blank" rel="noreferrer" aria-label="Chat with SATS on WhatsApp at 076 225 9595" title="Chat with SATS on WhatsApp" className="fixed right-4 bottom-[112px] z-[80] grid h-14 w-14 place-items-center rounded-full bg-[#20c968] text-white shadow-[0_6px_18px_rgba(0,0,0,.30),0_0_12px_rgba(32,201,104,.22)] ring-2 ring-white/25 transition duration-300 hover:scale-105 hover:bg-[#19b95c] active:scale-95 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14">
      <span className="relative grid h-9 w-9 place-items-center">
        <MessageCircle size={35} strokeWidth={2.1}/>
        <Phone size={14} strokeWidth={2.8} className="absolute"/>
      </span>
      <span className="sr-only">WhatsApp 076 225 9595</span>
    </a>

    <nav aria-label="Mobile quick navigation" className={'sterling-mobile-nav fixed bottom-3 left-1/2 z-[70] grid w-[94%] max-w-[560px] -translate-x-1/2 grid-cols-5 items-center px-2 py-2 sm:hidden '+(mobileNavScrolled?'is-scrolled':'')} style={{width:mobileNavScrolled?'78%':'94%',maxWidth:mobileNavScrolled?'430px':'560px',minHeight:mobileNavScrolled?'68px':'104px',paddingBottom:'max(8px, env(safe-area-inset-bottom))'}}>
      {[
        {label:'Home',href:'#home',icon:House},
        {label:'Courses',href:'#courses',icon:GraduationCap},
        {label:'Locations',href:'#locations',icon:MapPin},
        {label:'Apply',href:'#apply',icon:FilePenLine},
      ].map(({label,href,icon:Icon})=><a key={label} href={href} onClick={()=>setMobileTab(label)} aria-current={mobileTab===label?'page':undefined} className={'sterling-nav-item flex min-w-0 flex-col items-center justify-center rounded-[24px] py-4 transition-colors '+(mobileTab===label?'is-selected text-white':'text-[#aeb6c5] hover:text-white')}>
        <span className="sterling-nav-icon"><Icon size={28} strokeWidth={mobileTab===label?2.6:2.1} fill={label==='Home'?'currentColor':'none'}/></span>
        <span className="sterling-nav-label text-[11px] font-semibold leading-tight">{label}</span>
      </a>)}
      <button type="button" onClick={()=>{setMobileTab('Login');props.onLogin()}} aria-current={mobileTab==='Login'?'page':undefined} className={'sterling-nav-item flex min-w-0 flex-col items-center justify-center rounded-[24px] py-4 transition-colors '+(mobileTab==='Login'?'is-selected text-white':'text-[#aeb6c5] hover:text-white')}>
        <span className="sterling-nav-icon relative inline-flex"><UserRound size={27} strokeWidth={mobileTab==='Login'?2.6:2.1}/><LockKeyhole size={12} strokeWidth={2.4} className="absolute -bottom-0.5 -right-2 rounded-sm bg-[#17191f]"/></span>
        <span className="sterling-nav-label text-[11px] font-semibold leading-tight">Login</span>
      </button>
    </nav>
    <style>{`
      html { scroll-behavior: smooth; }
      .sterling-mobile-nav {
        isolation: isolate;
        overflow: hidden;
        min-height: 104px;
        border: 1px solid rgba(190,198,220,.2);
        border-radius: 30px;
        transition: width .38s cubic-bezier(.2,.8,.2,1), min-height .38s cubic-bezier(.2,.8,.2,1), padding .38s ease, border-radius .38s ease, background .35s ease, box-shadow .35s ease, border-color .35s ease;
        background: linear-gradient(125deg, rgba(13,17,31,.88), rgba(10,14,27,.82) 55%, rgba(20,19,42,.86));
        box-shadow: 0 14px 42px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.09);
        -webkit-backdrop-filter: blur(30px) saturate(180%);
        backdrop-filter: blur(30px) saturate(180%);
      }
      .sterling-mobile-nav::before {
        content: "";
        position: absolute;
        z-index: -1;
        inset: 0;
        pointer-events: none;
        border-radius: inherit;
        background: linear-gradient(110deg, rgba(255,255,255,.055), transparent 38%, rgba(59,130,246,.12));
      }
      .sterling-mobile-nav.is-scrolled {
        width: 78%;
        max-width: 430px;
        min-height: 68px;
        padding-top: 5px;
        padding-bottom: 5px;
        border-radius: 24px;
        border-color: rgba(205,210,235,.28);
        background: linear-gradient(125deg, rgba(13,17,31,.82), rgba(10,14,27,.76) 55%, rgba(24,20,48,.82));
        box-shadow: 0 17px 48px rgba(0,0,0,.52), inset 0 1px 0 rgba(255,255,255,.12);
      }
      .sterling-nav-item { position: relative; min-height: 86px; -webkit-tap-highlight-color: transparent; transition: min-height .38s ease, padding .38s ease, background .3s ease, color .3s ease; }
      .sterling-mobile-nav.is-scrolled .sterling-nav-item { min-height: 56px; padding-top: 5px; padding-bottom: 5px; border-radius: 17px; }
      .sterling-nav-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transform: scale(1);
        transform-origin: center;
        transition: transform 300ms cubic-bezier(.2,.8,.2,1), filter 300ms ease;
        filter: drop-shadow(0 2px 5px rgba(0,0,0,.28));
      }
      .sterling-nav-item.is-selected {
        background: linear-gradient(145deg, rgba(37,99,235,.38), rgba(30,64,175,.32));
        box-shadow: inset 0 0 0 1px rgba(255,105,105,.24), 0 5px 18px rgba(30,64,175,.22);
      }
      .sterling-nav-item.is-selected .sterling-nav-icon {
        transform: scale(1.12);
        filter: drop-shadow(0 0 8px rgba(255,75,75,.42));
      }
      .sterling-mobile-nav.is-scrolled .sterling-nav-icon { transform: scale(.78); }
      .sterling-mobile-nav.is-scrolled .sterling-nav-item.is-selected .sterling-nav-icon { transform: scale(.9); }
      .sterling-mobile-nav.is-scrolled .sterling-nav-label { font-size: 9px; line-height: 1; }
      .sterling-nav-item:active .sterling-nav-icon { transform: scale(.84) !important; }
      @media (prefers-reduced-motion: reduce) {
        .sterling-mobile-nav, .sterling-nav-item, .sterling-nav-icon, .sterling-nav-label { transition: none !important; }
      }

      .sterling-premium section { scroll-margin-top: 88px; }
      .sterling-premium .sterling-reveal { opacity: 0; transform: translate3d(0,24px,0); transition: opacity 650ms ease, transform 650ms cubic-bezier(.2,.7,.2,1); }
      .sterling-premium .sterling-reveal.is-visible { opacity: 1; transform: translate3d(0,0,0); }
      .sterling-premium img, .sterling-premium video { backface-visibility: hidden; }
      @media (prefers-reduced-motion: reduce) {
        .sterling-premium .sterling-reveal, .sterling-premium .sterling-reveal.is-visible { opacity: 1; transform: none; }
        .sterling-premium *, .sterling-premium *::before, .sterling-premium *::after { scroll-behavior: auto !important; animation: none !important; transition-duration: .01ms !important; }
        .sterling-premium video { display: none !important; }
      }
    `}</style>
  </main>
}
