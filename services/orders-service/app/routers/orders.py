from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import List
import uuid

from app.models.order import Order, CreateOrderRequest, OrderStatus

router = APIRouter(prefix="/orders", tags=["orders"])

# En producción esto sería una base de datos (PostgreSQL, MongoDB, etc.)
_orders: dict[str, Order] = {}


@router.post("/", response_model=Order, status_code=201)
async def create_order(body: CreateOrderRequest):
    """Crea una nueva orden y calcula el total."""
    total = sum(item.quantity * item.unit_price for item in body.items)
    order = Order(
        customer_id=body.customer_id,
        items=body.items,
        total=round(total, 2),
        currency=body.currency,
    )
    _orders[order.id] = order
    return order


@router.get("/", response_model=List[Order])
async def list_orders(customer_id: str | None = None):
    """Lista todas las órdenes, opcionalmente filtrando por cliente."""
    orders = list(_orders.values())
    if customer_id:
        orders = [o for o in orders if o.customer_id == customer_id]
    return orders


@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Retorna una orden por su ID."""
    order = _orders.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/cancel", response_model=Order)
async def cancel_order(order_id: str):
    """Cancela una orden si está en estado PENDING."""
    order = _orders.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel order with status '{order.status}'"
        )
    order.status = OrderStatus.CANCELLED
    order.updated_at = datetime.utcnow()
    return order


@router.delete("/{order_id}", status_code=204)
async def delete_order(order_id: str):
    """Elimina una orden (solo en desarrollo)."""
    if order_id not in _orders:
        raise HTTPException(status_code=404, detail="Order not found")
    del _orders[order_id]
