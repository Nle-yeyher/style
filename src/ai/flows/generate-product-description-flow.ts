
'use server';
/**
 * @fileOverview Un flujo de Genkit para generar descripciones de productos detalladas, atractivas y optimizadas para SEO en español.
 *
 * - generateProductDescription - Función que maneja el proceso de generación de descripciones.
 * - GenerateProductDescriptionInput - Tipo de entrada para la función.
 * - GenerateProductDescriptionOutput - Tipo de salida para la función.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  name: z.string().describe('El nombre del producto.'),
  category: z.string().describe('La categoría del producto (ej: "Abrigos", "Vestidos").'),
  attributes: z.string().describe('Un string JSON que representa pares clave-valor de atributos (ej: "{ \"material\": \"Algodón\", \"estilo\": \"Casual\" }").'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('Una descripción del producto detallada, atractiva y optimizada para SEO en español.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: { schema: GenerateProductDescriptionInputSchema },
  output: { schema: GenerateProductDescriptionOutputSchema },
  prompt: `Eres un redactor experto especializado en descripciones de productos de comercio electrónico. Tu tarea es crear una descripción detallada, atractiva y optimizada para SEO en ESPAÑOL basada en la información proporcionada.

Céntrate en destacar las características clave, los beneficios y el atractivo para el público objetivo. Incorpora palabras clave de forma natural.

Nombre del Producto: {{{name}}}
Categoría: {{{category}}}
Atributos (JSON): {{{attributes}}}

---

Genera la descripción en ESPAÑOL con un máximo de 200 palabras, usando un tono persuasivo y evocador. Empieza con un gancho atractivo y concluye con una llamada a la acción o una declaración de valor.`, 
  config: {
    temperature: 0.7,
  },
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await productDescriptionPrompt(input);
    return output!;
  }
);
