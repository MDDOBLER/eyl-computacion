'use client'

import { useEffect, useState } from 'react'

const images = [
  '/images/carrusel1.jpg',
  '/images/carrusel2.jpg',
  '/images/carrusel3.jpg',
]

export default function FeaturedCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 7000) // 

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full overflow-hidden mb-5">
      <img
        src={images[index]}
        alt={`Banner ${index + 1}`}
        className="w-full h-[300px] object-cover transition-all duration-500"
      />
    </div>
  )
}
