
'use server';
/**
 * @fileOverview Un asistente de estilismo por IA que proporciona consejos de moda y sugerencias de ocasiones en español.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductDetailsSchema = z.object({
  name: z.string(),
  description: z.string(),
  imageURL: z.string().url(),
  category: z.string(),
});

const AiStylingAssistantInputSchema = z.object({
  mainProduct: ProductDetailsSchema,
  suggestedProducts: z.array(ProductDetailsSchema),
});
export type AiStylingAssistantInput = z.infer<typeof AiStylingAssistantInputSchema>;

const AiStylingAssistantOutputSchema = z.object({
  stylingTips: z.string().describe('Consejos de moda concisos sobre cómo combinar los productos en ESPAÑOL.'),
  occasions: z.string().describe('Lista de ocasiones adecuadas en ESPAÑOL.'),
});
export type AiStylingAssistantOutput = z.infer<typeof AiStylingAssistantOutputSchema>;

export async function aiStylingAssistant(input: AiStylingAssistantInput): Promise<AiStylingAssistantOutput> {
  return aiStylingAssistantFlow(input);
}

const aiStylingAssistantPrompt = ai.definePrompt({
  name: 'aiStylingAssistantPrompt',
  input: {schema: AiStylingAssistantInputSchema},
  output: {schema: AiStylingAssistantOutputSchema},
  prompt: `Eres un estilista profesional. Tu tarea es proporcionar consejos de moda concisos y sugerir ocasiones adecuadas para un atuendo completo en ESPAÑOL.

Producto Principal:
Nombre: {{{mainProduct.name}}}
Descripción: {{{mainProduct.description}}}

Productos Complementarios Sugeridos:
{{#each suggestedProducts}}
- Nombre: {{{this.name}}}
  Descripción: {{{this.description}}}
{{/each}}

Basándote en estos productos, proporciona en ESPAÑOL:
1. **Consejos de Estilo**: Cómo combinar las piezas de forma armoniosa.
2. **Ocasiones**: Dónde usar este look completo.

Asegúrate de que la respuesta sea en ESPAÑOL y ayude al usuario a visualizar el look completo.`,
});

const aiStylingAssistantFlow = ai.defineFlow(
  {
    name: 'aiStylingAssistantFlow',
    inputSchema: AiStylingAssistantInputSchema,
    outputSchema: AiStylingAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await aiStylingAssistantPrompt(input);
    if (!output) throw new Error('Error al generar consejos de estilismo.');
    return output;
  }
);
