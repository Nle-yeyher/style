
import { Product, Order } from './types';
import placeholderData from '@/app/lib/placeholder-images.json';

const getProducts = (): Product[] => {
  return placeholderData.placeholderImages.map((img, index) => ({
    id: img.id,
    name: img.description.split(' ').slice(0, 3).join(' '),
    description: img.description,
    price: Math.floor(Math.random() * 150) + 20,
    stock: Math.floor(Math.random() * 50) + 5,
    imageUrl: img.imageUrl,
    category: img.imageHint.split(' ')[1] || 'Apparel',
    suggestions_ids: placeholderData.placeholderImages
      .filter((_, i) => i !== index)
      .slice(0, 3)
      .map(item => item.id),
  }));
};

export const products = getProducts();

let mockOrders: Order[] = [];

export const saveOrder = (order: Order) => {
  mockOrders.push(order);
};

export const getOrders = () => mockOrders;
