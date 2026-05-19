export interface PaymentDetails {
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  transactionId?: string;
}

// Algoritmo de Luhn para validar el número de tarjeta
export const isValidLuhn = (number: string): boolean => {
  const sanitized = number.replace(/\D/g, '');
  if (sanitized.length < 13 || sanitized.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Validar fecha de expiración (MM/YY)
export const isExpiryValid = (expiry: string): boolean => {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return false;

  const [month, year] = expiry.split('/').map(Number);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = parseInt(now.getFullYear().toString().slice(-2), 10);

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

// Validar CVV
export const isCvvValid = (cvv: string): boolean => {
  return /^\d{3,4}$/.test(cvv);
};

// Función principal del simulador
export const processPayment = async (details: PaymentDetails, onProgress?: (status: string) => void): Promise<PaymentResponse> => {
  const sanitizedCard = details.cardNumber.replace(/\D/g, '');

  if (onProgress) onProgress("Conectando con el banco emisor...");
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Validaciones básicas de formato
  if (!isValidLuhn(sanitizedCard)) {
    return { success: false, message: "El número de tarjeta no es válido." };
  }

  if (!isExpiryValid(details.expiry)) {
    return { success: false, message: "La tarjeta está vencida o la fecha es inválida." };
  }

  if (!isCvvValid(details.cvv)) {
    return { success: false, message: "El código de seguridad (CVV) no es válido." };
  }

  if (onProgress) onProgress("Procesando la transacción...");
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Tarjetas mágicas para demostración (proyecto universitario)
  // 4000 0000 0000 0000 (un número de prueba común) la trataremos como fondos insuficientes
  if (sanitizedCard === '4000000000000000') {
    return { 
      success: false, 
      message: "Transacción denegada: Fondos insuficientes." 
    };
  }
  
  if (sanitizedCard.startsWith('5100')) {
     return {
        success: false,
        message: "Transacción denegada: Tarjeta bloqueada o reportada."
     }
  }

  // Cualquier otra tarjeta válida pasa exitosamente
  if (onProgress) onProgress("Confirmando pago...");
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    success: true,
    message: "Pago procesado exitosamente.",
    transactionId: `TXN-${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`
  };
};
