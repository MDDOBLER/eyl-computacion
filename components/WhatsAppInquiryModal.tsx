"use client";

import { X, MessageCircle } from "lucide-react";
import { useMemo } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  productName: string | null;
};

export default function WhatsAppInquiryModal({
  isOpen,
  onClose,
  productName,
}: Props) {
  const phone = process.env.NEXT_PUBLIC_WA_PHONE || "";
  const message = useMemo(() => {
    const base = `¡Hola! Quiero consultar por el producto: ${
      productName ?? "(sin nombre)"
    }.\n¿Está disponible?`;
    return encodeURIComponent(base);
  }, [productName]);

  const waHref = useMemo(() => {
    if (!phone) return "#";
    return `https://wa.me/${phone}?text=${message}`;
  }, [phone, message]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">Consultar por WhatsApp</h3>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-black/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-700">
          Vas a abrir WhatsApp para consultar por:
        </p>
        <p className="mt-1 rounded-md bg-gray-100 p-2 text-sm font-medium">
          {productName || "Producto"}
        </p>

        {!phone ? (
          <p className="mt-4 text-sm text-red-600">
            Falta configurar <code>NEXT_PUBLIC_WA_PHONE</code>.
          </p>
        ) : (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow hover:shadow-md border border-gray-300"
          >
            <MessageCircle className="h-5 w-5" />
            Abrir WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
