'use server';
/**
 * @fileOverview An AI-powered styling assistant that provides fashion tips and occasion suggestions.
 *
 * - aiStylingAssistant - A function that generates styling advice for a main product and suggested complementary items.
 * - AiStylingAssistantInput - The input type for the aiStylingAssistant function.
 * - AiStylingAssistantOutput - The return type for the aiStylingAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema for individual product details
const ProductDetailsSchema = z.object({
  name: z.string().describe('The name of the clothing product.'),
  description: z.string().describe('A detailed description of the product.'),
  imageURL: z
    .string()
    .url()
    .describe('The URL of the product image (e.g., from Cloudinary/S3). This is for contextual information; the AI processes text descriptions.'),
  category: z.string().describe('The category of the product (e.g., "dress", "jeans", "t-shirt", "accessory").'),
});

// Input schema for the AI styling assistant flow
const AiStylingAssistantInputSchema = z.object({
  mainProduct: ProductDetailsSchema.describe('The main clothing product for which styling advice is requested.'),
  suggestedProducts: z.array(ProductDetailsSchema).describe('An array of complementary products suggested for styling with the main product.'),
});
export type AiStylingAssistantInput = z.infer<typeof AiStylingAssistantInputSchema>;

// Output schema for the AI styling assistant flow
const AiStylingAssistantOutputSchema = z.object({
  stylingTips: z.string().describe('Concise and fashionable tips on how to effectively combine the main product with the suggested items, creating a cohesive look.'),
  occasions: z.string().describe('A list of suitable occasions for wearing the complete outfit, along with brief explanations of why it is appropriate for each occasion.'),
});
export type AiStylingAssistantOutput = z.infer<typeof AiStylingAssistantOutputSchema>;

// Wrapper function to call the Genkit flow
export async function aiStylingAssistant(input: AiStylingAssistantInput): Promise<AiStylingAssistantOutput> {
  return aiStylingAssistantFlow(input);
}

// Define the prompt for the AI styling assistant
const aiStylingAssistantPrompt = ai.definePrompt({
  name: 'aiStylingAssistantPrompt',
  input: {schema: AiStylingAssistantInputSchema},
  output: {schema: AiStylingAssistantOutputSchema},
  prompt: `You are a professional fashion stylist. Your task is to provide concise, fashionable styling tips and suggest suitable occasions for wearing a complete outfit. The shopper is viewing a main product and is interested in combining it with several complementary items.\n\nMain Product Details:\nName: {{{mainProduct.name}}}\nDescription: {{{mainProduct.description}}}\nCategory: {{{mainProduct.category}}}\nImage URL: {{{mainProduct.imageURL}}}\n\nSuggested Complementary Products:\n{{#each suggestedProducts}}\n- Name: {{{this.name}}}\n  Description: {{{this.description}}}\n  Category: {{{this.category}}}\n  Image URL: {{{this.imageURL}}}\n{{/each}}\n\nBased on the products above, provide the following:\n\n1.  **Styling Tips**: Offer creative and practical advice on how to combine the main product with the suggested complementary items. Focus on creating stylish, harmonious, and versatile looks.\n2.  **Occasions**: Suggest specific occasions (e.g., casual day out, evening event, office wear, weekend brunch) where this combined outfit would be appropriate. Explain briefly why it fits each occasion.\n\nEnsure your advice is fashion-forward, easy to understand, and helps the user visualize the complete look. The response should strictly adhere to the JSON output schema provided.`,
});

// Define the Genkit flow
const aiStylingAssistantFlow = ai.defineFlow(
  {
    name: 'aiStylingAssistantFlow',
    inputSchema: AiStylingAssistantInputSchema,
    outputSchema: AiStylingAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await aiStylingAssistantPrompt(input);
    if (!output) {
      throw new Error('AI styling assistant failed to generate output.');
    }
    return output;
  }
);
