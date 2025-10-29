'use server';
/**
 * @fileOverview AI agent that regenerates a social media post with user edits.
 *
 * - regeneratePostWithEdits - A function that handles the post regeneration process.
 * - RegeneratePostWithEditsInput - The input type for the regeneratePostWithEdits function.
 * - RegeneratePostWithEditsOutput - The return type for the regeneratePostWithEdits function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegeneratePostWithEditsInputSchema = z.object({
  originalPost: z.string().describe('The original social media post content.'),
  userEdits: z.string().describe('The edits made by the user to the original post.'),
  topic: z.string().describe('The topic of the social media post.'),
  platform: z.string().describe('The social media platform for the post.'),
  imageUri: z.string().optional().describe("An optional image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

export type RegeneratePostWithEditsInput = z.infer<typeof RegeneratePostWithEditsInputSchema>;

const RegeneratePostWithEditsOutputSchema = z.object({
  regeneratedPost: z.string().describe('The regenerated social media post content.'),
});

export type RegeneratePostWithEditsOutput = z.infer<typeof RegeneratePostWithEditsOutputSchema>;

export async function regeneratePostWithEdits(input: RegeneratePostWithEditsInput): Promise<RegeneratePostWithEditsOutput> {
  return regeneratePostWithEditsFlow(input);
}

const regeneratePostWithEditsPrompt = ai.definePrompt({
  name: 'regeneratePostWithEditsPrompt',
  input: {schema: RegeneratePostWithEditsInputSchema},
  output: {schema: RegeneratePostWithEditsOutputSchema},
  prompt: `You are a social media expert who specializes in creating engaging posts.

  The user wants to regenerate a post with some edits. Consider the original post, the user's edits, the topic, and the platform when regenerating the post.

  Original Post: {{{originalPost}}}
  User Edits: {{{userEdits}}}
  Topic: {{{topic}}}
  Platform: {{{platform}}}
  {{#if imageUri}}
  Image: {{media url=imageUri}}
  {{/if}}

  Regenerated Post:`, // Ensure the prompt ends in 'Regenerated Post:'
});

const regeneratePostWithEditsFlow = ai.defineFlow(
  {
    name: 'regeneratePostWithEditsFlow',
    inputSchema: RegeneratePostWithEditsInputSchema,
    outputSchema: RegeneratePostWithEditsOutputSchema,
  },
  async input => {
    const {output} = await regeneratePostWithEditsPrompt(input);
    return {regeneratedPost: output!.regeneratedPost};
  }
);
