export default function BrandLogo({className=''}:{className?:string}) {
  const logoSrc = `${import.meta.env.BASE_URL}sterling-company-logo.webp?v=20261105`
  return <div className={'flex items-center '+className}>
    <img
      src={logoSrc}
      alt="SATS Sterling Automobiles Training School"
      className="block h-auto w-full max-w-[220px] object-contain"
      loading="eager"
      decoding="async"
    />
  </div>
}
