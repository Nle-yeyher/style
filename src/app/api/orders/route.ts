import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/mysql'

// GET /api/orders?user_id=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')

    let query = `
      SELECT o.*, u.name as user_name, u.email as user_email,
        GROUP_CONCAT(
          CONCAT(oi.name, '||', oi.quantity, '||', oi.price, '||', IFNULL(oi.size, ''))
          ORDER BY oi.id
          SEPARATOR ';;'
        ) as items_raw
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `
    const params: string[] = []

    if (user_id) {
      query += ' WHERE o.user_id = ?'
      params.push(user_id)
    }

    query += ' GROUP BY o.id ORDER BY o.created_at DESC'

    const [rows]: any = await pool.execute(query, params)

    const data = rows.map((row: any) => ({
      ...row,
      total: Number(row.total),
      items: row.items_raw
        ? row.items_raw.split(';;').map((entry: string) => {
            const [name, quantity, price, size] = entry.split('||')
            return {
              name,
              quantity: Number(quantity),
              price: Number(price),
              size: size || undefined,
            }
          })
        : [],
      items_raw: undefined,
    }))

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'Error al obtener órdenes' }, { status: 500 })
  }
}

// POST /api/orders  →  crear una orden nueva
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user_id, items, total } = body

    const order_number = `ORD-${Date.now()}`

    const [result]: any = await pool.execute(
      'INSERT INTO orders (user_id, order_number, total, status) VALUES (?, ?, ?, ?)',
      [user_id, order_number, total, 'completed']
    )

    const orderId = result.insertId

    for (const item of items) {
      await pool.execute(
        'INSERT INTO order_items (order_id, product_id, name, price, quantity, size) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.name, item.price, item.quantity, item.size]
      )

      await pool.execute(
        'UPDATE product_size_stock SET stock = stock - ?, sold = sold + ? WHERE product_id = ? AND size = ?',
        [item.quantity, item.quantity, item.product_id, item.size]
      )
    }

    return NextResponse.json({ ok: true, data: { id: orderId, order_number, total } }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'Error al crear orden' }, { status: 500 })
  }
}