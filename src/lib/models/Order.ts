import pool from '@/lib/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
}

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt?: Date;
}

async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT product_id, name, price, quantity, size FROM order_items WHERE order_id = ?',
    [orderId]
  );
  return (rows as RowDataPacket[]).map((r) => ({
    productId: r.product_id,
    name: r.name,
    price: parseFloat(r.price),
    quantity: r.quantity,
    size: r.size,
  }));
}

// Clase que imita un documento Mongoose
class OrderDocument {
  id!: number;
  userId: number;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: string;

  constructor(data: Omit<Order, 'id'> & { id?: number }) {
    this.id          = data.id || 0;
    this.userId      = data.userId;
    this.orderNumber = data.orderNumber;
    this.items       = data.items;
    this.total       = data.total;
    this.status      = data.status || 'completed';
  }

  async save() {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.execute<ResultSetHeader>(
        'INSERT INTO orders (user_id, order_number, total, status) VALUES (?, ?, ?, ?)',
        [this.userId, this.orderNumber, this.total, this.status]
      );
      this.id = result.insertId;

      for (const item of this.items) {
        await conn.execute(
          'INSERT INTO order_items (order_id, product_id, name, price, quantity, size) VALUES (?, ?, ?, ?, ?, ?)',
          [this.id, item.productId, item.name, item.price, item.quantity, item.size ?? null]
        );
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

const OrderModel = {

  async find(filter: { userId?: number | string }): Promise<{ lean: () => Promise<Order[]>; sort: (s: any) => { lean: () => Promise<Order[]> } }> {
    const fetchOrders = async (): Promise<Order[]> => {
      let query = 'SELECT * FROM orders';
      const values: unknown[] = [];

      if (filter.userId) {
        query += ' WHERE user_id = ?';
        values.push(filter.userId);
      }
      query += ' ORDER BY created_at DESC';

      const [rows] = await pool.query<RowDataPacket[]>(query, values);

      return Promise.all(
        (rows as RowDataPacket[]).map(async (row) => {
          const items = await getOrderItems(row.id);
          return {
            id: row.id,
            userId: row.user_id,
            orderNumber: row.order_number,
            items,
            total: parseFloat(row.total),
            status: row.status,
            createdAt: row.created_at,
          };
        })
      );
    };

    return {
      lean: fetchOrders,
      sort: (_s: any) => ({ lean: fetchOrders }),
    };
  },

  // Equivalente a new OrderModel(data)
  build(data: Omit<Order, 'id'>): OrderDocument {
    return new OrderDocument(data);
  },
};

export default OrderModel;
