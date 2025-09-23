'use client';

import { FaWhatsapp, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-800 py-6 border-t mt-8">
      <div className="container mx-auto px-4 text-center space-y-2">
        <p className="text-sm">
          San Martín 334 - Galería Abril - Local 5 - Luján
        </p>
        <p className="text-sm">Horario de atención: Lunes a viernes de 9 a 19 hs.</p>
        <div className="flex justify-center space-x-6 mt-2">
          <a
            href="https://wa.me/+542323681800"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 text-xl"
          >
            <FaWhatsapp />
          </a>
          <a
            href="https://www.instagram.com/eylcomputacion?igsh=OWNzbnp5b3R1czBj"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-500 hover:text-pink-600 text-xl"
          >
            <FaInstagram />
          </a>
        </div>
        <p className="text-xs text-gray-500 pt-2">© {new Date().getFullYear()} E&L Computación. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
