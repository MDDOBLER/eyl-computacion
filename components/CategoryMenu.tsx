"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { fetchCategoryTree } from "@/lib/fetchCategories";
import { scrollToResults } from "@/utils/scrollToResults"; // 👈 nuevo

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

export default function CategoryMenu({ onSelectCategory }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaAbierta, setCategoriaAbierta] = useState<number | null>(null);
  const [abrirIzquierda, setAbrirIzquierda] = useState<Record<number, boolean>>(
    {}
  );

  const menuWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCategoryTree();
        setCategorias(data);
      } catch (e) {
        console.error("❌ Error al cargar categorías desde Supabase:", e);
      }
    })();
  }, []);

  // Cerrar dropdown al click afuera
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!menuWrapRef.current?.contains(e.target as Node)) {
        setCategoriaAbierta(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleSubHover = (id: number, el: HTMLDivElement | null) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceRight = window.innerWidth - rect.right;
    setAbrirIzquierda((prev) => ({ ...prev, [id]: spaceRight < 260 }));
  };

  // 👇 seleccionar + cerrar + scrollear (con delay para mobile)
  const handleSelectAndScroll = (name: string) => {
    onSelectCategory(name);
    setCategoriaAbierta(null);

    // Pequeño delay para que los productos se rendericen antes de scrollear
    setTimeout(() => {
      scrollToResults(150); // ajustá offset según el alto del header
    }, 400);
  };

  return (
    <div className="w-full text-white">
      <div
        ref={menuWrapRef}
        className="relative w-full max-w-[1400px] mx-auto px-4 overflow-visible z-[60]"
      >
        <ul
          className="
            list-none flex flex-wrap justify-center items-center
            gap-x-2 gap-y-1 overflow-visible
          "
        >
          {categorias.map((cat) => (
            <li key={cat.id} className="relative shrink-0">
              <button
                onClick={() =>
                  setCategoriaAbierta((prev) =>
                    prev === cat.id ? null : cat.id
                  )
                }
                className="
                  inline-flex items-center justify-center gap-1
                  px-2 py-1.5 rounded-md text-sm font-semibold
                  whitespace-nowrap bg-red-500/20 text-white
                  hover:bg-red-500/30 transition-colors
                "
                aria-expanded={categoriaAbierta === cat.id}
                aria-haspopup="true"
              >
                {cat.nombre}
                {categoriaAbierta === cat.id ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>

              {categoriaAbierta === cat.id && (
                <div
                  className="
                    absolute left-0 top-[calc(100%+6px)]
                    w-56 bg-red-600 text-white rounded-md shadow-lg py-2
                    z-[9999]
                  "
                >
                  {cat.subcategorias.map((sub) => (
                    <div
                      key={sub.id}
                      className="relative group"
                      onMouseEnter={(e) =>
                        handleSubHover(
                          sub.id,
                          e.currentTarget as unknown as HTMLDivElement
                        )
                      }
                    >
                      {sub.subsubcategorias.length > 0 ? (
                        <>
                          <div className="px-4 py-2 cursor-pointer hover:bg-red-500/30">
                            {sub.nombre}
                          </div>
                          <div
                            className={[
                              "absolute top-0 hidden group-hover:block w-56 bg-red-600 text-white rounded-md shadow-lg py-2",
                              abrirIzquierda[sub.id]
                                ? "right-full pr-2"
                                : "left-full pl-2",
                            ].join(" ")}
                          >
                            {sub.subsubcategorias.map((subsub) => (
                              <div
                                key={subsub.id}
                                className="px-4 py-2 cursor-pointer hover:bg-red-500/30"
                                onClick={() =>
                                  handleSelectAndScroll(subsub.nombre)
                                } // 👈
                              >
                                {subsub.nombre}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div
                          className="px-4 py-2 cursor-pointer hover:bg-red-500/30"
                          onClick={() => handleSelectAndScroll(sub.nombre)} // 👈
                        >
                          {sub.nombre}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
