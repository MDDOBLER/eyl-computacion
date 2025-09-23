"use client";

import { useEffect, useState } from "react";
import { fetchCategoryTree } from "@/lib/fetchCategories";
import { X } from "lucide-react";

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
      className={`fixed top-0 left-0 h-full w-4/5 max-w-xs bg-red-600 text-white z-[9999] p-4 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Categorías</h2>
        <button onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {categorias.map((cat) => (
          <div key={cat.id}>
            <button
              onClick={() => toggleCategoria(cat.id)}
              className="w-full text-left font-semibold py-2 px-2 hover:bg-red-700 rounded"
            >
              {cat.nombre}
            </button>

            {categoriaAbierta === cat.id && (
              <div className="ml-4">
                {cat.subcategorias.map((sub) => (
                  <div key={sub.id}>
                    <button
                      onClick={() => toggleSub(sub.id)}
                      className="w-full text-left py-1 px-2 hover:bg-red-700 rounded"
                    >
                      {sub.nombre}
                    </button>

                    {subAbierta === sub.id &&
                      sub.subsubcategorias.length > 0 && (
                        <div className="ml-4">
                          {sub.subsubcategorias.map((subsub) => (
                            <button
                              key={subsub.id}
                              onClick={() => {
                                onSelectCategory(subsub.nombre);
                                onClose();
                              }}
                              className="block w-full text-left py-1 px-2 hover:bg-red-800 rounded"
                            >
                              {subsub.nombre}
                            </button>
                          ))}
                        </div>
                      )}

                    {subAbierta === sub.id &&
                      sub.subsubcategorias.length === 0 && (
                        <button
                          onClick={() => {
                            onSelectCategory(sub.nombre);
                            onClose();
                          }}
                          className="block w-full text-left py-1 px-2 hover:bg-red-800 rounded ml-4"
                        >
                          Ver todo
                        </button>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
