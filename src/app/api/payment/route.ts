import { NextRequest, NextResponse } from 'next/server'

const SVC = process.env.PAYMENTS_SERVICE_URL || 'http://localhost:8004'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${SVC}/payments/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ success: false, message: 'Servicio de pagos no disponible' }, { status: 503 })
  }
}