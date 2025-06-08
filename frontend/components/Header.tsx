'use client'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="w-full bg-white py-2 relative">
      <Image
        src="/images/header_image.png"
        alt="Encabezado"
        width={1920}
        height={600}
        className="w-full h-auto object-contain"
        priority
      />
    </header>
  )
}
