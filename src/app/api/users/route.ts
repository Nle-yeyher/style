import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/mysql'

// GET /api/users
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')

    if (userId) {
      const [rows]: any = await pool.execute(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [userId]
      )

      if (rows.length === 0) {
        return NextResponse.json({ ok: false, error: 'Usuario no encontrado' }, { status: 404 })
      }

      return NextResponse.json({ ok: true, data: rows[0] })
    }

    const [rows]: any = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    )
    return NextResponse.json({ ok: true, data: rows })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

// POST /api/users  →  registrar usuario nuevo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, role = 'customer' } = body

    if (!name || !email || !password)
      return NextResponse.json({ ok: false, error: 'Faltan campos requeridos' }, { status: 400 })

    // Verificar que el email no exista
    const [existing]: any = await pool.execute(
      'SELECT id FROM users WHERE email = ?', [email]
    )
    if (existing.length > 0)
      return NextResponse.json({ ok: false, error: 'El email ya está registrado' }, { status: 409 })

    const [result]: any = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    )

    return NextResponse.json({ ok: true, data: { id: result.insertId, name, email, role } }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'Error al crear usuario' }, { status: 500 })
  }
}

// PUT /api/users  →  actualizar datos de usuario
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name } = body

    if (!id || !name)
      return NextResponse.json({ ok: false, error: 'Faltan campos requeridos' }, { status: 400 })

    const [result]: any = await pool.execute(
      'UPDATE users SET name = ? WHERE id = ?',
      [name, id]
    )

    if (result.affectedRows === 0)
      return NextResponse.json({ ok: false, error: 'Usuario no encontrado' }, { status: 404 })

    const [rows]: any = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [id]
    )

    return NextResponse.json({ ok: true, user: rows[0] })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'Error al actualizar usuario' }, { status: 500 })
  }
}

// PATCH /api/users  →  cambiar contraseña
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, currentPassword, newPassword } = body

    if (!id || !currentPassword || !newPassword)
      return NextResponse.json({ ok: false, error: 'Faltan campos requeridos' }, { status: 400 })

    const [rows]: any = await pool.execute(
      'SELECT id FROM users WHERE id = ? AND password = ?',
      [id, currentPassword]
    )

    if (rows.length === 0)
      return NextResponse.json({ ok: false, error: 'Contraseña actual incorrecta' }, { status: 401 })

    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPassword, id]
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'Error al actualizar contraseña' }, { status: 500 })
  }
}
