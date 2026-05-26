import { NextRequest, NextResponse } from 'next/server'

const SVC = process.env.ORDERS_SERVICE_URL || 'http://localhost:8001'

export async function GET(req: NextRequest) {
  try {
    const user_id = new URL(req.url).searchParams.get('user_id')
    const qs = user_id ? `?user_id=${user_id}` : ''
    const res = await fetch(`${SVC}/orders/${qs}`, { signal: AbortSignal.timeout(8000) })
    const data = await res.json()
    return NextResponse.json({ ok: true, data })
  } catch {
    return NextResponse.json({ ok: false, error: 'Servicio de órdenes no disponible' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${SVC}/orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ ok: false, error: 'Servicio de órdenes no disponible' }, { status: 503 })
  }
}