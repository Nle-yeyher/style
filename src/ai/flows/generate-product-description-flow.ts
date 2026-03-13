'use server';
/**
 * @fileOverview A Genkit flow to automatically generate detailed, engaging, and SEO-friendly product descriptions.
 *
 * - generateProductDescription - A function that handles the product description generation process.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  name: z.string().describe('The name of the product.'),
  category: z.string().describe('The category of the product (e.g., "Outerwear", "Dresses").'),
  attributes: z.string().describe('A JSON string representing key-value pairs of product attributes (e.g., "{ \"material\": \"Cotton\", \"style\": \"Casual\" }").'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('A detailed, engaging, and SEO-friendly product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: { schema: GenerateProductDescriptionInputSchema },
  output: { schema: GenerateProductDescriptionOutputSchema },
  prompt: `You are an expert copywriter specializing in e-commerce product descriptions. Your task is to create a detailed, engaging, and SEO-friendly product description based on the provided product information.

Focus on highlighting key features, benefits, and appeal to the target audience. Incorporate keywords naturally for SEO.

Product Name: {{{name}}}
Category: {{{category}}}
Attributes (JSON string): {{{attributes}}}

---

Generate the product description in a maximum of 200 words, using a persuasive and evocative tone. Start with an engaging hook and conclude with a call to action or a statement about its value.`, 
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
