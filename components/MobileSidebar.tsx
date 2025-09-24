"use client";

import { useEffect, useState } from "react";
import { fetchCategoryTree } from "@/lib/fetchCategories";
import { X, ChevronRight, ChevronDown } from "lucide-react";

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
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (name: string) => void;
};

export default function MobileSidebar({
  isOpen,
  onClose,
  onSelectCategory,
}: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaAbierta, setCategoriaAbierta] = useState<number | null>(null);
  const [subAbierta, setSubAbierta] = useState<number | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await fetchCategoryTree();
        setCategorias(data);
      } catch (e) {
        console.error("❌ Error al cargar categorías:", e);
      }
    };
    cargar();
  }, []);

  const toggleCategoria = (id: number) => {
    setCategoriaAbierta((prev) => (prev === id ? null : id));
    setSubAbierta(null);
  };

  const toggleSub = (id: number) => {
    setSubAbierta((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] md:hidden transition-opacity duration-300 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop con blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`absolute top-0 left-0 h-full w-4/5 max-w-xs transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          bg-red-600/90 backdrop-blur-md rounded-r-2xl shadow-2xl flex flex-col`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 pt-5 pb-3 border-b border-white/20">
          <h2 className="text-lg font-bold text-white">Categorías</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            <X size={22} className="text-white" />
          </button>
        </div>

        {/* Lista de categorías */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-none">
          {categorias.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => toggleCategoria(cat.id)}
                className="w-full flex justify-between items-center text-left font-semibold py-2 px-3 rounded-lg
                           text-white/90 hover:bg-white/10 transition"
              >
                {cat.nombre}
                {categoriaAbierta === cat.id ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>

              {categoriaAbierta === cat.id && (
                <div className="ml-3 mt-1 space-y-1">
                  {cat.subcategorias.map((sub) => (
                    <div key={sub.id}>
                      <button
                        onClick={() => toggleSub(sub.id)}
                        className="w-full flex justify-between items-center text-left py-1.5 px-3 rounded-md
                                   text-white/80 hover:bg-white/10 transition"
                      >
                        {sub.nombre}
                        {subAbierta === sub.id ? (
                          <ChevronDown size={16} />
                        ) : (
                          sub.subsubcategorias.length > 0 && (
                            <ChevronRight size={16} />
                          )
                        )}
                      </button>

                      {subAbierta === sub.id && (
                        <>
                          {sub.subsubcategorias.length > 0 ? (
                            <div className="ml-4 mt-1 space-y-1">
                              {sub.subsubcategorias.map((subsub) => (
                                <button
                                  key={subsub.id}
                                  onClick={() => {
                                    onSelectCategory(subsub.nombre);
                                    onClose();
                                  }}
                                  className="block w-full text-left py-1 px-3 rounded-md
                                             text-white/70 hover:bg-white/20 transition"
                                >
                                  {subsub.nombre}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                onSelectCategory(sub.nombre);
                                onClose();
                              }}
                              className="block w-full text-left py-1 px-3 rounded-md
                                         text-white/70 hover:bg-white/20 transition ml-4"
                            >
                              Ver todo
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
