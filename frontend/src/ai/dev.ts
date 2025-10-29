import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-posts.ts';
import '@/ai/flows/regenerate-post-with-edits.ts';