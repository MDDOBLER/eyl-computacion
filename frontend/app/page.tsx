'use client';

import CategoryMenu from '@/components/CategoryMenu';
import ProductGrid from '@/components/ProductGrid';
import SearchBar from '@/components/SearchBar';
import Loader from '@/components/Loader';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://okhvjishzlennulkzhek.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9raHZqaXNoemxlbm51bGt6aGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODIxMDYsImV4cCI6MjA2NDY1ODEwNn0.P-r2eVXZfZFjF4RlLCRG61-kMFifLM6DOG9Qlfqq6gg'
);

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data: dolarData, error: errorDolar } = await supabase
          .from('dolar')
          .select('valor')
          .single();

        if (errorDolar || !dolarData?.valor) {
          console.error('❌ No se pudo obtener el valor del dólar:', errorDolar);
          return;
        }

        const valorDolar = parseFloat(dolarData.valor);

        const { data: productosData, error: errorProductos } = await supabase
          .from('producto')
          .select(`
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
          console.error('❌ No se pudieron obtener los productos:', errorProductos);
          return;
        }

        type ProductoRaw = {
          id: number;
          nombre: string;
          nombreimagen: string | null;
          preciousd: number;
          categoria?: { nombre: string } | null;
          subcategoria?: { nombre: string } | null;
          subsubcategoria?: { nombre: string } | null;
          descripcion?: string | null;
          masinfo?: string | null;
          isoffer?: boolean;
        };

        const productos = productosData as unknown as ProductoRaw[];

        const mapped = productos.map((prod) => {
          const precioPesos = prod.preciousd * valorDolar;
          const precioRedondeado = Math.ceil(precioPesos / 100) * 100;
          const precioFormateado = `$ ${precioRedondeado.toLocaleString('es-AR')}`;

          return {
            id: prod.id,
            name: prod.nombre,
            image: prod.nombreimagen ? `/images/${prod.nombreimagen}` : undefined,
            price: precioFormateado,
            category: prod.categoria?.nombre || '',
            subcategory: prod.subcategoria?.nombre || '',
            subSubcategory: prod.subsubcategoria?.nombre || '',
            descripcion: prod.descripcion || '',
            masinfo: prod.masinfo || '',
            isOffer: prod.isoffer === true,
          };
        });

        const sorted = mapped.sort((a, b) => a.name.localeCompare(b.name));
        setProducts(sorted);
      } catch (error) {
        console.error('❌ Error general al cargar productos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const coincideBusqueda = p.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (searchTerm.trim() !== '') return coincideBusqueda;

    return (
      !selectedCategory ||
      p.category === selectedCategory ||
      p.subcategory === selectedCategory ||
      p.subSubcategory === selectedCategory
    );
  });

  return (
    <main className="relative flex flex-col flex-grow bg-white text-black">
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Sticky en desktop */}
          <div className="sticky top-0 z-[9999] shadow-md overflow-visible">
            <div className="bg-red-600 px-4 py-1">
              <div className="max-w-7xl mx-auto flex flex-col gap-4">
                <SearchBar onSearch={(query) => setSearchTerm(query)} />
                <div className="flex justify-center">
                  <CategoryMenu
                    selectedCategory={selectedCategory}
                    onSelectCategory={(cat) => {
                      setSelectedCategory(cat);
                      setSearchTerm('');
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Static en mobile */}
          <div className="block md:hidden bg-red-600 px-4 py-1 shadow-md">
            <div className="max-w-7xl mx-auto flex flex-col gap-4">
              <SearchBar onSearch={(query) => setSearchTerm(query)} />
              <div className="flex justify-center overflow-x-auto no-scrollbar">
                <CategoryMenu
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    setSearchTerm('');
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <FeaturedCarousel />

            {!selectedCategory && searchTerm.trim() === '' && (
              <div className="mt-24">
                <div
                  className="w-full py-24 shadow-md border-t border-white text-white text-center"
                  style={{ backgroundColor: '#c0392b' }}
                >
                  <h2 className="uppercase tracking-wider font-extrabold text-5xl">OFERTAS</h2>
                  <p className="text-xl mt-4">¡Aprovechá los mejores precios del mes!</p>
                </div>
                <div className="px-6 mt-16">
                  <ProductGrid products={products.filter((p) => p.isOffer)} />
                </div>
              </div>
            )}

            {(selectedCategory || searchTerm.trim() !== '') && (
              <>
                <div className="px-4 mt-10 mb-6 text-center">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchTerm('');
                    }}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <span className="text-xl">←</span> VER OFERTAS
                  </button>
                </div>

                <div className="px-4 mt-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Resultados {selectedCategory ? `en "${selectedCategory}"` : 'de búsqueda'}
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

      <WhatsAppButton />
    </main>
  );
}
