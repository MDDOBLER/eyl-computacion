"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { scrollToResults } from "@/utils/scrollToResults";

type Props = {
  value: string; // valor controlado desde el padre
  onChange: (v: string) => void; // setea el valor en el padre (solo al confirmar)
  onClear?: () => void; // limpiar filtros externos (cat seleccionada)
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Buscar producto, marca o modelo…",
}: Props) {
  const pathname = usePathname();

  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  // ejecutar búsqueda solo al presionar Enter o botón
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onChange(local.trim());
    scrollToResults(130);
  };

  // limpiar búsqueda → mostrar todos los productos
  const clear = () => {
    setLocal("");
    onChange(""); // 🔥 esto vuelve a mostrar todos los productos automáticamente
    onClear?.();
    // window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasText = local.trim().length > 0;

  // 🔥 nueva lógica: si el usuario borra todo el texto manualmente
  useEffect(() => {
    if (local.trim() === "") {
      onChange(""); // vuelve a mostrar todos los productos
    }
  }, [local, onChange]);

  return (
    <form
      onSubmit={submit}
      className="flex items-center w-full max-w-3xl mx-auto gap-3"
    >
      <Link
        href="/"
        className="shrink-0"
        aria-label="Ir al inicio"
        onClick={(e) => {
          if (pathname === "/") e.preventDefault();
          onChange("");
          onClear?.();
        }}
      >
        <img
          src="/images/logo.png"
          alt="EyL Computación"
          className="h-16 w-auto object-contain"
        />
      </Link>

      <div className="relative flex flex-grow">
        <input
          type="text"
          placeholder={placeholder}
          value={local}
          onChange={(e) => setLocal(e.target.value)} // actualiza local
          onKeyDown={(e) => {
            if (e.key === "Escape") clear();
            // Enter ya lo maneja el submit
          }}
          aria-label="Buscar"
          className="w-full p-2 pl-4 pr-10 rounded border border-gray-300 focus:outline-none"
        />

        {hasText && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-10 top-1/2 -translate-y-1/2"
            aria-label="Limpiar búsqueda"
            title="Limpiar"
          >
            <X size={18} className="text-gray-500" />
          </button>
        )}

        <button
          type="submit"
          aria-label="Buscar"
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <Search size={20} className="text-gray-600" />
        </button>
      </div>
    </form>
  );
}
