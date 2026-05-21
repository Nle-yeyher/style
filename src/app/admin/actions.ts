"use server";

import ProductModel from '@/lib/models/Product';
import UserModel from '@/lib/models/User';
import OrderModel from '@/lib/models/Order';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';
import { revalidatePath } from 'next/cache';

// ── Productos ─────────────────────────────────────────────────

export async function getProductsAction() {
  const docs = await (await ProductModel.find({})).lean();
  return docs.map((doc) => ({
    id: doc.id,
    name: doc.name,
    category: doc.category,
    price: doc.price,
    description: doc.description,
    imageUrl: doc.imageUrl,
    sizes: doc.sizes || [],
    sizeStock: doc.sizeStock || [],
    suggestions_ids: doc.suggestions_ids || [],
  }));
}

export async function addProductAction(data: any) {
  const sizes = data.sizes?.length ? data.sizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const stockPerSize = data.stock || 10;
  const productData = {
    ...data,
    sizes,
    sizeStock: data.sizeStock || sizes.map((size: string) => ({ size, stock: stockPerSize, sold: 0 })),
    suggestions_ids: data.suggestions_ids || [],
  };
  delete productData.stock;
  await ProductModel.create(productData);
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function updateProductAction(id: string, data: any) {
  if (data.stock && !data.sizeStock) {
    const sizes = data.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    data.sizeStock = sizes.map((size: string) => ({ size, stock: data.stock, sold: 0 }));
    delete data.stock;
  }
  if (!data.sizes) data.sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  await ProductModel.findByIdAndUpdate(id, data);
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function deleteProductAction(id: string) {
  await ProductModel.findByIdAndDelete(id);
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

// ── Usuarios ──────────────────────────────────────────────────

export async function getUsersAction() {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  return rows as { id: number; name: string; email: string; role: string; created_at: Date }[];
}

export async function deleteUserAction(id: number) {
  await pool.execute('DELETE FROM users WHERE id = ?', [id]);
  revalidatePath('/admin');
  return { success: true };
}

export async function updateUserRoleAction(id: number, role: string) {
  await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  revalidatePath('/admin');
  return { success: true };
}

// ── Pedidos ───────────────────────────────────────────────────

export async function getAllOrdersAction() {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `);

  const orders = await Promise.all((rows as RowDataPacket[]).map(async (row) => {
    const [items] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM order_items WHERE order_id = ?', [row.id]
    );
    return {
      id: row.id,
      orderNumber: row.order_number,
      userName: row.user_name,
      userEmail: row.user_email,
      total: parseFloat(row.total),
      status: row.status,
      createdAt: row.created_at,
      items: items as any[],
    };
  }));

  return orders;
}

export async function updateOrderStatusAction(id: number, status: string) {
  await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  revalidatePath('/admin');
  return { success: true };
}

// ── Estadísticas ──────────────────────────────────────────────

export async function getStatsAction() {
  const [[{ totalOrders }]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as totalOrders FROM orders') as any;
  const [[{ totalRevenue }]] = await pool.query<RowDataPacket[]>('SELECT COALESCE(SUM(total), 0) as totalRevenue FROM orders WHERE status = "completed"') as any;
  const [[{ totalUsers }]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as totalUsers FROM users WHERE role = "customer"') as any;
  const [[{ totalProducts }]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as totalProducts FROM products') as any;

  const [topProducts] = await pool.query<RowDataPacket[]>(`
    SELECT oi.name, SUM(oi.quantity) as total_sold, SUM(oi.price * oi.quantity) as revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'completed'
    GROUP BY oi.name
    ORDER BY total_sold DESC
    LIMIT 5
  `);

  const [recentOrders] = await pool.query<RowDataPacket[]>(`
    SELECT o.order_number, o.total, o.status, o.created_at, u.name as user_name
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
    LIMIT 5
  `);

  return {
    totalOrders: Number(totalOrders),
    totalRevenue: parseFloat(totalRevenue),
    totalUsers: Number(totalUsers),
    totalProducts: Number(totalProducts),
    topProducts: topProducts as any[],
    recentOrders: recentOrders as any[],
  };
}
