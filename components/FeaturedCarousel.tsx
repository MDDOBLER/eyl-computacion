"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  "/images/carrusel1.jpg",
  "/images/carrusel2.jpg",
  "/images/carrusel3.jpg",
];

export default function FeaturedCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (container) {
      const scrollTo = container.scrollWidth * (index / images.length);
      container.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % images.length;
    setActiveIndex(nextIndex);
    scrollToIndex(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + images.length) % images.length;
    setActiveIndex(prevIndex);
    scrollToIndex(prevIndex);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 7000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <div className="w-full relative overflow-hidden mb-6">
      {/* Flechas de navegación */}
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

      <div
        ref={containerRef}
        className="flex justify-center gap-4 overflow-x-auto no-scrollbar px-4 py-2 scroll-smooth"
      >
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Banner ${index + 1}`}
            className={clsx(
              "h-[300px] object-cover transition-transform duration-1000 rounded-xl shadow-lg",
              index === activeIndex ? "scale-105" : "scale-100"
            )}
          />
        ))}
      </div>
    </div>
  );
}
