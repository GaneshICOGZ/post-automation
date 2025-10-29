'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating initial social media posts
 * for multiple platforms based on user preferences.
 *
 * - generateInitialPosts - A function that generates social media posts.
 * - GenerateInitialPostsInput - The input type for the generateInitialPosts function.
 * - GenerateInitialPostsOutput - The return type for the generateInitialPosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialPostsInputSchema = z.object({
  topics: z.array(z.string()).describe('List of topics based on user preferences.'),
  platforms: z.array(z.enum(['Facebook', 'X', 'Instagram', 'LinkedIn'])).describe('Social media platforms.'),
});

export type GenerateInitialPostsInput = z.infer<typeof GenerateInitialPostsInputSchema>;

const PostSchema = z.object({
  platform: z.enum(['Facebook', 'X', 'Instagram', 'LinkedIn']).describe('The social media platform for this specific post.'),
  content: z.string().describe('The generated content for the post.'),
});

const GenerateInitialPostsOutputSchema = z.object({
  posts: z.array(PostSchema).describe('An array of generated social media posts, one for each requested platform.'),
});

export type GenerateInitialPostsOutput = z.infer<typeof GenerateInitialPostsOutputSchema>;

export async function generateInitialPosts(input: GenerateInitialPostsInput): Promise<GenerateInitialPostsOutput> {
  return generateInitialPostsFlow(input);
}

const generateInitialPostsPrompt = ai.definePrompt({
  name: 'generateInitialPostsPrompt',
  input: {schema: GenerateInitialPostsInputSchema},
  output: {schema: GenerateInitialPostsOutputSchema},
  prompt: `You are a social media expert. Generate a social media post for each of the following platforms: {{#each platforms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
The posts should be based on these topics: {{#each topics}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
Ensure you return a JSON object with a 'posts' array, where each object in the array has 'platform' and 'content' keys.`,
});


const generateInitialPostsFlow = ai.defineFlow(
  {
    name: 'generateInitialPostsFlow',
    inputSchema: GenerateInitialPostsInputSchema,
    outputSchema: GenerateInitialPostsOutputSchema,
  },
  async input => {
    const {output} = await generateInitialPostsPrompt(input);
    return output!;
  }
);
