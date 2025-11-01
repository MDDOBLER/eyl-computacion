"use client";

import Image from "next/image";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/542323681800"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[9999] transition-transform duration-300 hover:scale-110"
      aria-label="Contactar por WhatsApp"
    >
      <Image
        src="/images/whatsapp.v2.png" // 👈 nueva versión del ícono
        alt="WhatsApp"
        width={64}
        height={64}
        priority // 👈 se carga apenas abre la página
        className="rounded-full shadow-xl"
      />
    </a>
  );
}
