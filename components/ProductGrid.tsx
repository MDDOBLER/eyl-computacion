"use client";

import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

type Props = {
  products: Product[];
};

export default function ProductGrid({ products }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 px-2">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      ) : (
        <p className="text-center col-span-full text-gray-600">
          No se encontraron productos.
        </p>
      )}
    </div>
  );
}
