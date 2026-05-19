
export interface SizeStock {
  size: string;
  stock: number;
  sold: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sizes?: string[];
  sizeStock?: SizeStock[];
  suggestions_ids: string[];
  createdAt?: Date | string;
}

export interface SizeAvailability {
  size: string;
  available: number;
  sold: number;
  isAvailable: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'failed';
}
