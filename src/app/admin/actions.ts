"use server";

import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';
import { revalidatePath } from 'next/cache';

// ── Productos ─────────────────────────────────────────────────

export async function getProductsAction() {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM products ORDER BY id DESC'
  );

  const products = await Promise.all((rows as RowDataPacket[]).map(async (row) => {
    const [stockRows] = await pool.query<RowDataPacket[]>(
      'SELECT size, stock, sold FROM product_size_stock WHERE product_id = ? ORDER BY size',
      [row.id]
    );
    return {
      id:              String(row.id),
      name:            row.name,
      category:        row.category,
      price:           Number(row.price),
      description:     row.description,
      imageUrl:        row.image_url,
      sizes:           row.sizes ? JSON.parse(row.sizes) : [],
      sizeStock:       stockRows as { size: string; stock: number; sold: number }[],
      suggestions_ids: row.suggestions_ids ? JSON.parse(row.suggestions_ids) : [],
    };
  }));

  return products;
}

export async function addProductAction(data: any) {
  const sizes = data.sizes?.length ? data.sizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const stockPerSize = data.stock || 10;

  const [result]: any = await pool.execute(
    'INSERT INTO products (name, description, price, image_url, category, sizes) VALUES (?, ?, ?, ?, ?, ?)',
    [data.name, data.description, data.price, data.imageUrl || data.image_url, data.category, JSON.stringify(sizes)]
  );

  const productId = result.insertId;
  for (const size of sizes) {
    await pool.execute(
      'INSERT INTO product_size_stock (product_id, size, stock) VALUES (?, ?, ?)',
      [productId, size, stockPerSize]
    );
  }

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function updateProductAction(id: string, data: any) {
  await pool.execute(
    'UPDATE products SET name=?, description=?, price=?, image_url=?, category=? WHERE id=?',
    [data.name, data.description, data.price, data.imageUrl || data.image_url, data.category, id]
  );
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function deleteProductAction(id: string) {
  await pool.execute('DELETE FROM products WHERE id=?', [id]);
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
      id:          row.id,
      orderNumber: row.order_number,
      userName:    row.user_name,
      userEmail:   row.user_email,
      total:       parseFloat(row.total),
      status:      row.status,
      createdAt:   row.created_at,
      items:       items as any[],
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
    totalOrders:   Number(totalOrders),
    totalRevenue:  parseFloat(totalRevenue),
    totalUsers:    Number(totalUsers),
    totalProducts: Number(totalProducts),
    topProducts:   topProducts as any[],
    recentOrders:  recentOrders as any[],
  };
}