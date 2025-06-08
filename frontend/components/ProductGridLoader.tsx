'use client';

import { useEffect, useState } from 'react';
import ProductGrid from './ProductGrid';

const ProductGridLoader = ({ searchQuery }: { searchQuery?: string }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resDolar = await fetch('http://localhost:1337/api/dolars');
        const dataDolar = await resDolar.json();
        const valorDolar = dataDolar.data[0].attributes.valor;

        const res = await fetch('http://localhost:1337/api/productos?populate[imagen]=*&populate[categoria]=*&populate[subcategoria]=*');
        const data = await res.json();

        const transformed = data.data.map((prod: any) => {
          const attr = prod.attributes;
          const imageUrl = attr.imagen?.data?.attributes?.url
            ? `http://localhost:1337${attr.imagen.data.attributes.url}`
            : undefined;

          return {
            id: prod.id,
            name: attr.nombre,
            image: imageUrl,
            price: parseFloat((attr.precioUSD * valorDolar).toFixed(2)),
            category: attr.categoria?.data?.attributes?.nombre || '',
            subcategory: attr.subcategoria?.data?.attributes?.nombre || '',
          };
        });

        setProducts(transformed);
      } catch (err) {
        console.error('Error cargando productos:', err);
      }
    };

    fetchData();
  }, []);

  return <ProductGrid products={products} searchQuery={searchQuery} />;
};

export default ProductGridLoader;
