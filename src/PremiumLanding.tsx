import { useState, type FormEvent, type Dispatch, type SetStateAction } from 'react'
import BrandLogo from './BrandLogo'
import {
  ArrowRight, Award, BookOpen, BriefcaseBusiness, CheckCircle2,
  GraduationCap, MapPin, Menu, Monitor, Phone, Play, Settings, House, FilePenLine, UserRound, LockKeyhole,
  ShieldCheck, Users, Wrench, X, Mail, Clock3, BadgeCheck,
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
    { icon: Award, title: 'TVEC Approved', sub: 'Registered Training Centre' },
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
    <div className="border-b border-white/10 bg-black/90 text-[10px] text-neutral-300">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-7">
        <span className="font-semibold tracking-[.16em]">TVEC APPROVED TRAINING CENTRE · REF. P02/0426</span>
        <div className="flex gap-4"><a href="tel:+94117600800" className="hover:text-red-400">+94 11 760 0800</a><a href="mailto:callcenter@sterling.lk" className="hover:text-red-400">callcenter@sterling.lk</a></div>
      </div>
    </div>
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080a0c]/95 shadow-lg shadow-black/20 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-7">
        <a href="#home" aria-label="Sterling LMS home" className="shrink-0 rounded bg-white px-2 py-1"><BrandLogo className="w-36 sm:w-44"/></a>
        <nav className="hidden items-center gap-5 xl:flex">{nav.map(([label, href], i)=><a key={label} href={href} className={`text-[12px] font-bold transition hover:text-red-500 ${i===0?'text-red-500':''}`}>{label}</a>)}</nav>
        <div className="hidden items-center gap-2 sm:flex">
          <button onClick={props.onLogin} className="rounded-lg border border-white/40 px-4 py-2.5 text-[11px] font-bold transition hover:border-red-500 hover:text-red-400"><Users size={14} className="mr-1.5 inline"/>Student Login</button>
          <a href="#apply" className="rounded-lg bg-[#e31b23] px-4 py-2.5 text-[11px] font-black text-white shadow-lg shadow-red-950/40 transition hover:bg-red-700"><GraduationCap size={15} className="mr-1 inline"/>Apply Now</a>
        </div>
        <button className="rounded-lg border border-white/20 p-2 xl:hidden" aria-label="Toggle navigation" onClick={()=>setMobileMenu(v=>!v)}>{mobileMenu?<X size={21}/>:<Menu size={21}/>}</button>
      </div>
      {mobileMenu&&<nav className="grid gap-1 border-t border-white/10 bg-[#111519] p-4 xl:hidden">{nav.map(([label,href])=><a key={label} href={href} onClick={()=>setMobileMenu(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-white/5 hover:text-red-400">{label}</a>)}<button onClick={()=>{setMobileMenu(false);props.onLogin()}} className="mt-2 rounded-lg border border-white/20 px-3 py-3 text-left text-sm font-bold">Student Login</button><a href="#apply" onClick={()=>setMobileMenu(false)} className="rounded-lg bg-red-600 px-3 py-3 text-sm font-bold">Apply Now</a></nav>}
    </header>

    <section id="home" className="relative isolate flex min-h-[590px] items-center overflow-hidden sm:min-h-[650px]">
      {!heroFailed
        ? <video src={heroVideo} autoPlay muted loop playsInline preload="auto" onError={()=>setHeroFailed(true)} aria-label="Sterling automotive workshop hero background" className="absolute inset-0 -z-20 h-full w-full object-cover object-center"/>
        : <img src={heroImage} alt="Automotive technician working in a vehicle workshop" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-center"/>}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/85 to-black/15"/>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#080a0c] via-transparent to-black/20"/>
      
      <div className="mx-auto grid w-full max-w-[1440px] items-center gap-8 px-6 py-20 sm:px-10 lg:grid-cols-[.95fr_1.05fr]">
        <div className="max-w-[690px]">
          <p className="mb-5 text-[10px] font-black uppercase tracking-[.35em] text-red-400 sm:text-xs">Sterling Training Centre</p>
          <h1 className="max-w-[700px] text-4xl font-black italic leading-[.98] tracking-tight sm:text-6xl lg:text-[72px]">BUILD YOUR FUTURE IN THE <span className="text-red-500">AUTOMOTIVE INDUSTRY</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-neutral-200 sm:text-lg">Develop practical technical skills, learn from industry professionals and build a successful career with Sterling.</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#apply" className="rounded-lg bg-[#e31b23] px-6 py-3.5 text-sm font-black shadow-[0_8px_28px_rgba(227,27,35,.25)] transition hover:-translate-y-0.5 hover:bg-red-700">Apply Now <ArrowRight size={16} className="ml-2 inline"/></a>
            <a href="#courses" className="rounded-lg border border-white/60 bg-black/20 px-6 py-3.5 text-sm font-bold transition hover:border-red-500 hover:text-red-400">Explore Courses</a>
            <a href="#about" className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-white hover:text-red-400"><span className="grid h-10 w-10 place-items-center rounded-full border-2 border-white"><Play size={15} fill="currentColor"/></span> Discover Sterling</a>
          </div>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-4 py-2 text-[10px] font-bold tracking-wide text-neutral-200 backdrop-blur"><ShieldCheck size={16} className="text-red-500"/> TVEC Approved Training Centre</div>
        </div>
        <div className="hidden lg:block"/>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent"/>
    </section>

    <section aria-label="Training highlights" className="border-y border-white/10 bg-[#101316]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-white/10 px-4 py-5 sm:grid-cols-4 sm:px-7">{highlights.map(({icon:Icon,title,sub})=><div key={title} className="flex items-center gap-3 px-3 py-2 sm:justify-center"><Icon size={28} className="shrink-0 text-red-500"/><div><b className="block text-[11px] sm:text-sm">{title}</b><span className="mt-1 block text-[9px] text-neutral-400 sm:text-[11px]">{sub}</span></div></div>)}</div>
    </section>

    <section id="courses" className="scroll-mt-24 bg-[radial-gradient(ellipse_at_top,#171b20_0%,#080a0c_65%)] px-4 py-16 sm:px-7 sm:py-20">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.3em] text-red-500">Learn. Practice. Progress.</p><h2 className="mt-2 text-3xl font-black sm:text-4xl"><span className="text-red-600">//</span> Our Training Programs</h2><p className="mt-2 text-sm text-neutral-400">Explore programmes currently published by Sterling Training Centre.</p></div><span className="text-xs font-bold text-red-400">{props.courses.length} published course{props.courses.length===1?'':'s'}</span></div>
        {props.courses.length===0?<div className="rounded-2xl border border-dashed border-white/20 p-10 text-center text-sm text-neutral-400">Course details will appear here when published by the training centre.</div>:<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{props.courses.map((course)=><article key={course.id} className="group overflow-hidden rounded-2xl border border-white/15 bg-[#111519] shadow-[0_12px_34px_rgba(0,0,0,.28)] transition duration-300 hover:-translate-y-1 hover:border-red-600/80 hover:shadow-[0_16px_40px_rgba(227,27,35,.12)]">
          <div className="relative h-48 overflow-hidden"><img src={courseImage(course,props.settings)} alt={course.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110"/><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"/><span className="absolute bottom-3 left-3 rounded-md bg-red-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white">{course.qualification || 'Training Programme'}</span></div>
          <div className="p-5"><h3 className="min-h-[48px] text-base font-extrabold leading-snug">{course.title}</h3><p className="mt-2 line-clamp-3 min-h-[60px] text-xs leading-5 text-neutral-400">{course.description || course.short_description || 'Explore course details and admission information from Sterling Training Centre.'}</p>{(course.duration_months!=null||course.institutional_months!=null||course.on_job_months!=null)&&<div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-500">{course.duration_months!=null&&<span>Duration: {course.duration_months} months</span>}{course.institutional_months!=null&&<span>Institutional: {course.institutional_months} months</span>}{course.on_job_months!=null&&<span>On-the-job: {course.on_job_months} months</span>}</div>}<div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4"><span className="text-[10px] text-neutral-500">{course.course_type==='part_time'?'Part Time':course.course_type==='full_time'?'Full Time':'Course details'}</span><a href="#apply" onClick={()=>props.setApplicationForm((v: any)=>({...v,course_id:course.id}))} className="text-xs font-black text-red-400 transition hover:text-red-300">Apply <ArrowRight size={14} className="ml-1 inline"/></a></div></div>
        </article>)}</div>}
      </div>
    </section>

    <section id="about" className="scroll-mt-24 bg-[#0d1013] px-4 py-16 sm:px-7 sm:py-20">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-[.85fr_1.15fr]">
        <div><p className="text-[10px] font-black uppercase tracking-[.3em] text-red-500">Why choose Sterling</p><h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Train with purpose.<br/><span className="text-red-500">Build your future.</span></h2><p className="mt-5 max-w-lg text-sm leading-7 text-neutral-300">A practical learning environment focused on technical knowledge, hands-on experience and career development.</p><a href="#apply" className="mt-7 inline-flex items-center rounded-lg bg-red-600 px-5 py-3 text-xs font-black hover:bg-red-700">Start Your Application <ArrowRight size={15} className="ml-2"/></a></div>
        <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
          {!headlightFailed
            ? <video className="absolute inset-0 h-full w-full object-cover" src={headlightVideo} autoPlay muted loop playsInline preload="auto" onError={()=>setHeadlightFailed(true)} aria-label="Technician repairing a vehicle headlight"/>
            : <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,#343a40_0%,#111519_48%,#050607_100%)]"><div className="absolute inset-0 bg-gradient-to-r from-black/35 to-transparent"/></div>}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/25 to-transparent"/>
          <span className="absolute bottom-4 left-4 rounded-md border border-white/20 bg-black/65 px-3 py-2 text-[10px] font-bold tracking-wider">PRACTICAL AUTOMOTIVE EXPERIENCE</span>
          <span className="absolute left-0 top-0 h-full w-1.5 bg-red-600"/>
        </div>
      </div>
      <div id="facilities" className="mx-auto mt-14 grid max-w-[1440px] gap-4 sm:grid-cols-2 xl:grid-cols-4">{benefits.map(({icon:Icon,title,sub})=><div key={title} className="flex gap-4 rounded-xl border border-white/10 bg-[#13171b] p-5 transition hover:border-red-600/60"><Icon size={27} className="shrink-0 text-red-500"/><div><h3 className="text-sm font-extrabold">{title}</h3><p className="mt-1 text-xs leading-5 text-neutral-400">{sub}</p></div></div>)}</div>
    </section>

    <section id="lms-features" className="scroll-mt-24 border-y border-white/10 bg-[#111519] px-4 py-14 sm:px-7">
      <div className="mx-auto max-w-[1440px]"><div className="mb-7 text-center"><p className="text-[10px] font-black uppercase tracking-[.3em] text-red-500">Learn beyond the workshop</p><h2 className="mt-2 text-3xl font-black">Sterling LMS Features</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[{icon:BookOpen,title:'Learning Materials',sub:'Access course resources online.'},{icon:Monitor,title:'Online Assessments',sub:'Complete available learning assessments.'},{icon:Clock3,title:'Attendance & Classes',sub:'Review attendance and class information.'},{icon:CheckCircle2,title:'Progress & Payments',sub:'View your learning and payment records.'}].map(({icon:Icon,title,sub})=><button key={title} onClick={props.onLogin} className="rounded-xl border border-white/10 bg-[#0b0e11] p-5 text-left transition hover:-translate-y-1 hover:border-red-600/70"><Icon size={26} className="text-red-500"/><h3 className="mt-4 text-sm font-extrabold">{title}</h3><p className="mt-1 text-xs leading-5 text-neutral-400">{sub}</p><span className="mt-4 inline-block text-[10px] font-black uppercase tracking-wider text-red-400">Student Login <ArrowRight size={13} className="ml-1 inline"/></span></button>)}</div></div>
    </section>

    <section id="locations" className="scroll-mt-24 bg-[#090b0d] px-4 py-16 sm:px-7">
      <div className="mx-auto max-w-[1440px]"><div className="text-center"><p className="text-[10px] font-black uppercase tracking-[.3em] text-red-500">Find a training centre</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Our <span className="text-red-500">Locations</span></h2><p className="mt-3 text-sm text-neutral-400">Explore Sterling's five listed training locations and their official branch information.</p></div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{branches.map((branch,i)=><article key={branch.name} className="group overflow-hidden rounded-xl border border-white/10 bg-[#13171b] transition hover:-translate-y-1 hover:border-red-600/70"><div className="relative h-32 overflow-hidden"><img src={props.settings[branch.imageKey] || [photos.automotive,photos.electrical,photos.headlight,photos.refrigeration,photos.automotive][i]} alt={branch.name+' training centre'} loading="lazy" className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-110 group-hover:opacity-100"/><div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"/></div><div className="p-4"><h3 className="flex items-center gap-2 text-sm font-extrabold"><MapPin size={16} className="text-red-500"/>{branch.name}</h3><p className="mt-2 min-h-[30px] text-[10px] leading-4 text-neutral-400">{branch.address}</p><a href={branch.url} target="_blank" rel="noreferrer" className="mt-3 block text-[10px] font-black text-red-400 hover:text-red-300">Official branch details <ArrowRight size={12} className="ml-1 inline"/></a><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address+', Sri Lanka')}`} target="_blank" rel="noreferrer" className="mt-2 block text-[10px] font-semibold text-neutral-400 hover:text-white">Get directions ↗</a></div></article>)}</div>
        <p className="mx-auto mt-5 max-w-3xl text-center text-[10px] leading-5 text-neutral-500">Branch addresses are taken from Sterling's official branch network. Directions open a Google Maps search for the published address; exact coordinates are not embedded until independently verified.</p>
      </div>
    </section>

    {props.gallery.length>0&&<section id="gallery" className="scroll-mt-24 border-y border-white/10 bg-[#111519] px-4 py-14 sm:px-7"><div className="mx-auto max-w-[1440px]"><div className="mb-7 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.3em] text-red-500">Inside Sterling</p><h2 className="mt-2 text-3xl font-black">Workshop <span className="text-red-500">Gallery</span></h2></div>{props.gallery.length>4&&<div className="flex gap-2"><button aria-label="Previous gallery images" onClick={()=>setGalleryStart(v=>Math.max(0,v-1))} className="rounded-full border border-white/20 px-3 py-2 hover:border-red-500">←</button><button aria-label="Next gallery images" onClick={()=>setGalleryStart(v=>Math.min(props.gallery.length-4,v+1))} className="rounded-full border border-white/20 px-3 py-2 hover:border-red-500">→</button></div>}</div><div className="grid gap-3 grid-cols-2 lg:grid-cols-4">{props.gallery.slice(galleryStart,galleryStart+4).map(item=><figure key={item.id} className="group relative h-44 overflow-hidden rounded-xl bg-black sm:h-56"><img src={`https://sterling-lms-api.texascampus1.workers.dev/public/gallery/${item.id}`} alt={item.title||'Sterling training activity'} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8 text-xs font-bold">{item.title}</figcaption></figure>)}</div></div></section>}

    <section className="relative isolate overflow-hidden border-y border-red-900/60 px-4 py-12 sm:px-7 sm:py-16">
      {!driveFailed
        ? <video className="absolute inset-0 -z-20 h-full w-full object-cover" src={driveVideo} autoPlay muted loop playsInline preload="auto" onError={()=>setDriveFailed(true)} aria-label="Automotive career driving scene"/>
        : <div className="absolute inset-0 -z-20 h-full w-full bg-[radial-gradient(ellipse_at_70%_40%,#343a40_0%,#111519_48%,#050607_100%)]"/>}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 to-black/35"/>
      <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-6 md:flex-row md:items-center"><div><p className="text-[10px] font-black uppercase tracking-[.3em] text-red-400">Your next chapter starts here</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Start Your Automotive Career Today!</h2><p className="mt-3 max-w-2xl text-sm text-neutral-200">Build practical skills and explore technical training opportunities with Sterling.</p></div><div className="flex shrink-0 flex-wrap gap-3"><a href="#apply" className="rounded-lg bg-red-600 px-5 py-3 text-xs font-black hover:bg-red-700">Apply Now <ArrowRight size={14} className="ml-1 inline"/></a><button onClick={props.onLogin} className="rounded-lg border border-white/60 bg-black/30 px-5 py-3 text-xs font-bold hover:border-red-500">Student Login</button></div></div>
    </section>

    <section id="apply" className="scroll-mt-24 bg-[#0d1013] px-4 py-16 sm:px-7">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[.8fr_1.2fr]"><div className="flex flex-col justify-center"><p className="text-[10px] font-black uppercase tracking-[.3em] text-red-500">Admissions</p><h2 className="mt-3 text-4xl font-black">Take the first step toward your <span className="text-red-500">technical career.</span></h2><p className="mt-4 text-sm leading-7 text-neutral-400">Send an application using the existing Sterling admissions form. The training centre will review your details and contact you.</p><div className="mt-7 space-y-3 text-sm"><a href="tel:+94117600800" className="flex items-center gap-3 text-neutral-200 hover:text-red-400"><Phone size={17} className="text-red-500"/>+94 11 760 0800</a><a href="mailto:callcenter@sterling.lk" className="flex items-center gap-3 text-neutral-200 hover:text-red-400"><Mail size={17} className="text-red-500"/>callcenter@sterling.lk</a></div></div>
        <form onSubmit={props.onApplySubmit} className="grid gap-4 rounded-2xl border border-white/10 bg-[#151a1f] p-5 shadow-2xl sm:grid-cols-2 sm:p-7"><div className="sm:col-span-2"><h3 className="text-xl font-black">Enrollment Application</h3><p className="mt-1 text-xs text-neutral-400">Complete the form to apply for a published programme.</p></div>
          {props.applicationNotice&&<p className="sm:col-span-2 rounded-lg border border-emerald-800 bg-emerald-950/50 p-3 text-xs text-emerald-300">{props.applicationNotice}</p>}{props.applicationError&&<p className="sm:col-span-2 rounded-lg border border-red-800 bg-red-950/50 p-3 text-xs text-red-300">{props.applicationError}</p>}
          {([['full_name','Full name','text'],['email','Email address','email'],['phone','Phone number','tel'],['nic','NIC (optional)','text']] as const).map(([key,label,type])=><label key={key} className="text-[11px] font-bold text-neutral-300">{label}<input type={type} required={key!=='nic'} value={props.applicationForm[key]||''} onChange={e=>props.setApplicationForm((v: any)=>({...v,[key]:e.target.value}))} className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#090c0f] px-3 py-3 text-sm text-white outline-none focus:border-red-500"/></label>)}
          <label className="sm:col-span-2 text-[11px] font-bold text-neutral-300">Select course<select required value={props.applicationForm.course_id||''} onChange={e=>props.setApplicationForm((v: any)=>({...v,course_id:e.target.value}))} className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#090c0f] px-3 py-3 text-sm text-white outline-none focus:border-red-500"><option value="">Choose a published course</option>{props.courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
          <label className="sm:col-span-2 text-[11px] font-bold text-neutral-300">Address<input value={props.applicationForm.address||''} onChange={e=>props.setApplicationForm((v: any)=>({...v,address:e.target.value}))} className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#090c0f] px-3 py-3 text-sm text-white outline-none focus:border-red-500"/></label>
          <label className="sm:col-span-2 text-[11px] font-bold text-neutral-300">Previous qualifications<textarea rows={2} value={props.applicationForm.qualifications||''} onChange={e=>props.setApplicationForm((v: any)=>({...v,qualifications:e.target.value}))} className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#090c0f] px-3 py-3 text-sm text-white outline-none focus:border-red-500"/></label>
          <label className="sm:col-span-2 text-[11px] font-bold text-neutral-300">Additional message<textarea rows={2} value={props.applicationForm.message||''} onChange={e=>props.setApplicationForm((v: any)=>({...v,message:e.target.value}))} className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#090c0f] px-3 py-3 text-sm text-white outline-none focus:border-red-500"/></label>
          <button disabled={props.applicationBusy||!props.courses.length} className="sm:col-span-2 rounded-lg bg-red-600 px-5 py-3.5 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-50">{props.applicationBusy?'Submitting application…':'Submit Application'} <ArrowRight size={15} className="ml-2 inline"/></button>
        </form>
      </div>
    </section>

    <section id="contact" className="scroll-mt-24 border-t border-white/10 bg-[#111519] px-4 py-14 sm:px-7"><div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-2"><div><p className="text-[10px] font-black uppercase tracking-[.3em] text-red-500">Contact Sterling</p><h2 className="mt-2 text-3xl font-black">Talk to our team.</h2><p className="mt-3 text-sm leading-6 text-neutral-400">For course details, training locations and admissions enquiries, contact the Sterling team.</p><div className="mt-6 space-y-3 text-sm"><a className="flex items-center gap-3 hover:text-red-400" href="tel:+94117600800"><Phone size={16} className="text-red-500"/>+94 11 760 0800</a><a className="flex items-center gap-3 hover:text-red-400" href="mailto:callcenter@sterling.lk"><Mail size={16} className="text-red-500"/>callcenter@sterling.lk</a><p className="flex items-center gap-3 text-neutral-300"><MapPin size={16} className="text-red-500"/>193, Station Road, Udahamulla, Nugegoda</p><a className="flex items-center gap-3 hover:text-red-400" href="https://www.sterling.lk/" target="_blank" rel="noreferrer"><MapPin size={16} className="text-red-500"/>Official Sterling website</a></div></div>
      <form onSubmit={props.onChatSubmit} className="rounded-2xl border border-white/10 bg-[#0b0e11] p-5"><h3 className="text-lg font-extrabold">Send an enquiry</h3>{props.chatNotice&&<p className="mt-3 rounded-lg bg-emerald-950 p-3 text-xs text-emerald-300">{props.chatNotice}</p>}<div className="mt-4 grid gap-3 sm:grid-cols-2"><input required placeholder="Your name" value={props.chatForm.name} onChange={e=>props.setChatForm((v: any)=>({...v,name:e.target.value}))} className="rounded-lg border border-white/15 bg-[#151a1f] px-3 py-3 text-sm outline-none focus:border-red-500"/><input required type="email" placeholder="Email address" value={props.chatForm.email} onChange={e=>props.setChatForm((v: any)=>({...v,email:e.target.value}))} className="rounded-lg border border-white/15 bg-[#151a1f] px-3 py-3 text-sm outline-none focus:border-red-500"/><textarea required rows={3} placeholder="How can we help?" value={props.chatForm.message} onChange={e=>props.setChatForm((v: any)=>({...v,message:e.target.value}))} className="rounded-lg border border-white/15 bg-[#151a1f] px-3 py-3 text-sm outline-none focus:border-red-500 sm:col-span-2"/><button className="rounded-lg bg-red-600 px-5 py-3 text-xs font-black hover:bg-red-700 sm:col-span-2">Send Enquiry <ArrowRight size={14} className="ml-1 inline"/></button></div></form>
    </div></section>

    <footer className="border-t border-red-900/60 bg-black px-4 pb-7 pt-12 sm:px-7"><div className="mx-auto grid max-w-[1440px] gap-9 sm:grid-cols-2 lg:grid-cols-4"><div><div className="inline-block rounded bg-white p-2"><BrandLogo className="w-44"/></div><p className="mt-4 max-w-xs text-xs leading-6 text-neutral-400">Sterling Training Centre — practical technical training and learning support.</p></div><div><h3 className="text-xs font-black uppercase tracking-wider">Quick Links</h3><div className="mt-4 grid gap-3 text-xs text-neutral-400">{nav.map(([label,href])=><a key={label} href={href} className="hover:text-red-400">{label}</a>)}</div></div><div><h3 className="text-xs font-black uppercase tracking-wider">Student LMS</h3><div className="mt-4 grid gap-3 text-xs text-neutral-400"><button onClick={props.onLogin} className="text-left hover:text-red-400">Student Login</button><a href="#courses" className="hover:text-red-400">Training Programmes</a><a href="#apply" className="hover:text-red-400">Apply Online</a><a href="#locations" className="hover:text-red-400">Training Locations</a></div></div><div><h3 className="text-xs font-black uppercase tracking-wider">Contact Us</h3><div className="mt-4 grid gap-3 text-xs text-neutral-400"><a href="tel:+94117600800">+94 11 760 0800</a><a href="mailto:callcenter@sterling.lk">callcenter@sterling.lk</a><a href="https://www.sterling.lk/" target="_blank" rel="noreferrer">www.sterling.lk</a><div className="flex gap-3 pt-1 text-white"></div></div></div></div><div className="mx-auto mt-10 max-w-[1440px] border-t border-white/10 pt-5 text-center text-[10px] text-neutral-500">© {new Date().getFullYear()} Sterling Training Centre. All rights reserved. · TVEC Approved Training Centre</div></footer>

    <nav aria-label="Mobile quick navigation" className="fixed inset-x-0 bottom-0 z-[70] grid grid-cols-5 border-t-2 border-[#e31b23]/70 bg-[#080a0c]/[.97] px-1 pt-2 shadow-[0_-8px_30px_rgba(227,27,35,.12)] backdrop-blur-xl sm:hidden" style={{paddingBottom:'max(9px, env(safe-area-inset-bottom))'}}>
      {[
        {label:'Home',href:'#home',icon:House},
        {label:'Courses',href:'#courses',icon:GraduationCap},
        {label:'Locations',href:'#locations',icon:MapPin},
        {label:'Apply',href:'#apply',icon:FilePenLine},
      ].map(({label,href,icon:Icon})=><a key={label} href={href} onClick={()=>setMobileTab(label)} aria-current={mobileTab===label?'page':undefined} className={'flex min-w-0 flex-col items-center justify-center gap-1 py-1.5 transition-colors '+(mobileTab===label?'text-[#e31b23]':'text-[#aeb4bf] hover:text-white')}>
        <Icon size={28} strokeWidth={mobileTab===label?2.6:2.1} fill={label==='Home'?'currentColor':'none'}/>
        <span className="text-[11px] font-semibold leading-tight">{label}</span>
      </a>)}
      <button type="button" onClick={()=>{setMobileTab('Login');props.onLogin()}} aria-current={mobileTab==='Login'?'page':undefined} className={'flex min-w-0 flex-col items-center justify-center gap-1 py-1.5 transition-colors '+(mobileTab==='Login'?'text-[#e31b23]':'text-[#aeb4bf] hover:text-white')}>
        <span className="relative inline-flex"><UserRound size={27} strokeWidth={mobileTab==='Login'?2.6:2.1}/><LockKeyhole size={12} strokeWidth={2.4} className="absolute -bottom-0.5 -right-2 rounded-sm bg-[#080a0c]"/></span>
        <span className="text-[11px] font-semibold leading-tight">Login</span>
      </button>
    </nav>
    <style>{`
      html { scroll-behavior: smooth; }
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
