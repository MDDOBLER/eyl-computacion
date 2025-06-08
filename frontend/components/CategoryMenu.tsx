'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { fetchCategoryTree } from '@/lib/fetchCategories'

type Categoria = {
  id: number
  nombre: string
  subcategorias: {
    id: number
    nombre: string
    subsubcategorias: { id: number; nombre: string }[]
  }[]
}

type Props = {
  selectedCategory: string | null
  onSelectCategory: (name: string | null) => void
}

export default function CategoryMenu({ selectedCategory, onSelectCategory }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaAbierta, setCategoriaAbierta] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await fetchCategoryTree()
        setCategorias(data)
      } catch (e) {
        console.error('❌ Error al cargar categorías desde Supabase:', e)
      }
    }

    cargar()
  }, [])

  const toggleCategoria = (id: number) => {
    setCategoriaAbierta((prev) => (prev === id ? null : id))
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setCategoriaAbierta(null)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={menuRef}
      className="flex flex-wrap gap-6 text-base font-semibold text-gray-800 mb-2"
    >
      {categorias.map((cat) => (
        <div key={cat.id} className="relative">
          <button
            onClick={() => toggleCategoria(cat.id)}
            className="flex items-center gap-1 hover:text-red-600 transition-colors"
          >
            {cat.nombre}
            {categoriaAbierta === cat.id ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>

          {categoriaAbierta === cat.id && (
            <div className="absolute top-full left-0 bg-white shadow-md mt-2 rounded-md z-50 w-48 py-2">
              {cat.subcategorias.map((sub) => (
                <div key={sub.id} className="relative group">
                  {sub.subsubcategorias?.length > 0 ? (
                    <>
                      <div className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                        {sub.nombre}
                      </div>
                      <div className="absolute top-0 left-full bg-white shadow-lg rounded-md w-48 hidden group-hover:block">
                        {sub.subsubcategorias.map((subsub) => (
                          <div
                            key={subsub.id}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onClick={() => onSelectCategory(subsub.nombre)}
                          >
                            {subsub.nombre}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => onSelectCategory(sub.nombre)}
                    >
                      {sub.nombre}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
