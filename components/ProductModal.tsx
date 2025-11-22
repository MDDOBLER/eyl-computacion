"use client";

type ProductModalProps = {
  product: any;
  isOpen: boolean;
  onClose: () => void;
};

export default function ProductModal({
  product,
  isOpen,
  onClose,
}: ProductModalProps) {
  if (!isOpen || !product) return null;

  // ✅ Fix: evitar error en server-side
  const productUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/producto/${product.id}`
      : "";

  const whatsappMessage =
    `Hola! Estoy interesado en este producto 👇\n\n` +
    `*${product.name}*\n\n` +
    `Link: ${productUrl}`;

  const whatsappUrl = `https://wa.me/542323681800?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar detalle del producto"
        onClick={onClose}
      />

      <div className="relative z-[10001] w-[92%] max-w-md rounded-2xl bg-white p-4 shadow-2xl sm:w-full sm:p-6">
        <button
          className="absolute right-3 top-3 rounded-full bg-gray-100 px-2 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-200"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Imagen */}
        <div className="mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-gray-200">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Datos */}
        <h2 className="mb-1 text-xl font-bold text-gray-900">{product.name}</h2>
        <p className="mb-3 text-lg font-semibold text-red-600">
          {product.price}
        </p>

        {product.descripcion && (
          <p className="mb-3 text-sm text-gray-700">{product.descripcion}</p>
        )}

        {product.masinfo && (
          <a
            href={product.masinfo}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 inline-block text-sm text-blue-600 underline hover:text-blue-700"
          >
            Más info del fabricante
          </a>
        )}

        {/* Botones */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 sm:w-auto"
          >
            Cerrar
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl bg-green-600 px-4 py-2 text-center text-sm font-semibold text-white shadow hover:bg-green-700"
          >
            Consultar por WhatsApp
          </a>
        </div>

        {/* Compartir */}
        <button
          onClick={() => {
            const message =
              `Mirá lo que encontré en EyL Computación 👀🔥\n\n` +
              `${product.name}\n` +
              `${productUrl}`;

            if (navigator.share) {
              navigator.share({ title: product.name, text: message });
            } else {
              navigator.clipboard.writeText(message);
              alert("Enlace copiado al portapapeles 👍");
            }
          }}
          className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Compartir producto
        </button>
      </div>
    </div>
  );
}
