"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ALL_IMAGES = [
  "/images/carrusel1.jpg",
  "/images/carrusel2.jpg",
  "/images/carrusel3.jpg",
  "/images/carrusel4.jpg", // si no existe, se oculta automáticamente
  "", // vacía: se filtra de entrada
];

const AUTO_MS = 7000;

export default function FeaturedCarousel() {
  // Filtra strings vacíos / null / undefined
  const initial = useMemo(
    () =>
      ALL_IMAGES.filter(
        (src) => typeof src === "string" && src.trim().length > 0
      ),
    []
  );

  const [images, setImages] = useState<string[]>(initial);
  const [activeIndex, setActiveIndex] = useState(0);

  // slides "ideales" por viewport (1/2/3)
  const baseSlides = useRef(1);
  // slides efectivos (nunca mayor a images.length)
  const [slidesPerView, setSlidesPerView] = useState(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const len = images.length;
  const maxIndex = Math.max(0, len - slidesPerView);

  // ---- Helpers de autoplay ----
  useEffect(() => {
    if (len <= 1) return;
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, len, slidesPerView]);

  function start() {
    stop();
    if (len > 1) {
      timerRef.current = setTimeout(() => {
        setActiveIndex((i) => {
          const next = i + 1;
          return next > maxIndex ? 0 : next; // nunca deja huecos al final
        });
      }, AUTO_MS);
    }
  }
  function stop() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function goTo(i: number) {
    stop();
    // clamp al rango válido (evita “huecos”)
    const clamped = Math.min(Math.max(i, 0), maxIndex);
    setActiveIndex(clamped);
  }
  function handleNext() {
    goTo(activeIndex + 1 > maxIndex ? 0 : activeIndex + 1);
  }
  function handlePrev() {
    goTo(activeIndex - 1 < 0 ? maxIndex : activeIndex - 1);
  }

  // ---- Cálculo de slides por vista (responsive) ----
  useEffect(() => {
    function calcBase() {
      if (typeof window === "undefined") return 1;
      const w = window.innerWidth;
      if (w >= 1024) return 3; // desktop
      if (w >= 768) return 2; // tablet
      return 1; // mobile
    }
    function apply() {
      baseSlides.current = calcBase();
      // nunca mostrar más slots que imágenes disponibles
      const effective = Math.min(baseSlides.current, len || 1);
      setSlidesPerView(effective);
      // si el índice quedó fuera de rango, se corrige
      setActiveIndex((i) => Math.min(i, Math.max(0, len - effective)));
    }

    apply();
    const onResize = () => apply();

    window.addEventListener("resize", onResize);
    const ro = containerRef.current ? new ResizeObserver(apply) : null;
    if (containerRef.current && ro) ro.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", onResize);
      if (ro && containerRef.current) ro.unobserve(containerRef.current);
    };
  }, [len]);

  // ---- Si una imagen falla (404), la removemos) ----
  function handleImgError(idx: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next;
    });
  }

  if (len === 0) return null;

  // ancho dinámico por tarjeta (sin huecos aunque haya 1 o 2 imágenes)
  const itemWidthPct = 100 / slidesPerView;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden mb-6 select-none"
      onMouseEnter={stop}
      onMouseLeave={start}
      onTouchStart={stop}
      onTouchEnd={start}
    >
      <div className="relative w-full mx-auto rounded-xl overflow-hidden shadow-lg">
        {/* Track */}
        <div
          className="flex gap-4 md:gap-6 transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${activeIndex * (100 / slidesPerView)}%)`,
          }}
        >
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="flex-shrink-0"
              style={{ width: `${itemWidthPct}%` }} // ocupa siempre el ancho justo
            >
              <img
                src={src}
                alt=""
                className="
                  w-full 
                  h-[240px] sm:h-[260px] md:h-[300px] lg:h-[320px] xl:h-[340px]
                  object-cover object-center rounded-xl
                "
                draggable={false}
                loading="lazy"
                onError={() => handleImgError(i)}
              />
            </div>
          ))}
        </div>

        {/* Flechas: solo si hay más imágenes que slots visibles */}
        {len > slidesPerView && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
              aria-label="Anterior"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
              aria-label="Siguiente"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Dots */}
        {len > slidesPerView && (
          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={`dot-${i}`}
                aria-label={`Ir al slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === activeIndex ? "w-5 bg-white" : "w-2 bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
