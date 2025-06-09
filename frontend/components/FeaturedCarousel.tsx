'use client'

import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

const images = [
  '/images/carrusel1.jpg',
  '/images/carrusel2.jpg',
  '/images/carrusel3.jpg',
]

export default function FeaturedCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % images.length
      setActiveIndex(nextIndex)

      const container = containerRef.current
      if (container) {
        const scrollTo = container.scrollWidth * (nextIndex / images.length)
        container.scrollTo({ left: scrollTo, behavior: 'smooth' })
      }
    }, 7000)

    return () => clearInterval(interval)
  }, [activeIndex])

  return (
    <div className="w-full overflow-hidden mb-6">
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
              'h-[300px] object-cover transition-transform duration-1000 rounded-xl shadow-lg',
              index === activeIndex ? 'scale-105' : 'scale-100'
            )}
          />
        ))}
      </div>
    </div>
  )
}
