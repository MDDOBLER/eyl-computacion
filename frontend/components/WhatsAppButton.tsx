'use client'

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/542323681800"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[9999]"
    >
      <img
        src="/images/whatsapp.png"
        alt="WhatsApp"
        className="w-16 h-16 rounded-full shadow-xl hover:scale-110 transition-transform duration-300"
      />
    </a>
  );
}

