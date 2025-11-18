import "@/styles/globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default:
      "EyL Computación | Venta y reparación de PC, notebooks e impresoras",
    template: "%s | EyL Computación",
  },
  description:
    "Tienda online de EyL Computación en Luján. Equipos, periféricos y servicio técnico especializado. San Martín 334 - Galería Abril - Local 5.",
  keywords: [
    "computación",
    "pc",
    "notebooks",
    "impresoras",
    "accesorios",
    "eyl computación",
    "servicio técnico",
    "Luján",
  ],
  metadataBase: new URL("https://www.eylcomputacion.com.ar"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "EyL Computación",
    description:
      "Equipos nuevos, periféricos y servicio técnico profesional en Luján.",
    url: "https://www.eylcomputacion.com.ar",
    siteName: "EyL Computación",
    images: ["/images/og-image.jpg"],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EyL Computación",
    description:
      "Equipos nuevos, periféricos y servicio técnico profesional en Luján.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full relative z-0`}>
        <Header />

        <main className="flex flex-col flex-grow bg-white text-black">
          {/* 🔥 OBLIGATORIO en Next 16 debido a useSearchParams */}
          <Suspense fallback={<div></div>}>{children}</Suspense>
        </main>

        <Footer />
      </body>
    </html>
  );
}
