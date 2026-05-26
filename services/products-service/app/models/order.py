from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime
import uuid


class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class OrderItem(BaseModel):
    product_id: str
    name: str
    quantity: int
    unit_price: float


class CreateOrderRequest(BaseModel):
    customer_id: str
    items: List[OrderItem]
    currency: str = "USD"


class PayOrderRequest(BaseModel):
    order_id: str
    payment_method: str
    payment_token: str


class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    items: List[OrderItem]
    total: float
    currency: str
    status: OrderStatus = OrderStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    payment_id: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        use_enum_values = True