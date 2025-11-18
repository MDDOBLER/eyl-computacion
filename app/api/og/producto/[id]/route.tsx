import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge"; // recomendado para OG

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Cliente de Supabase para el lado servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ProductoRow = {
  id: string | number;
  nombre: string;
  nombreimagen: string | null;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const { data, error } = await supabase
    .from("producto")
    .select("id, nombre, nombreimagen")
    .eq("id", id)
    .single<ProductoRow>();

  // Si no se encuentra el producto, devolvemos una imagen simple
  if (!data || error) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 32,
            width: "100%",
            height: "100%",
            background: "#b00000",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Producto no encontrado
        </div>
      ),
      size
    );
  }

  const PUBLIC_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos`;
  const imgUrl = `${PUBLIC_BASE}/${data.nombreimagen || "default.webp"}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "40px",
          background: "linear-gradient(135deg, #000000 0%, #b30000 100%)",
          color: "white",
          justifyContent: "center",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* Imagen del producto */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl}
            alt={data.nombre}
            width={350}
            height={350}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Nombre del producto */}
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {data.nombre}
        </div>

        {/* Línea de marca/local */}
        <div
          style={{
            fontSize: 24,
            textAlign: "center",
            opacity: 0.9,
          }}
        >
          EyL Computación · San Martín 334 · Luján
        </div>

        {/* Marca agua E&L abajo a la derecha */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 40,
            fontSize: 30,
            fontWeight: 700,
            opacity: 0.25,
          }}
        >
          E&amp;L
        </div>
      </div>
    ),
    size
  );
}
