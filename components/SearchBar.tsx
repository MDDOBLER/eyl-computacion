"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

type Props = {
  value: string; // valor controlado desde el padre
  onChange: (v: string) => void; // setea el valor en el padre (debounced)
  onClear?: () => void; // limpiar filtros externos (cat seleccionada)
  placeholder?: string;
  debounceMs?: number; // default 300ms
};

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Buscar producto, marca o modelo…",
  debounceMs = 300,
}: Props) {
  const pathname = usePathname();

  // estado local para el input (para debounce)
  const [local, setLocal] = useState(value);

  // sincroniza si el padre cambia el valor
  useEffect(() => setLocal(value), [value]);

  // debounce: emite al padre sin recargar ni limpiar solo
  useEffect(() => {
    const t = setTimeout(() => onChange(local.trim()), debounceMs);
    return () => clearTimeout(t);
  }, [local, debounceMs, onChange]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault(); // evita recarga
    onChange(local.trim());
  };

  const clear = () => {
    setLocal("");
    onChange("");
    onClear?.();
  };

  const hasText = local.trim().length > 0;

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
          // si ya estamos en Home, no navegamos; solo limpiamos
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
          onChange={(e) => setLocal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") clear();
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
