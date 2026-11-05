export default function BrandLogo({className=''}:{className?:string}) {
  const logoSrc = `${import.meta.env.BASE_URL}sterling-company-logo.webp`
  return <div className={'flex items-center '+className}>
    <img
      src={logoSrc}
      alt="SATS Sterling Automobiles Training School"
      className="block h-auto w-full object-contain"
      loading="eager"
      decoding="async"
    />
  </div>
}
