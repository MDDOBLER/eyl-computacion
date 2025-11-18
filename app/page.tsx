"use client";

import { useEffect, useMemo, useState, useDeferredValue } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Menu } from "lucide-react";

import CategoryMenu from "@/components/CategoryMenu";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import Loader from "@/components/Loader";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileSidebar from "@/components/MobileSidebar";
import { Product } from "@/types";
import PromoTicker from "@/components/PromoTicker";

// Tipado del resultado crudo que viene de Supabase
type ProductoRaw = {
  id: string | number;
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
  const raw = usd * dollarValue;
  const rounded = Math.ceil(raw / 100) * 100;
  return rounded;
}

function formatArs(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

// Filtro seleccionado dentro de los resultados de búsqueda
type SearchFilter =
  | { type: "all" }
  | { type: "category"; value: string }
  | { type: "subcategory"; value: string }
  | { type: "subsub"; value: string };

// --- Modal de producto (overlay sobre la Home) ---
type ProductModalProps = {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
};

function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  if (!isOpen) return null;

  const whatsappMessage = `Hola! Estoy interesado en el producto: ${product.name}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Fondo semi-transparente */}
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar detalle del producto"
        onClick={onClose}
      />

      <div className="relative z-[10001] w-[92%] max-w-md rounded-2xl bg-white p-4 shadow-2xl sm:w-full sm:p-6">
        {/* Botón X de cerrar */}
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

        {/* Info */}
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

        {/* Botones principales */}
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

        {/* Botón de compartir */}
        <button
          onClick={() => {
            const url = window.location.href;

            if (navigator.share) {
              navigator.share({
                title: product.name,
                text: "Mirá este producto de EyL Computación",
                url,
              });
            } else {
              navigator.clipboard.writeText(url);
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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Estado para modal de producto
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Filtro interno que se aplica SOLO cuando hay búsqueda
  const [searchFilter, setSearchFilter] = useState<SearchFilter>({
    type: "all",
  });

  // 1) Cada vez que cambia la búsqueda, reseteamos filtro a "Todas"
  useEffect(() => {
    setSearchFilter({ type: "all" });
  }, [deferredSearch]);

  // 2) Si hay texto de búsqueda, salimos del modo categoría manual
  useEffect(() => {
    if (deferredSearch.trim() !== "") {
      setSelectedCategory(null);
    }
  }, [deferredSearch]);

  // Carga de productos + dólar
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

        const mapped: Product[] = (productosData as ProductoRaw[]).map(
          (prod): Product => {
            const usd = Number(prod.preciousd || 0);
            const precioArs = usdToArs(usd, valorDolar);

            return {
              id: prod.id as any,
              name: prod.nombre,
              image: `${PUBLIC_BASE}/${prod.nombreimagen || "default.webp"}`,
              price: formatArs(precioArs),
              category: prod.categoria?.nombre || "",
              subcategory: prod.subcategoria?.nombre || "",
              subSubcategory: prod.subsubcategoria?.nombre || "",
              descripcion: prod.descripcion || "",
              masinfo: prod.masinfo || "",
              isOffer: prod.isoffer === true,
            } as Product;
          }
        );

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

  // Sincronizar modal con ?producto= en la URL
  useEffect(() => {
    const productoParam = searchParams.get("producto");

    // Si no hay parámetro, cerrar modal
    if (!productoParam) {
      setSelectedProduct(null);
      setIsProductModalOpen(false);
      return;
    }

    // Si los productos aún no están cargados, esperamos
    if (!products || products.length === 0) return;

    // Buscar producto por ID (string o número)
    const found = products.find((p) => String(p.id) === String(productoParam));

    if (found) {
      setSelectedProduct(found);
      setIsProductModalOpen(true);
    } else {
      setSelectedProduct(null);
      setIsProductModalOpen(false);
    }
  }, [searchParams, products.length]);

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);

    // Limpiar el query param "producto"
    const params = new URLSearchParams(searchParams.toString());
    params.delete("producto");
    const qs = params.toString();
    const newUrl = qs ? `/?${qs}` : "/";

    router.push(newUrl, { scroll: false });
  };

  // --- Preparación de búsqueda ---
  const tokens = useMemo(() => {
    const q = normalize(deferredSearch).trim();
    return q ? q.split(/\s+/) : [];
  }, [deferredSearch]);

  // Resultados de búsqueda global
  const searchResults = useMemo(() => {
    if (!tokens.length) return [];
    return products.filter((p) => {
      const searchable = normalize(
        [
          p.name,
          p.descripcion ?? "",
          p.category ?? "",
          p.subcategory ?? "",
          p.subSubcategory ?? "",
        ].join(" ")
      );
      return tokens.every((t) => searchable.includes(t));
    });
  }, [products, tokens]);

  // Opciones para chips
  const { categoriesFromSearch, subcategoriesFromSearch, subsubsFromSearch } =
    useMemo(() => {
      const catSet = new Set<string>();
      const subSet = new Set<string>();
      const subSubSet = new Set<string>();
      if (tokens.length) {
        searchResults.forEach((p) => {
          if (p.category) catSet.add(p.category);
          if (p.subcategory) subSet.add(p.subcategory);
          if (p.subSubcategory) subSubSet.add(p.subSubcategory);
        });
      }
      return {
        categoriesFromSearch: Array.from(catSet).sort((a, b) =>
          a.localeCompare(b)
        ),
        subcategoriesFromSearch: Array.from(subSet).sort((a, b) =>
          a.localeCompare(b)
        ),
        subsubsFromSearch: Array.from(subSubSet).sort((a, b) =>
          a.localeCompare(b)
        ),
      };
    }, [tokens, searchResults]);

  // Tipo de chip unificado
  type Chip =
    | { k: "all"; label: "Todas" }
    | { k: "category"; label: string }
    | { k: "subcategory"; label: string }
    | { k: "subsub"; label: string };

  const chips: Chip[] = useMemo(() => {
    if (!tokens.length) return [{ k: "all", label: "Todas" }];
    return [
      { k: "all", label: "Todas" },
      ...categoriesFromSearch.map((c) => ({
        k: "category" as const,
        label: c,
      })),
      ...subcategoriesFromSearch.map((s) => ({
        k: "subcategory" as const,
        label: s,
      })),
      ...subsubsFromSearch.map((ss) => ({ k: "subsub" as const, label: ss })),
    ];
  }, [
    tokens,
    categoriesFromSearch,
    subcategoriesFromSearch,
    subsubsFromSearch,
  ]);

  // --- filtro combinado ---
  const filteredProducts = useMemo(() => {
    if (tokens.length) {
      let res = searchResults;
      if (searchFilter.type === "category") {
        res = res.filter((p) => p.category === searchFilter.value);
      } else if (searchFilter.type === "subcategory") {
        res = res.filter((p) => p.subcategory === searchFilter.value);
      } else if (searchFilter.type === "subsub") {
        res = res.filter((p) => p.subSubcategory === searchFilter.value);
      }
      return res;
    }

    // SIN búsqueda: filtramos por categoría seleccionada (si hay)
    return products.filter((p) => {
      return (
        !selectedCategory ||
        p.category === selectedCategory ||
        p.subcategory === selectedCategory ||
        p.subSubcategory === selectedCategory
      );
    });
  }, [products, tokens, searchResults, selectedCategory, searchFilter]);

  return (
    <main className="relative flex flex-col flex-grow bg-white text-black">
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Barra promo entre header y buscador */}
          <PromoTicker />

          {/* Sticky header en desktop */}
          <div className="sticky top-0 z-[9999] shadow-md overflow-visible hidden md:block">
            <div className="bg-red-600 px-0 py-1">
              {/* FILA 1: buscador */}
              <div className="max-w-7xl mx-auto px-4">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onClear={() => setSearchTerm("")}
                />
              </div>

              {/* FILA 2: menú de categorías */}
              <div className="w-full">
                <CategoryMenu
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    setSearchTerm("");
                    setSearchFilter({ type: "all" });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Mobile header */}
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
                onClear={() => setSearchTerm("")}
              />
            </div>
          </div>

          <div className="mt-4">
            <FeaturedCarousel />

            {/* Sección OFERTAS */}
            {!selectedCategory && searchTerm.trim() === "" && (
              <div className="mt-16">
                <div
                  className="w-full py-10 md:py-12 shadow-md border-t border-white text-white text-center"
                  style={{ backgroundColor: "#c0392b" }}
                >
                  <h2 className="uppercase tracking-wider font-extrabold text-4xl md:text-5xl">
                    OFERTAS
                  </h2>
                  <p className="text-base md:text-lg mt-3 md:mt-4">
                    ¡Aprovechá los mejores precios del mes!
                  </p>
                </div>
                <div className="px-6 mt-10 md:mt-12">
                  <ProductGrid products={products.filter((p) => p.isOffer)} />
                </div>
              </div>
            )}

            {/* Resultados por categoría o búsqueda */}
            {(selectedCategory || searchTerm.trim() !== "") && (
              <>
                <div className="px-4 mt-10 mb-6 text-center">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchTerm("");
                      setSearchFilter({ type: "all" });
                    }}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duración-300 transform hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <span className="text-xl">←</span> VER OFERTAS
                  </button>
                </div>

                <div className="px-4 mt-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Resultados{" "}
                    {searchTerm.trim()
                      ? "de búsqueda"
                      : selectedCategory
                      ? `en "${selectedCategory}"`
                      : ""}
                  </h2>

                  {/* Filtros SOLO con búsqueda */}
                  {searchTerm.trim() !== "" && (
                    <div className="mb-5 flex flex-wrap gap-2">
                      {chips.map((chip) => {
                        const active =
                          (chip.k === "all" && searchFilter.type === "all") ||
                          (chip.k === "category" &&
                            searchFilter.type === "category" &&
                            searchFilter.value === chip.label) ||
                          (chip.k === "subcategory" &&
                            searchFilter.type === "subcategory" &&
                            searchFilter.value === chip.label) ||
                          (chip.k === "subsub" &&
                            searchFilter.type === "subsub" &&
                            searchFilter.value === chip.label);

                        const base =
                          "px-3 py-1 rounded-full border text-sm transición-colors";
                        const selected = "bg-red-600 text-white border-red-600";
                        const idle =
                          "bg-white text-black border-gray-300 hover:border-red-500 hover:text-red-600";

                        return (
                          <button
                            key={`${chip.k}-${chip.label}`}
                            className={`${base} ${active ? selected : idle}`}
                            onClick={() => {
                              if (chip.k === "all")
                                setSearchFilter({ type: "all" });
                              else if (chip.k === "category")
                                setSearchFilter({
                                  type: "category",
                                  value: chip.label,
                                });
                              else if (chip.k === "subcategory")
                                setSearchFilter({
                                  type: "subcategory",
                                  value: chip.label,
                                });
                              else
                                setSearchFilter({
                                  type: "subsub",
                                  value: chip.label,
                                });
                            }}
                          >
                            {chip.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

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
          setSearchFilter({ type: "all" });
        }}
      />

      <WhatsAppButton />

      {/* Modal de producto vinculado al query param ?producto=ID */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={handleCloseProductModal}
        />
      )}
    </main>
  );
}
