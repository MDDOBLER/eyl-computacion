'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { fetchCategoryTree } from '@/lib/fetchCategories';

type Categoria = {
  id: number;
  nombre: string;
  subcategorias: {
    id: number;
    nombre: string;
    subsubcategorias: { id: number; nombre: string }[];
  }[];
};

type Props = {
  selectedCategory: string | null;
  onSelectCategory: (name: string | null) => void;
};

export default function CategoryMenu({ selectedCategory, onSelectCategory }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaAbierta, setCategoriaAbierta] = useState<number | null>(null);
  const [abrirIzquierda, setAbrirIzquierda] = useState<{ [key: number]: boolean }>({});
  const menuRef = useRef<HTMLDivElement>(null);
  const subRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await fetchCategoryTree();
        setCategorias(data);
      } catch (e) {
        console.error('❌ Error al cargar categorías desde Supabase:', e);
      }
    };
    cargar();
  }, []);

  const toggleCategoria = (id: number) => {
    setCategoriaAbierta((prev) => (prev === id ? null : id));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setCategoriaAbierta(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubHover = (id: number) => {
    const ref = subRefs.current.get(id);
    if (!ref) return;
    const rect = ref.getBoundingClientRect();
    const spaceRight = window.innerWidth - rect.right;
    setAbrirIzquierda((prev) => ({ ...prev, [id]: spaceRight < 250 }));
  };

  return (
    <div
      ref={menuRef}
      className="relative flex gap-6 text-sm font-semibold text-white mb-2 z-[9999] bg-red-600 p-2"
    >
      {categorias.map((cat) => (
        <div key={cat.id} className="relative px-1">
          <button
            onClick={() => toggleCategoria(cat.id)}
            className="flex items-center gap-1 text-white font-semibold whitespace-nowrap hover:underline"
          >
            {cat.nombre}
            {categoriaAbierta === cat.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {categoriaAbierta === cat.id && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-red-600 py-2 z-[9999] text-white">
              {cat.subcategorias.map((sub) => (
                <div
                  key={sub.id}
                  className="relative group"
                  ref={(el) => {
                    if (el) subRefs.current.set(sub.id, el);
                  }}
                  onMouseEnter={() => handleSubHover(sub.id)}
                >
                  {sub.subsubcategorias.length > 0 ? (
                    <>
                      <div className="px-4 py-2 cursor-pointer">
                        {sub.nombre}
                      </div>
                      <div
                        className={`absolute top-0 ${
                          abrirIzquierda[sub.id] ? 'right-full' : 'left-full'
                        } bg-red-600 w-48 hidden group-hover:block z-[9999] text-white`}
                      >
                        {sub.subsubcategorias.map((subsub) => (
                          <div
                            key={subsub.id}
                            className="px-4 py-2 cursor-pointer"
                            onClick={() => onSelectCategory(subsub.nombre)}
                          >
                            {subsub.nombre}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div
                      className="px-4 py-2 cursor-pointer"
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
  );
}

