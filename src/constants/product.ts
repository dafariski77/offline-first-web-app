import type { Product } from '@/schemas/product'

export const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Bakso sapi',
    category: 'makanan',
    price: 80000,
    stock: 8,
  },
  {
    id: '2',
    name: 'Mie Ayam',
    category: 'makanan',
    price: 17000,
    stock: 10,
  },
  {
    id: '3',
    name: 'Mie goreng',
    category: 'makanan',
    price: 50000,
    stock: 15,
  },
  {
    id: '4',
    name: 'Nasi goreng',
    category: 'makanan',
    price: 25000,
    stock: 25,
  },
  {
    id: '5',
    name: 'Sate ayam',
    category: 'makanan',
    price: 30000,
    stock: 11,
  },
  {
    id: '6',
    name: 'Lontong sate',
    category: 'makanan',
    price: 18000,
    stock: 10,
  },
]
