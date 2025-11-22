"use client";

import React from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProductModal from "@/components/ProductModal";
import { Product } from "@/types";

type Props = {
  params: Promise<{ id: string }>;
};

// 🔥 Tipo correcto del producto bruto desde Supabase
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

export default function ProductPage({ params }: Props) {
  // ⭐ FIX CRÍTICO: params ahora es una PROMESA y hay que resolverla con React.use()
  const { id } = React.use(params);

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        // Traer dólar
        const { data: dolarRows } = await supabase
          .from("dolar")
          .select("valor")
          .order("created_at", { ascending: false })
          .limit(1);

        const valorDolar = Number(dolarRows?.[0]?.valor || 0);

        // Traer producto
        const { data: prodRows } = await supabase
          .from("producto")
          .select(
            `
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
          `
          )
          .eq("id", id)
          .limit(1);

        if (!prodRows?.length) {
          setProduct(null);
          return;
        }

        const prod = prodRows[0] as ProductoRaw;

        const PUBLIC_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos`;

        const usd = Number(prod.preciousd || 0);
        const priceArs = Math.ceil((usd * valorDolar) / 100) * 100;

        // 🎯 Mapeo EXACTO al Product del Home
        const mapped: Product = {
          id: prod.id,
          name: prod.nombre,
          image: `${PUBLIC_BASE}/${prod.nombreimagen || "default.webp"}`,
          price: new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0,
          }).format(priceArs),

          category: prod.categoria?.nombre || "",
          subcategory: prod.subcategoria?.nombre || "",
          subSubcategory: prod.subsubcategoria?.nombre || "",

          descripcion: prod.descripcion || "",
          masinfo: prod.masinfo || "",
          isOffer: prod.isoffer === true,
        };

        setProduct(mapped);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen text-lg">
        Cargando producto...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center w-full h-screen text-lg">
        Producto no encontrado.
      </div>
    );
  }

  return (
    <ProductModal
      product={product}
      isOpen={true}
      onClose={() => (window.location.href = "/")}
    />
  );
}
