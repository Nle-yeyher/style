from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Optional
import asyncio
import time
import random
import string

router = APIRouter(prefix="/payments", tags=["payments"])

class PaymentRequest(BaseModel):
    paymentMethod: str
    amount: float
    details: Optional[Any] = None

@router.post("/pay")
async def process_payment(body: PaymentRequest):
    await asyncio.sleep(1)
    transaction_id = f"txn_{int(time.time())}_{''.join(random.choices(string.ascii_lowercase + string.digits, k=9))}"
    return {
        "success": True,
        "message": "Pago procesado exitosamente",
        "transactionId": transaction_id,
        "amount": body.amount,
        "paymentMethod": body.paymentMethod,
        "status": "completed",
    }