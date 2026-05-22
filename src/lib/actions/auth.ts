'use server'

import pool from '@/lib/mysql'

export async function loginUserAction(email: string, password: string) {
  try {
    const [rows]: any = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE email = ? AND password = ?',
      [email, password]
    )
    if (rows.length === 0) return { success: false, error: 'Credenciales incorrectas' }
    return { success: true, user: rows[0] }
  } catch {
    return { success: false, error: 'Error del servidor' }
  }
}

export async function registerUserAction(name: string, email: string, password: string) {
  try {
    const [existing]: any = await pool.execute(
      'SELECT id FROM users WHERE email = ?', [email]
    )
    if (existing.length > 0) return { success: false, error: 'El email ya está registrado' }

    const [result]: any = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, 'customer']
    )
    return { success: true, user: { id: result.insertId, name, email, role: 'customer' } }
  } catch {
    return { success: false, error: 'Error del servidor' }
  }
}

export async function saveOrderAction(data: {
  user_id: number;
  items: { product_id: number; name: string; price: number; quantity: number; size: string }[];
  total: number;
}) {
  try {
    const order_number = `ORD-${Date.now()}`
    const [result]: any = await pool.execute(
      'INSERT INTO orders (user_id, order_number, total, status) VALUES (?, ?, ?, ?)',
      [data.user_id, order_number, data.total, 'completed']
    )
    const orderId = result.insertId

    for (const item of data.items) {
      await pool.execute(
        'INSERT INTO order_items (order_id, product_id, name, price, quantity, size) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.name, item.price, item.quantity, item.size]
      )
    }

    return { success: true, order_number }
  } catch {
    return { success: false, error: 'Error al guardar la orden' }
  }
}

export async function updateProductStockAction(product_id: number, size: string, quantity: number) {
  try {
    await pool.execute(
      'UPDATE product_size_stock SET stock = stock - ?, sold = sold + ? WHERE product_id = ? AND size = ?',
      [quantity, quantity, product_id, size]
    )
    return { success: true }
  } catch {
    return { success: false, error: 'Error al actualizar stock' }
  }
}