import { Product } from '@/types'

export async function fetchProducts(): Promise<Product[]> {
  // Simulación de datos (mock)
  return [
    {
      id: 1,
      name: 'Mouse Logitech M280',
      price: 8999,
      category: 'Periféricos',
      subcategory: 'Mouse',
      image: '/productos/m280.jpg',
    },
    {
      id: 2,
      name: 'Teclado Redragon K552',
      price: 18999,
      category: 'Periféricos',
      subcategory: 'Teclado',
      image: '/productos/red.jpg',
    },
    {
      id: 3,
      name: 'Monitor Samsung 24"',
      price: 99999,
      category: 'Monitores',
      subcategory: 'LED',
      image: '/productos/samsung24.jpg',
    },
    {
      id: 4,
      name: 'Auriculares HyperX Cloud Stinger',
      price: 22999,
      category: 'Audio',
      subcategory: 'Auriculares',
      image: '/productos/cloud.jpg'
    },
  ]
}
