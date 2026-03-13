
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
      price: 20 + (seed * 15) % 130, // Precio estable
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

let mockOrders: Order[] = [];

export const saveOrder = (order: Order) => {
  mockOrders.push(order);
};

export const getOrders = () => mockOrders;
