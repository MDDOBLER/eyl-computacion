'use client';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full bg-white relative z-10"> {/* z-10 para no tapar el menú */}
      <div className="w-full overflow-hidden">
        <Image
          src="/images/header_image.png"
          alt="Encabezado"
          width={1920}
          height={600}
          className="w-full h-auto object-contain"
          priority
        />
      </div>
    </header>
  );
}
