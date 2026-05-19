import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentMethod, amount, details } = body;

    // Simular procesamiento de pago - siempre exitoso
    // Acepta cualquier tipo de pago sin validación real

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generar ID de transacción simulado
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      message: 'Pago procesado exitosamente',
      transactionId,
      amount,
      paymentMethod,
      status: 'completed'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error al procesar el pago' },
      { status: 500 }
    );
  }
}