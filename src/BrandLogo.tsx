export default function BrandLogo({className=''}:{className?:string}) {
  return <div className={'flex items-center '+className}>
    <svg viewBox="0 0 520 190" role="img" aria-label="Sterling After Care Guarantee" className="h-auto w-full max-w-[260px]">
      <rect x="3" y="3" width="514" height="184" rx="18" fill="#fff" stroke="#17256f" strokeWidth="5"/>
      <path d="M16 16 H504 V112 H16 Z" rx="12" fill="#fff" stroke="#17256f" strokeWidth="5"/>
      <text x="260" y="94" textAnchor="middle" fontFamily="Impact, 'Arial Narrow', sans-serif" fontSize="88" fontWeight="1000" letterSpacing="-3" fill="#17256f" stroke="#fff" strokeWidth="5" paintOrder="stroke">STERLING</text>
      <path d="M45 105 Q55 94 75 94 H445 Q465 94 475 105 L493 143 Q498 158 482 162 H38 Q22 158 27 143 Z" fill="#ed1c24" stroke="#f8d34b" strokeWidth="5"/>
      <text x="260" y="145" textAnchor="middle" fontFamily="Impact, 'Arial Black', sans-serif" fontSize="42" fontStyle="italic" fontWeight="900" fill="#ffd21a" stroke="#8c1018" strokeWidth="1.5" paintOrder="stroke">AFTER CARE</text>
      <rect x="14" y="158" width="492" height="27" rx="7" fill="#ffc629" stroke="#f3a900" strokeWidth="2"/>
      <text x="260" y="181" textAnchor="middle" fontFamily="Impact, 'Arial Narrow', sans-serif" fontSize="30" fontWeight="1000" letterSpacing="1" fill="#170d05">GUARANTEE</text>
    </svg>
  </div>
}