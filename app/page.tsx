"use client";

import { useEffect, useMemo, useState, useDeferredValue } from "react";
import { createClient } from "@supabase/supabase-js";
import { Menu } from "lucide-react";

import CategoryMenu from "@/components/CategoryMenu";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import Loader from "@/components/Loader";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileSidebar from "@/components/MobileSidebar";
import { Product } from "@/types"; // Asegurate de tener este tipo bien definido

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Tipado del resultado crudo que viene de Supabase
type ProductoRaw = {
  id: number;
  nombre: string;
  nombreimagen: string | null;
  preciousd: number;
  categoria: { nombre?: string } | null;
  subcategoria: { nombre?: string } | null;
  subsubcategoria: { nombre?: string } | null;
  descripcion?: string | null;
  masinfo?: string | null;
  isoffer?: boolean;
};

// --- helpers ---
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function usdToArs(usd: number, dollarValue: number) {
  const raw = usd * dollarValue; // una sola conversión, sin *1000
  const rounded = Math.ceil(raw / 100) * 100; // redondeo a centenas
  return rounded;
}

function formatArs(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // 1) Traer el ÚLTIMO valor del dólar
        const { data: dolarRows, error: errorDolar } = await supabase
          .from("dolar")
          .select("valor, created_at")
          .order("created_at", { ascending: false })
          .limit(1);

        if (errorDolar || !dolarRows?.length) {
          console.error(
            "❌ No se pudo obtener el valor del dólar:",
            errorDolar
          );
          return;
        }

        const valorDolar = Number(dolarRows[0].valor);

        // 2) Traer productos
        const { data: productosData, error: errorProductos } =
          await supabase.from("producto").select(`
            id,
            nombre,
            nombreimagen,
            preciousd,
            categoria (nombre),
            subcategoria (nombre),
            subsubcategoria (nombre),
            descripcion,
            masinfo,
            isoffer
          `);

        if (errorProductos || !Array.isArray(productosData)) {
          console.error(
            "❌ No se pudieron obtener los productos:",
            errorProductos
          );
          return;
        }

        // base pública del bucket
        const PUBLIC_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos`;

        const mapped = (productosData as ProductoRaw[]).map((prod) => {
          const usd = Number(prod.preciousd || 0);

          // DEBUG opcional para detectar import mal parseado:
          // if (usd > 10000) console.warn("[precio sospechoso] preciousd:", usd, prod.nombre);

          const precioArs = usdToArs(usd, valorDolar);

          return {
            id: prod.id,
            name: prod.nombre,
            image: `${PUBLIC_BASE}/${prod.nombreimagen || "default.webp"}`,
            price: formatArs(precioArs),
            category: prod.categoria?.nombre || "",
            subcategory: prod.subcategoria?.nombre || "",
            subSubcategory: prod.subsubcategoria?.nombre || "",
            descripcion: prod.descripcion || "",
            masinfo: prod.masinfo || "",
            isOffer: prod.isoffer === true,
          };
        });

        const sorted = mapped.sort((a, b) => a.name.localeCompare(b.name));
        setProducts(sorted);
      } catch (error) {
        console.error("❌ Error general al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // --- filtro combinado y memoizado ---
  const filteredProducts = useMemo(() => {
    const q = normalize(deferredSearch).trim();
    const tokens = q.length ? q.split(/\s+/) : [];

    return products.filter((p) => {
      const catMatch =
        !selectedCategory ||
        p.category === selectedCategory ||
        p.subcategory === selectedCategory ||
        p.subSubcategory === selectedCategory;

      if (!tokens.length) return catMatch;

      const searchable = normalize(
        [
          p.name,
          p.descripcion ?? "",
          p.category ?? "",
          p.subcategory ?? "",
          p.subSubcategory ?? "",
        ].join(" ")
      );

      const textMatch = tokens.every((t) => searchable.includes(t));

      return catMatch && textMatch;
    });
  }, [products, deferredSearch, selectedCategory]);

  return (
    <main className="relative flex flex-col flex-grow bg-white text-black">
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Sticky header en desktop */}
          <div className="sticky top-0 z-[9999] shadow-md overflow-visible hidden md:block">
            <div className="bg-red-600 px-4 py-1">
              <div className="max-w-7xl mx-auto flex flex-col gap-4">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onClear={() => {
                    setSelectedCategory(null);
                    setSearchTerm("");
                  }}
                />
                <div className="flex justify-center">
                  <CategoryMenu
                    selectedCategory={selectedCategory}
                    onSelectCategory={(cat) => {
                      setSelectedCategory(cat);
                      setSearchTerm("");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile header con botón ☰ */}
          <div className="sticky top-0 z-50 block md:hidden bg-red-600 px-4 py-2 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-white"
                aria-label="Abrir menú de categorías"
              >
                <Menu size={28} />
              </button>
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => {
                  setSelectedCategory(null);
                  setSearchTerm("");
                }}
              />
            </div>
          </div>

          <div className="mt-4">
            <FeaturedCarousel />

            {!selectedCategory && searchTerm.trim() === "" && (
              <div className="mt-24">
                <div
                  className="w-full py-24 shadow-md border-t border-white text-white text-center"
                  style={{ backgroundColor: "#c0392b" }}
                >
                  <h2 className="uppercase tracking-wider font-extrabold text-5xl">
                    OFERTAS
                  </h2>
                  <p className="text-xl mt-4">
                    ¡Aprovechá los mejores precios del mes!
                  </p>
                </div>
                <div className="px-6 mt-16">
                  <ProductGrid products={products.filter((p) => p.isOffer)} />
                </div>
              </div>
            )}

            {(selectedCategory || searchTerm.trim() !== "") && (
              <>
                <div className="px-4 mt-10 mb-6 text-center">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchTerm("");
                    }}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <span className="text-xl">←</span> VER OFERTAS
                  </button>
                </div>

                <div className="px-4 mt-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Resultados{" "}
                    {selectedCategory
                      ? `en "${selectedCategory}"`
                      : "de búsqueda"}
                  </h2>
                  {filteredProducts.length > 0 ? (
                    <ProductGrid products={filteredProducts} />
                  ) : (
                    <p className="text-gray-500 text-center">
                      No hay productos disponibles para esta búsqueda.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}

      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSearchTerm("");
        }}
      />

      <WhatsAppButton />
    </main>
  );
}
