"use client";

export default function PromoTicker() {
  const text =
    "Todos los jueves 20 % de ahorro pagando con tarjetas Galicia Visa y Master (Aplica al precio de lista. Tope de reintegro $10.000 por mes)";

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
