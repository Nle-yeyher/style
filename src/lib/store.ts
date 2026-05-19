
import { Product, Order } from './types';
import placeholderData from '@/app/lib/placeholder-images.json';

const getProducts = (): Product[] => {
  return placeholderData.placeholderImages.map((img, index) => {
    // Usamos el ID para generar valores estables y evitar errores de hidratación
    const seed = parseInt(img.id.replace(/\D/g, '')) || index;
    return {
      id: img.id,
      name: img.description.split(' ').slice(0, 3).join(' '),
      description: img.description,
      price: 50000 + (seed * 15000) % 450000, // Precio en pesos colombianos
      stock: 5 + (seed * 7) % 45,    // Stock estable
      imageUrl: img.imageUrl,
      category: img.imageHint.split(' ')[1] || 'Prendas',
      suggestions_ids: placeholderData.placeholderImages
        .filter((_, i) => i !== index)
        .slice(0, 3)
        .map(item => item.id),
    };
  });
};

export const products = getProducts();

const mockOrders: Order[] = [];

export const saveOrder = (order: Order) => {
  mockOrders.push(order);
};

export const getOrders = () => mockOrders;
