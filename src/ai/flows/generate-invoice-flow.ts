
'use server';
/**
 * @fileOverview Un flujo de Genkit para generar una factura detallada y profesional en español.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InvoiceInputSchema = z.object({
  orderNumber: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  items: z.array(z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
  })),
  total: z.number(),
  date: z.string(),
});
export type InvoiceInput = z.infer<typeof InvoiceInputSchema>;

const InvoiceOutputSchema = z.object({
  invoiceHtml: z.string().describe('El contenido de la factura en formato HTML amigable para correo electrónico en ESPAÑOL.'),
  summary: z.string().describe('Un breve resumen de la factura para el cuerpo del mensaje.'),
});
export type InvoiceOutput = z.infer<typeof InvoiceOutputSchema>;

const invoicePrompt = ai.definePrompt({
  name: 'invoicePrompt',
  input: { schema: InvoiceInputSchema },
  output: { schema: InvoiceOutputSchema },
  prompt: `Eres un asistente administrativo de STYLESAVVY. Tu tarea es generar una factura formal y elegante en ESPAÑOL.

Detalles del Pedido:
Número de Orden: {{{orderNumber}}}
Cliente: {{{customerName}}} ({{{customerEmail}}})
Fecha: {{{date}}}
Total: \${{{total}}}

Productos:
{{#each items}}
- {{{this.name}}} x{{{this.quantity}}}: \${{{this.price}}} c/u
{{/each}}

Genera:
1. Una estructura HTML completa para la factura con estilos en línea (inline CSS) que se vea bien en clientes de correo. Usa colores suaves, bordes limpios y una tipografía clara.
2. Un resumen amigable de una oración para el cliente.

Asegúrate de que todo el texto esté en ESPAÑOL.`,
});

interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
}

/**
 * Ejecuta una función con reintentos exponenciales para manejar errores temporales
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 1000;
  const maxDelayMs = options.maxDelayMs ?? 10000;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Si es el último intento o error no recuperable, lanzar
      if (attempt === maxAttempts - 1) {
        throw error;
      }

      // Calcular delay con exponential backoff
      const delay = Math.min(
        initialDelayMs * Math.pow(2, attempt),
        maxDelayMs
      );

      console.warn(
        `Intento ${attempt + 1}/${maxAttempts} falló. Reintentar en ${delay}ms...`,
        lastError?.message
      );

      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

const generateInvoiceFlow = ai.defineFlow(
  {
    name: 'generateInvoiceFlow',
    inputSchema: InvoiceInputSchema,
    outputSchema: InvoiceOutputSchema,
  },
  async (input) => {
    const { output } = await withRetry(
      () => invoicePrompt(input),
      {
        maxAttempts: 3,
        initialDelayMs: 1000,
        maxDelayMs: 8000,
      }
    );
    
    if (!output) throw new Error('Error al generar la factura.');
    return output;
  }
);

export async function generateInvoice(input: InvoiceInput): Promise<InvoiceOutput> {
  return generateInvoiceFlow(input);
}
