"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ALL_IMAGES = [
  "/images/carrusel1.jpg",
  "/images/carrusel2.jpg",
  "/images/carrusel3.jpg",
  "/images/carrusel4.jpg", // opcional: si no existe, se remueve al vuelo
  "", // vacía: se filtra de entrada
];

const AUTO_MS = 7000;

export default function FeaturedCarousel() {
  // Filtra strings vacíos/null/undefined una sola vez
  const initial = useMemo(
    () => ALL_IMAGES.filter((src) => typeof src === "string" && src.trim()),
    []
  );

  const [images, setImages] = useState<string[]>(initial);
  const [activeIndex, setActiveIndex] = useState(0);

  // slides "ideales" por viewport (1/2/3)
  const baseSlides = useRef(1);
  const [slidesPerView, setSlidesPerView] = useState(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const len = images.length;
  const maxIndex = Math.max(0, len - slidesPerView);

  // ---- Autoplay ----
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
          return next > maxIndex ? 0 : next;
        });
      }, AUTO_MS);
    }
  }
  function stop() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function goTo(i: number) {
    stop();
    const clamped = Math.min(Math.max(i, 0), maxIndex);
    setActiveIndex(clamped);
  }
  function handleNext() {
    goTo(activeIndex + 1 > maxIndex ? 0 : activeIndex + 1);
  }
  function handlePrev() {
    goTo(activeIndex - 1 < 0 ? maxIndex : activeIndex - 1);
  }

  // ---- Responsive: calcula slides por vista ----
  useEffect(() => {
    function calcBase() {
      if (typeof window === "undefined") return 1;
      const w = window.innerWidth;
      if (w >= 1024) return 3;
      if (w >= 768) return 2;
      return 1;
    }
    function apply() {
      baseSlides.current = calcBase();
      const effective = Math.min(baseSlides.current, len || 1);
      setSlidesPerView(effective);
      setActiveIndex((i) => Math.min(i, Math.max(0, len - effective)));
    }

    apply();
    const onResize = () => apply();

    window.addEventListener("resize", onResize);
    const ro = containerRef.current ? new ResizeObserver(apply) : null;
    if (containerRef.current && ro) ro.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", onResize);
      if (ro) ro.disconnect();
    };
  }, [len]);

  if (len === 0) return null;

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
              style={{ width: `${itemWidthPct}%` }}
            >
              {/* Aspect ratio 3:2 (1620x1080) */}
              <div
                className="relative w-full rounded-xl overflow-hidden"
                style={{ paddingBottom: "66.6667%" }}
              >
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                  loading="lazy"
                  onError={() => {
                    setImages((prev) => {
                      const next = prev.filter((_, idx) => idx !== i);
                      // nuevo maxIndex con el array ya filtrado
                      const newMax = Math.max(0, next.length - slidesPerView);
                      setActiveIndex((curr) => Math.min(curr, newMax));
                      return next;
                    });
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Flechas */}
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
