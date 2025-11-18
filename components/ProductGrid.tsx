"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

type Props = { products: Product[] };

export default function ProductGrid({ products }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (p: Product) => {
    if (!p?.id) return;

    // Creamos copia editable de los params actuales
    const params = new URLSearchParams(searchParams.toString());
    params.set("producto", String(p.id));

    const qs = params.toString();
    const newUrl = qs ? `/?${qs}` : "/";

    router.push(newUrl, { scroll: false });
  };

  return (
    <div
      id="results"
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 px-2"
    >
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={handleSelect}
          />
        ))
      ) : (
        <p className="text-center col-span-full text-gray-600">
          No se encontraron productos.
        </p>
      )}
    </div>
  );
}
