"use client";

import { useEffect, useState } from "react";
import ProductGrid from "./ProductGrid";
import { Product } from "@/types";

export default function ProductGridLoader() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resDolar = await fetch("http://localhost:1337/api/dolars");
        const dataDolar = await resDolar.json();
        const valorDolar = dataDolar.data[0].attributes.valor;

        const res = await fetch(
          "http://localhost:1337/api/productos?populate[imagen]=*&populate[categoria]=*&populate[subcategoria]=*"
        );
        const data = await res.json();

        const transformed: Product[] = data.data.map((prod: any) => {
          const attr = prod.attributes;
          const imageUrl = attr.imagen?.data?.attributes?.url
            ? `http://localhost:1337${attr.imagen.data.attributes.url}`
            : undefined;

          const precioPesos = attr.precioUSD * valorDolar;
          const precioRedondeado = Math.ceil(precioPesos / 100) * 100;
          const precioFormateado = `$ ${precioRedondeado.toLocaleString(
            "es-AR"
          )}`;

          return {
            id: prod.id,
            name: attr.nombre,
            image: imageUrl,
            price: precioFormateado,
            category: attr.categoria?.data?.attributes?.nombre || "",
            subcategory: attr.subcategoria?.data?.attributes?.nombre || "",
            subSubcategory: "", // si usás subsubcategoría más adelante podés agregarlo
            descripcion: attr.descripcion || "",
            masinfo: attr.masinfo || "",
            isOffer: attr.isoffer === true,
          };
        });

        setProducts(transformed);
      } catch (err) {
        console.error("❌ Error cargando productos:", err);
      }
    };

    fetchData();
  }, []);

  return <ProductGrid products={products} />;
}
