"use client";

export default function PromoTicker() {
  const text =
    "3 cuotas sin interés los días miércoles y sábados. Para Visa y Master de todos los Bancos (Vigente del 24/10 al 30/11)";

  return (
    <div className="w-full bg-[#7b001c] text-white text-sm sm:text-base overflow-hidden">
      {/* Track: dos mitades idénticas para loop perfecto */}
      <div className="marquee flex">
        <div className="marquee-half flex shrink-0 items-center">
          <span className="px-6 py-1 sm:py-2 whitespace-nowrap">{text}</span>
          <span className="px-6 py-1 sm:py-2 whitespace-nowrap">{text}</span>
        </div>
        <div
          className="marquee-half flex shrink-0 items-center"
          aria-hidden="true"
        >
          <span className="px-6 py-1 sm:py-2 whitespace-nowrap">{text}</span>
          <span className="px-6 py-1 sm:py-2 whitespace-nowrap">{text}</span>
        </div>
      </div>

      <style jsx>{`
        /* Contenedor animado */
        .marquee {
          --duration: 20s; /* ajustá velocidad aquí */
        }
        /* Cada mitad ocupa el 100% del ancho visible */
        .marquee-half {
          min-width: 100%;
          animation: scroll var(--duration) linear infinite;
        }
        /* Pausa al hover para leer tranquilo */
        .marquee:hover .marquee-half {
          animation-play-state: paused;
        }
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
