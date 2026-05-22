import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/mysql'
// GET /api/users
export async function GET() {
  try {
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

// Server Action para usar desde componentes cliente
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