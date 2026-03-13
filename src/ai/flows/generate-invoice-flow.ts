
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

export async function generateInvoice(input: InvoiceInput): Promise<InvoiceOutput> {
  return generateInvoiceFlow(input);
}

const invoicePrompt = ai.definePrompt({
  name: 'invoicePrompt',
  input: { schema: InvoiceInputSchema },
  output: { schema: InvoiceOutputSchema },
  prompt: `Eres un asistente administrativo de STYLESAVVY. Tu tarea es generar una factura formal y elegante en ESPAÑOL.

Detalles del Pedido:
Número de Orden: {{{orderNumber}}}
Cliente: {{{customerName}}} ({{{customerEmail}}})
Fecha: {{{date}}}
Total: ${{{total}}}

Productos:
{{#each items}}
- {{{this.name}}} x{{{this.quantity}}}: ${{{this.price}}} c/u
{{/each}}

Genera:
1. Una estructura HTML completa para la factura con estilos en línea (inline CSS) que se vea bien en clientes de correo. Usa colores suaves, bordes limpios y una tipografía clara.
2. Un resumen amigable de una oración para el cliente.

Asegúrate de que todo el texto esté en ESPAÑOL.`,
});

const generateInvoiceFlow = ai.defineFlow(
  {
    name: 'generateInvoiceFlow',
    inputSchema: InvoiceInputSchema,
    outputSchema: InvoiceOutputSchema,
  },
  async (input) => {
    const { output } = await invoicePrompt(input);
    if (!output) throw new Error('Error al generar la factura.');
    return output;
  }
);
