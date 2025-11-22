// frontend/components/ProductCard.tsx
"use client";

import { Product } from "@/types";

type Props = {
  product: Product;
  onSelect?: (p: Product) => void; // callback cuando se hace click en la card
};

export default function ProductCard({ product, onSelect }: Props) {
  const imagenSrc =
    product.image && product.image.trim() !== ""
      ? product.image
      : "/images/no-imagen.png";

  const handleCardClick = () => {
    onSelect?.(product); // abre modal + actualiza URL
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white shadow rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-transform transition-shadow"
    >
      {/* Imagen */}
      <img
        src={imagenSrc}
        alt={product.name}
        className="w-32 h-32 object-contain rounded-xl mb-3 bg-gray-100"
      />

      {/* Nombre */}
      <h2 className="text-lg font-semibold line-clamp-2">{product.name}</h2>

      {/* Categorías */}
      <p className="text-sm text-gray-500">
        {product.category}
        {product.subcategory && ` - ${product.subcategory}`}
      </p>

      {/* ⚠️ Descripción REMOVIDA */}
      {/*
      {product.descripcion && (
        <p className="text-sm text-gray-700 mt-2 line-clamp-3">
          {product.descripcion}
        </p>
      )}
      */}

      {/* Precio */}
      <p className="mt-2 text-green-600 font-bold">{product.price}</p>

      {/* Más info (NO abre modal) */}
      {product.masinfo && (
        <a
          href={product.masinfo}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()} // evita abrir modal
          className="mt-3 text-blue-600 text-sm font-medium hover:underline"
        >
          Más Info
        </a>
      )}
    </div>
  );
}
