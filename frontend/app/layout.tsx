import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import Footer from '@/components/Footer';


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'E&L Computación',
  description: 'Tienda de informática en Luján. San Martín 334 - Galería Abril - Local 5.',
};

export default function RootLayout({
  children,
}: {
  
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <main className="min-h-[calc(100vh-160px)] mt-[260px] bg-white text-black">{children}</main>
        <Footer />

      
      </body>
    </html>
  );
}
