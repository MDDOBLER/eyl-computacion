// frontend/components/ProductCard.tsx
import { Product } from '@/types';

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const imagenSrc =
    product.image && product.image.trim() !== ''
      ? product.image
      : '/images/no-imagen.png';

  return (
    <div className="bg-white shadow rounded-2xl p-4 flex flex-col items-center text-center">
      <img
        src={imagenSrc}
        alt={product.name}
        className="w-32 h-32 object-contain rounded-xl mb-3 bg-gray-100"
      />
      <h2 className="text-lg font-semibold">{product.name}</h2>
      <p className="text-sm text-gray-500">
        {product.category} - {product.subcategory}
      </p>

      {/* Descripción opcional */}
      {product.descripcion && (
        <p className="text-sm text-gray-700 mt-2">{product.descripcion}</p>
      )}

      <p className="mt-2 text-green-600 font-bold">{product.price}</p>

      {/* Enlace opcional */}
      {product.masinfo && (
        <a
          href={product.masinfo}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-blue-600 text-sm font-medium hover:underline"
        >
          Más Info
        </a>
      )}
    </div>
  );
}



  