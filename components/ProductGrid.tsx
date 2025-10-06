"use client";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import WhatsAppInquiryModal from "@/components/WhatsAppInquiryModal";

type Props = { products: Product[] };

export default function ProductGrid({ products }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const handleSelect = (p: Product) => {
    setSelectedName(p.name ?? null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedName(null);
  };

  return (
    <>
      <div
        id="results" // 👈 ancla para scrollToResults()
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

      <WhatsAppInquiryModal
        isOpen={modalOpen}
        onClose={closeModal}
        productName={selectedName}
      />
    </>
  );
}
