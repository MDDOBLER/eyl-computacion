import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

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
    <html lang="es" className="h-full">
      <body className={`${inter.className} h-full relative z-0`}>
        <Header />
        <main className="flex flex-col flex-grow bg-white text-black">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

