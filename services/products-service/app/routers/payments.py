from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid

from app.models.order import Order, PayOrderRequest, OrderStatus
from app.routers.orders import _orders

router = APIRouter(prefix="/payments", tags=["payments"])


def _simulate_payment_gateway(token: str, amount: float) -> dict:
    """
    Simula la respuesta de un gateway de pago (Stripe, MercadoPago, etc.).
    En producción, aquí llamarías a la API real del proveedor.
    Tokens que empiecen con 'fail_' simulan un pago rechazado.
    """
    if token.startswith("fail_"):
        return {"success": False, "reason": "Card declined"}
    return {
        "success": True,
        "payment_id": f"pay_{uuid.uuid4().hex[:16]}",
        "amount_charged": amount,
    }


@router.post("/pay", response_model=Order)
async def pay_order(body: PayOrderRequest):
    """
    Procesa el pago de una orden.
    
    - Verifica que la orden exista y esté en estado PENDING
    - Llama al gateway de pago (simulado)
    - Actualiza el estado de la orden a PAID o FAILED
    """
    order = _orders.get(body.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Order is already '{order.status}', cannot process payment"
        )

    # Llamada al gateway de pago
    result = _simulate_payment_gateway(body.payment_token, order.total)

    order.updated_at = datetime.utcnow()

    if result["success"]:
        order.status = OrderStatus.PAID
        order.payment_id = result["payment_id"]
    else:
        order.status = OrderStatus.FAILED
        order.notes = result.get("reason", "Payment failed")

    return order


@router.post("/refund/{order_id}", response_model=Order)
async def refund_order(order_id: str):
    """
    Reembolsa una orden pagada.
    En producción llamarías a la API de tu proveedor de pagos.
    """
    order = _orders.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != OrderStatus.PAID:
        raise HTTPException(
            status_code=400,
            detail=f"Only PAID orders can be refunded, current status: '{order.status}'"
        )

    # Aquí iría la llamada real al gateway para hacer el refund
    order.status = OrderStatus.REFUNDED
    order.updated_at = datetime.utcnow()
    order.notes = f"Refunded at {order.updated_at.isoformat()}"
    return order
